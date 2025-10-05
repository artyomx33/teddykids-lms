import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Hybrid Sync Function - Fast sync + smart processing
// Step 1: Sync raw data (ALL employees)
// Step 2: Process first 5 immediately (instant UI feedback)
// Step 3: Queue the rest (background processing)

function getAPIKey(): string {
  const key = Deno.env.get('EMPLOYES_API_KEY');
  if (!key) throw new Error('EMPLOYES_API_KEY not set');
  return key;
}

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

async function generateHash(data: any): Promise<string> {
  const jsonString = JSON.stringify(data);
  const msgUint8 = new TextEncoder().encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
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
    
    const employesApiKey = getAPIKey();
    const BASE_URL = 'https://connect.employes.nl/v4';
    const COMPANY_ID = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
    
    console.log('🚀 HYBRID SYNC STARTING...');
    
    const now = new Date().toISOString();
    const errors: string[] = [];
    const processedEmployeeIds: string[] = [];
    
    // Metrics
    let employeesProcessed = 0;
    let employeesSkipped = 0;
    let historyProcessed = 0;
    let historySkipped = 0;
    let immediatelyProcessed = 0;
    let queuedForProcessing = 0;

    // ========================================
    // STEP 1: FETCH & STORE RAW DATA (FAST!)
    // ========================================
    
    console.log('📥 Fetching all employees...');
    
    // Fetch all employees (with pagination)
    let allEmployees: any[] = [];
    let currentPage = 1;
    let totalPages = 1;
    
    do {
      const employeesListUrl = `${BASE_URL}/${COMPANY_ID}/employees?page=${currentPage}&per_page=100`;
      
      const employeesListResponse = await fetch(employeesListUrl, {
        headers: {
          'Authorization': `Bearer ${employesApiKey}`,
          'Accept': 'application/json'
        }
      });
      
      if (!employeesListResponse.ok) {
        throw new Error(`Failed to fetch employees: ${employeesListResponse.status}`);
      }
      
      const employeesResponse = await employeesListResponse.json();
      const pageData = employeesResponse.data || [];
      allEmployees = allEmployees.concat(pageData);
      
      if (currentPage === 1) {
        totalPages = employeesResponse.pages || 1;
        console.log(`📄 Total pages to fetch: ${totalPages}`);
      }
      
      currentPage++;
    } while (currentPage <= totalPages);
    
    const employeesList = allEmployees;
    console.log(`✅ Fetched ${employeesList.length} employees`);
    
    // Process each employee
    for (const emp of employeesList) {
      try {
        const employeeId = emp.id;
        processedEmployeeIds.push(employeeId);
        
        // Fetch employee details
        const employeeUrl = `${BASE_URL}/${COMPANY_ID}/employees/${employeeId}`;
        const employeeResponse = await fetch(employeeUrl, {
          headers: {
            'Authorization': `Bearer ${employesApiKey}`,
            'Accept': 'application/json'
          }
        });
        
        if (!employeeResponse.ok) {
          errors.push(`Employee ${employeeId}: ${employeeResponse.status}`);
          continue;
        }
        
        const employeeData = await employeeResponse.json();
        const dataHash = await generateHash(employeeData);
        
        // Check if this exact data already exists
        const { data: existing } = await supabase
          .from('employes_raw_data')
          .select('id')
          .eq('employee_id', employeeId)
          .eq('endpoint', '/employee')
          .eq('data_hash', dataHash)
          .eq('is_latest', true)
          .maybeSingle();
        
        if (existing) {
          // Data unchanged - just update last_verified_at
          await supabase
            .from('employes_raw_data')
            .update({ last_verified_at: now })
            .eq('id', existing.id);
          
          employeesSkipped++;
        } else {
          // New or changed data
          // Mark old as not latest
          await supabase
            .from('employes_raw_data')
            .update({ is_latest: false })
            .eq('employee_id', employeeId)
            .eq('endpoint', '/employee')
            .eq('is_latest', true);
          
          // Insert new version
          await supabase
            .from('employes_raw_data')
            .insert({
              employee_id: employeeId,
              endpoint: '/employee',
              api_response: employeeData,
              data_hash: dataHash,
              collected_at: now,
              last_verified_at: now,
              effective_from: now,
              effective_to: null,
              is_latest: true,
              confidence_score: 1.0
            });
          
          employeesProcessed++;
        }
      } catch (error: any) {
        errors.push(`Employee ${emp.id}: ${error.message}`);
      }
    }
    
    // Fetch employment history for all employees
    console.log('📚 Fetching employment history...');
    
    for (const emp of employeesList) {
      try {
        const employeeId = emp.id;
        
        const employmentsUrl = `${BASE_URL}/${COMPANY_ID}/employees/${employeeId}/employments`;
        const employmentsResponse = await fetch(employmentsUrl, {
          headers: {
            'Authorization': `Bearer ${employesApiKey}`,
            'Accept': 'application/json'
          }
        });
        
        if (!employmentsResponse.ok) {
          errors.push(`Employments ${employeeId}: ${employmentsResponse.status}`);
          continue;
        }
        
        const employmentsData = await employmentsResponse.json();
        const employmentsList = employmentsData?.data || employmentsData;
        
        if (!Array.isArray(employmentsList) || employmentsList.length === 0) {
          continue;
        }
        
        for (const employment of employmentsList) {
          const dataHash = await generateHash(employment);
          
          const { data: existing } = await supabase
            .from('employes_raw_data')
            .select('id')
            .eq('employee_id', employeeId)
            .eq('endpoint', '/employments')
            .eq('data_hash', dataHash)
            .eq('is_latest', true)
            .maybeSingle();
          
          if (existing) {
            await supabase
              .from('employes_raw_data')
              .update({ last_verified_at: now })
              .eq('id', existing.id);
            
            historySkipped++;
          } else {
            // Mark old as not latest
            await supabase
              .from('employes_raw_data')
              .update({ is_latest: false })
              .eq('employee_id', employeeId)
              .eq('endpoint', '/employments')
              .eq('is_latest', true);
            
            const effectiveFrom = employment.start_date || now;
            
            await supabase
              .from('employes_raw_data')
              .insert({
                employee_id: employeeId,
                endpoint: '/employments',
                api_response: employment,
                data_hash: dataHash,
                collected_at: now,
                last_verified_at: now,
                effective_from: effectiveFrom,
                effective_to: null,
                is_latest: true,
                confidence_score: 1.0
              });
            
            historyProcessed++;
          }
        }
        
      } catch (error: any) {
        errors.push(`History ${emp.id}: ${error.message}`);
      }
    }
    
    // ========================================
    // STEP 2: HYBRID PROCESSING
    // ========================================
    
    console.log('🎯 HYBRID PROCESSING...');
    
    // Determine if user is waiting (based on context)
    const body = await req.json().catch(() => ({}));
    const isUserWaiting = body.mode !== 'background';
    
    if (isUserWaiting && processedEmployeeIds.length > 0) {
      console.log('👤 User is waiting - processing ALL employees immediately...');
      
      // Process ALL employees - it's fast enough!
      try {
        const { data: processResult } = await supabase.functions.invoke('process-timeline', {
          body: {
            employee_ids: processedEmployeeIds,
            priority: 10, // High priority
            source: 'sync_immediate'
          }
        });
        
        immediatelyProcessed = processedEmployeeIds.length;
        console.log(`✅ Processed ALL ${immediatelyProcessed} employees immediately`);
        console.log(`   Events created: ${processResult?.result?.events_created || 0}`);
      } catch (error: any) {
        console.error('⚠️ Processing failed:', error);
        errors.push(`Timeline processing: ${error.message}`);
      }
    } else {
      // Background sync or no changes - queue everything
      console.log('🌙 Background mode - queueing all for processing...');
      
      if (processedEmployeeIds.length > 0) {
        const { error: queueError } = await supabase
          .from('processing_queue')
          .insert({
            job_type: 'timeline_processing',
            payload: {
              employee_ids: processedEmployeeIds,
              trigger: 'sync_background',
              sync_id: crypto.randomUUID()
            },
            priority: 3, // Low priority
            created_by: 'sync'
          });
        
        if (!queueError) {
          queuedForProcessing = processedEmployeeIds.length;
          console.log(`📋 Queued all ${queuedForProcessing} employees for processing`);
          
          // AUTO-TRIGGER: Start processing the queue immediately (non-blocking)
          console.log('🚀 Auto-triggering queue processor...');
          supabase.functions.invoke('process-queue', { body: {} })
            .then(() => console.log('✅ Queue processor triggered'))
            .catch((err) => console.error('⚠️ Queue trigger failed:', err.message));
        }
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log('✅ SYNC COMPLETE!');
    console.log(`   Raw Data: ${employeesProcessed} new, ${employeesSkipped} unchanged`);
    console.log(`   History: ${historyProcessed} new, ${historySkipped} unchanged`);
    console.log(`   Timeline: ${immediatelyProcessed} employees processed${queuedForProcessing > 0 ? `, ${queuedForProcessing} queued` : ''}`);
    console.log(`   Duration: ${duration}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${employeesList.length} employees`,
        result: {
          employees_processed: employeesProcessed,
          employees_skipped: employeesSkipped,
          history_processed: historyProcessed,
          history_skipped: historySkipped,
          total_employees: employeesList.length,
          immediately_processed: immediatelyProcessed,
          queued_for_processing: queuedForProcessing,
          errors: errors.slice(0, 10), // Limit errors
          duration_ms: duration
        },
        hybrid_processing: {
          immediate: immediatelyProcessed,
          queued: queuedForProcessing,
          mode: isUserWaiting ? 'all_immediate' : 'background'
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
    
  } catch (error: any) {
    console.error('❌ SYNC ERROR:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
        errorDetails: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});
