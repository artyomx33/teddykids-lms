// ╔════════════════════════════════════════════════════════════════════╗
// ║  EMPLOYES RETRY HANDLER                                            ║
// ║  Self-healing system that retries failed data collections          ║
// ║  Philosophy: Never give up, always try again                       ║
// ╚════════════════════════════════════════════════════════════════════╝

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface RetryResult {
  total_processed: number;
  successful_retries: number;
  failed_retries: number;
  max_retries_reached: number;
  details: Array<{
    employee_id: string;
    endpoint: string;
    success: boolean;
    retry_attempt: number;
    error?: string;
  }>;
}

interface FlexibleFetchResult {
  success: boolean;
  data: any;
  issues: string[];
  httpStatus: number | null;
  responseTimeMs: number;
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function getAPIKey(): string {
  const key = Deno.env.get('EMPLOYES_API_KEY');
  if (!key) throw new Error('EMPLOYES_API_KEY not set');
  return key;
}

function getServiceRoleKey(): string {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return key;
}

function getSupabaseUrl(): string {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) throw new Error('SUPABASE_URL not set');
  return url;
}

// ═══════════════════════════════════════════════════════════════════
// FLEXIBLE FETCH WITH RETRY
// ═══════════════════════════════════════════════════════════════════

async function flexibleFetch(
  url: string,
  apiKey: string,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<FlexibleFetchResult> {
  const issues: string[] = [];
  let httpStatus: number | null = null;
  const startTime = Date.now();
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Retry-Attempt': attempt.toString()
        },
        signal: AbortSignal.timeout(15000)
      });
      
      httpStatus = response.status;
      
      if (response.ok) {
        const data = await response.json();
        const responseTimeMs = Date.now() - startTime;
        
        if (attempt > 0) {
          issues.push(`Succeeded on retry ${attempt}`);
        }
        
        return {
          success: true,
          data: data.data || data,
          issues,
          httpStatus,
          responseTimeMs
        };
      }
      
      if (response.status === 404) {
        return {
          success: false,
          data: { error: 'not_found', status: 404 },
          issues: ['Resource not found (404)'],
          httpStatus,
          responseTimeMs: Date.now() - startTime
        };
      }
      
      if (response.status === 403) {
        return {
          success: false,
          data: { error: 'forbidden', status: 403 },
          issues: ['Access forbidden (403)'],
          httpStatus,
          responseTimeMs: Date.now() - startTime
        };
      }
      
      throw new Error(`HTTP ${response.status}`);
      
    } catch (error: any) {
      issues.push(`Attempt ${attempt + 1} failed: ${error.message}`);
      
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.log(`⏳ Waiting ${delayMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  return {
    success: false,
    data: null,
    issues,
    httpStatus,
    responseTimeMs: Date.now() - startTime
  };
}

// ═══════════════════════════════════════════════════════════════════
// RETRY LOGIC
// ═══════════════════════════════════════════════════════════════════

async function retryPartialRecord(
  supabase: any,
  apiKey: string,
  record: any
): Promise<{ success: boolean; error?: string }> {
  const { id, employee_id, endpoint, retry_count } = record;
  
  console.log(`🔄 Retrying: ${employee_id} (${endpoint}) - Attempt ${retry_count + 1}`);
  
  // Build URL based on endpoint
  const baseUrl = 'https://connect.employes.nl/v4';
  const companyId = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
  
  let url: string;
  if (endpoint === '/employee') {
    url = `${baseUrl}/${companyId}/employees/${employee_id}`;
  } else if (endpoint === '/employments') {
    url = `${baseUrl}/${companyId}/employees/${employee_id}/employments`;
  } else {
    return { success: false, error: 'Unknown endpoint' };
  }
  
  // Attempt fetch with retry
  const fetchResult = await flexibleFetch(url, apiKey, 3, 1000);
  
  const now = new Date().toISOString();
  
  if (fetchResult.success) {
    // SUCCESS! Update the record
    console.log(`✅ Retry succeeded for ${employee_id}`);
    
    // Update the failed record
    await supabase
      .from('employes_raw_data')
      .update({
        api_response: fetchResult.data,
        is_partial: false,
        retry_succeeded_at: now,
        last_retry_at: now,
        http_status_code: fetchResult.httpStatus,
        error_message: null,
        collection_issues: fetchResult.issues.length > 0 ? fetchResult.issues : null,
        confidence_score: 1.0
      })
      .eq('id', id);
    
    // Log successful retry
    await supabase
      .from('employes_retry_log')
      .insert({
        raw_data_id: id,
        employee_id,
        endpoint,
        retry_attempt: retry_count + 1,
        success: true,
        http_status_code: fetchResult.httpStatus,
        response_time_ms: fetchResult.responseTimeMs,
        triggered_by: 'retry_handler'
      });
    
    return { success: true };
    
  } else {
    // Still failing
    console.log(`⚠️ Retry failed for ${employee_id}: ${fetchResult.issues.join('; ')}`);
    
    const newRetryCount = retry_count + 1;
    const maxRetries = 3;
    
    // Update retry count and timestamp
    await supabase
      .from('employes_raw_data')
      .update({
        retry_count: newRetryCount,
        last_retry_at: now,
        http_status_code: fetchResult.httpStatus,
        error_message: fetchResult.issues.join('; '),
        collection_issues: fetchResult.issues
      })
      .eq('id', id);
    
    // Log failed retry
    await supabase
      .from('employes_retry_log')
      .insert({
        raw_data_id: id,
        employee_id,
        endpoint,
        retry_attempt: newRetryCount,
        success: false,
        http_status_code: fetchResult.httpStatus,
        error_message: fetchResult.issues.join('; '),
        response_time_ms: fetchResult.responseTimeMs,
        triggered_by: 'retry_handler'
      });
    
    return { 
      success: false, 
      error: `Max retries: ${newRetryCount >= maxRetries}` 
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════

serve(async (req: Request) => {
  const startTime = Date.now();
  
  try {
    console.log('🔁 RETRY HANDLER STARTED');
    
    // Initialize
    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = getServiceRoleKey();
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const apiKey = getAPIKey();
    
    // Parse request
    const { limit = 10, max_retry_count = 3 } = await req.json().catch(() => ({}));
    
    console.log(`📋 Processing up to ${limit} partial records`);
    console.log(`🔢 Max retry count: ${max_retry_count}`);
    
    // Get records that need retry
    const { data: partialRecords, error: fetchError } = await supabase
      .from('employes_raw_data')
      .select('*')
      .eq('is_partial', true)
      .lt('retry_count', max_retry_count)
      .or(`last_retry_at.is.null,last_retry_at.lt.${new Date(Date.now() - 60 * 60 * 1000).toISOString()}`)
      .order('retry_count', { ascending: true })
      .order('last_retry_at', { ascending: true, nullsFirst: true })
      .limit(limit);
    
    if (fetchError) {
      throw new Error(`Failed to fetch partial records: ${fetchError.message}`);
    }
    
    if (!partialRecords || partialRecords.length === 0) {
      console.log('✅ No partial records need retry');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No records need retry',
          result: {
            total_processed: 0,
            successful_retries: 0,
            failed_retries: 0,
            max_retries_reached: 0,
            details: []
          },
          duration_ms: Date.now() - startTime
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`📊 Found ${partialRecords.length} records to retry`);
    
    // Process each record
    const result: RetryResult = {
      total_processed: partialRecords.length,
      successful_retries: 0,
      failed_retries: 0,
      max_retries_reached: 0,
      details: []
    };
    
    for (const record of partialRecords) {
      const retryResult = await retryPartialRecord(supabase, apiKey, record);
      
      if (retryResult.success) {
        result.successful_retries++;
      } else {
        result.failed_retries++;
        if (record.retry_count + 1 >= max_retry_count) {
          result.max_retries_reached++;
        }
      }
      
      result.details.push({
        employee_id: record.employee_id,
        endpoint: record.endpoint,
        success: retryResult.success,
        retry_attempt: record.retry_count + 1,
        error: retryResult.error
      });
    }
    
    console.log('✅ RETRY HANDLER COMPLETE');
    console.log(`Total processed: ${result.total_processed}`);
    console.log(`Successful: ${result.successful_retries}`);
    console.log(`Failed: ${result.failed_retries}`);
    console.log(`Max retries reached: ${result.max_retries_reached}`);
    console.log(`Duration: ${Date.now() - startTime}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        result,
        duration_ms: Date.now() - startTime
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('❌ RETRY HANDLER ERROR:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        duration_ms: Date.now() - startTime
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

console.log('🔁 Employes Retry Handler loaded');
