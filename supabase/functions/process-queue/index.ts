import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Queue Processor - Processes background jobs from processing_queue table
// Can be triggered manually or by cron job

function getSupabaseUrl(): string {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) throw new Error('SUPABASE_URL not set');
  return url;
}

function getServiceRoleKey(): string {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return key;
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }
  
  const startTime = Date.now();
  
  try {
    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = getServiceRoleKey();
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    console.log('🔄 Queue processor starting...');
    
    // Claim a job atomically using our database function
    const { data: job, error: claimError } = await supabase
      .rpc('claim_next_job', { p_job_type: 'timeline_processing' });
    
    if (claimError) {
      console.error('Failed to claim job:', claimError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to claim job',
          details: claimError
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!job) {
      console.log('No jobs in queue');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No jobs to process'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`📋 Processing job ${job.id} (attempt ${job.attempts}/${job.max_attempts})`);
    console.log(`   Type: ${job.job_type}`);
    console.log(`   Created: ${job.created_at}`);
    
    const jobStartTime = Date.now();
    
    try {
      // Process based on job type
      let result: any = null;
      
      if (job.job_type === 'timeline_processing') {
        // Invoke the timeline processor
        const { data, error } = await supabase.functions.invoke('process-timeline', {
          body: {
            ...job.payload,
            source: 'queue'
          }
        });
        
        if (error) {
          throw error;
        }
        
        result = data;
      } else {
        throw new Error(`Unknown job type: ${job.job_type}`);
      }
      
      const processingTime = Date.now() - jobStartTime;
      
      // Mark job as completed
      const { error: updateError } = await supabase
        .from('processing_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result,
          processing_time_ms: processingTime
        })
        .eq('id', job.id);
      
      if (updateError) {
        console.error('Failed to update job status:', updateError);
      }
      
      console.log(`✅ Job ${job.id} completed in ${processingTime}ms`);
      
      return new Response(
        JSON.stringify({
          success: true,
          job_id: job.id,
          result,
          processing_time_ms: processingTime
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
      
    } catch (error: any) {
      const processingTime = Date.now() - jobStartTime;
      console.error(`❌ Job ${job.id} failed:`, error);
      
      // Determine if we should retry
      const shouldRetry = job.attempts < job.max_attempts;
      
      // Update job status
      const { error: updateError } = await supabase
        .from('processing_queue')
        .update({
          status: shouldRetry ? 'pending' : 'failed',
          error_message: error.message,
          error_details: {
            name: error.name,
            stack: error.stack,
            attempt: job.attempts
          },
          processing_time_ms: processingTime
        })
        .eq('id', job.id);
      
      if (updateError) {
        console.error('Failed to update job status:', updateError);
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          job_id: job.id,
          error: error.message,
          will_retry: shouldRetry
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error: any) {
    console.error('❌ Queue processor error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
