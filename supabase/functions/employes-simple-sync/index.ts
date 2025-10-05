import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

function getNestedValue(obj: any, path: string): any {
  if (!obj) return null;
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return null;
    }
  }
  return value;
}

async function detectAndStoreChanges(
  supabase: any,
  employeeId: string,
  newData: any,
  oldData: any | null,
  endpoint: string
): Promise<number> {
  if (!oldData) {
    // New employee - create "employee_added" event
    await supabase.from('employes_timeline_v2').insert({
      employee_id: employeeId,
      event_type: 'employee_added',
      event_date: new Date().toISOString(),
      event_title: 'Employee Added',
      event_description: `${newData.first_name} ${newData.surname} was added to the system`,
      event_data: { status: newData.status }
    });
    return 1;
  }
  
  const changes = [];
  const fieldsToTrack = [
    { path: 'status', label: 'Status' },
    { path: 'email', label: 'Email' },
    { path: 'phone_number', label: 'Phone' },
    { path: 'employment.salary.hour_wage', label: 'Hourly Wage' },
    { path: 'employment.salary.month_wage', label: 'Monthly Wage' },
    { path: 'employment.contract.hours_per_week', label: 'Hours/Week' },
    { path: 'employment.contract.start_date', label: 'Contract Start' },
    { path: 'employment.contract.end_date', label: 'Contract End' }
  ];
  
  for (const field of fieldsToTrack) {
    const oldValue = getNestedValue(oldData, field.path);
    const newValue = getNestedValue(newData, field.path);
    
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        employee_id: employeeId,
        endpoint,
        field_path: field.path,
        old_value: oldValue,
        new_value: newValue,
        change_type: 'updated',
        detected_at: new Date().toISOString(),
        is_significant: true,
        metadata: { field_label: field.label }
      });
    }
  }
  
  if (changes.length === 0) return 0;
  
  // Store changes
  const { data: insertedChanges, error: changesError } = await supabase
    .from('employes_changes')
    .insert(changes)
    .select();
  
  if (changesError) {
    console.error('Failed to insert changes:', changesError);
    return 0;
  }
  
  // Create timeline events
  const timelineEvents = [];
  for (const change of insertedChanges || changes) {
    let eventType = 'data_update';
    let eventTitle = 'Data Updated';
    
    if (change.field_path.includes('salary')) {
      eventType = 'salary_change';
      const oldVal = change.old_value ? Number(change.old_value) : 0;
      const newVal = change.new_value ? Number(change.new_value) : 0;
      const diff = newVal - oldVal;
      const pct = oldVal > 0 ? ((diff / oldVal) * 100).toFixed(1) : '0';
      eventTitle = diff > 0 ? 'Salary Increase' : 'Salary Change';
      eventTitle += ` (${diff > 0 ? '+' : ''}${pct}%)`;
    } else if (change.field_path.includes('hours_per_week')) {
      eventType = 'hours_change';
      eventTitle = `Hours Changed: ${change.old_value} → ${change.new_value}`;
    } else if (change.field_path.includes('contract')) {
      eventType = 'contract_change';
      eventTitle = `Contract Updated`;
    } else if (change.field_path === 'status') {
      eventType = 'status_change';
      eventTitle = `Status: ${change.old_value} → ${change.new_value}`;
    }
    
    timelineEvents.push({
      employee_id: employeeId,
      event_type: eventType,
      event_date: change.detected_at,
      event_title: eventTitle,
      event_description: `${change.metadata?.field_label || change.field_path}: ${change.old_value} → ${change.new_value}`,
      event_data: change,
      change_id: change.id
    });
  }
  
  if (timelineEvents.length > 0) {
    const { error: timelineError } = await supabase
      .from('employes_timeline_v2')
      .insert(timelineEvents);
    
    if (timelineError) {
      console.error('Failed to insert timeline events:', timelineError);
    }
  }
  
  return changes.length;
}

serve(async (req: Request) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    console.log('🚀 SIMPLE SYNC STARTED');
    
    // Validate environment variables first
    console.log('🔐 Checking environment variables...');
    const employesApiKey = getAPIKey();
    console.log('✅ EMPLOYES_API_KEY found');
    
    const supabaseUrl = getSupabaseUrl();
    console.log('✅ SUPABASE_URL found');
    
    const serviceRoleKey = getServiceRoleKey();
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY found');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const COMPANY_ID = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
    const BASE_URL = 'https://connect.employes.nl/v4';
    
    let employeesProcessed = 0;
    let employeesSkipped = 0;
    let historyProcessed = 0;
    let historySkipped = 0;
    let changesDetected = 0;
    let timelineEventsCreated = 0;
    let errors: string[] = [];

    console.log('📋 Fetching employee list with pagination...');
    
    // Fetch all pages of employees
    let allEmployees: any[] = [];
    let currentPage = 1;
    let totalPages = 1;
    
    do {
      const employeesListUrl = `${BASE_URL}/${COMPANY_ID}/employees?page=${currentPage}&per_page=100`;
      console.log(`🔗 Fetching page ${currentPage}/${totalPages}...`);
      
      const employeesListResponse = await fetch(employeesListUrl, {
        headers: {
          'Authorization': `Bearer ${employesApiKey}`,
          'Accept': 'application/json'
        }
      });
      
      if (!employeesListResponse.ok) {
        const errorText = await employeesListResponse.text();
        console.error(`❌ API Error: ${errorText}`);
        throw new Error(`Failed to fetch employees page ${currentPage}: ${employeesListResponse.status} - ${errorText}`);
      }
      
      const employeesResponse = await employeesListResponse.json();
      const pageData = employeesResponse.data || [];
      allEmployees = allEmployees.concat(pageData);
      
      // Update pagination info from first response
      if (currentPage === 1) {
        totalPages = employeesResponse.pages || 1;
        console.log(`📊 Total: ${employeesResponse.total} employees across ${totalPages} pages`);
      }
      
      currentPage++;
    } while (currentPage <= totalPages);
    
    const employeesList = allEmployees;
    console.log(`✅ Fetched all ${employeesList.length} employees`);

    console.log('📸 Fetching employee details...');
    const now = new Date().toISOString();
    
    for (const emp of employeesList) {
      try {
        const employeeId = emp.id;
        
        const detailsUrl = `${BASE_URL}/${COMPANY_ID}/employees/${employeeId}`;
        const detailsResponse = await fetch(detailsUrl, {
          headers: {
            'Authorization': `Bearer ${employesApiKey}`,
            'Accept': 'application/json'
          }
        });
        
        if (!detailsResponse.ok) {
          errors.push(`Employee ${employeeId}: ${detailsResponse.status}`);
          continue;
        }
        
        const employeeData = await detailsResponse.json();
        const dataHash = await generateHash(employeeData);
        
        const { data: existing } = await supabase
          .from('employes_raw_data')
          .select('id')
          .eq('employee_id', employeeId)
          .eq('endpoint', '/employee')
          .eq('data_hash', dataHash)
          .eq('is_latest', true)
          .maybeSingle();
        
        if (existing) {
          await supabase
            .from('employes_raw_data')
            .update({ last_verified_at: now })
            .eq('id', existing.id);
          
          employeesSkipped++;
          console.log(`📌 ${employeeId.substring(0, 8)}... unchanged`);
        } else {
          // Get old data for change detection
          const { data: oldDataRecord } = await supabase
            .from('employes_raw_data')
            .select('api_response')
            .eq('employee_id', employeeId)
            .eq('endpoint', '/employee')
            .eq('is_latest', true)
            .maybeSingle();
          
          // Mark old as not latest
          await supabase
            .from('employes_raw_data')
            .update({ is_latest: false, effective_to: now })
            .eq('employee_id', employeeId)
            .eq('endpoint', '/employee')
            .eq('is_latest', true);
          
          // Insert new data
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
          
          // Detect and store changes
          const changesCount = await detectAndStoreChanges(
            supabase,
            employeeId,
            employeeData,
            oldDataRecord?.api_response || null,
            '/employee'
          );
          
          changesDetected += changesCount;
          timelineEventsCreated += changesCount;
          
          employeesProcessed++;
          console.log(`✨ ${employeeId.substring(0, 8)}... stored (${changesCount} changes)`);
        }
        
      } catch (error: any) {
        errors.push(`Employee ${emp.id}: ${error.message}`);
      }
    }

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
        
        // Extract data array from API response
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
            // Get old employment data for change detection
            const { data: oldEmploymentRecord } = await supabase
              .from('employes_raw_data')
              .select('api_response')
              .eq('employee_id', employeeId)
              .eq('endpoint', '/employments')
              .eq('is_latest', true)
              .order('collected_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            // Mark old as not latest if it exists
            if (oldEmploymentRecord) {
              await supabase
                .from('employes_raw_data')
                .update({ is_latest: false })
                .eq('employee_id', employeeId)
                .eq('endpoint', '/employments')
                .eq('is_latest', true);
            }
            
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
            
            // Detect changes and create timeline events
            const changesCount = await detectAndStoreChanges(
              supabase,
              employeeId,
              employment,
              oldEmploymentRecord?.api_response || null,
              '/employment'
            );
            changesDetected += changesCount;
            timelineEventsCreated += changesCount;
            
            historyProcessed++;
          }
        }
        
      } catch (error: any) {
        errors.push(`History ${emp.id}: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log('✅ SYNC COMPLETE');
    console.log(`   Employees: ${employeesProcessed} new, ${employeesSkipped} unchanged`);
    console.log(`   History: ${historyProcessed} new, ${historySkipped} unchanged`);
    console.log(`   Changes: ${changesDetected} detected`);
    console.log(`   Timeline: ${timelineEventsCreated} events created`);
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
          changes_detected: changesDetected,
          timeline_events_created: timelineEventsCreated,
          errors: errors,
          duration_ms: duration
        },
        timeline_populated: timelineEventsCreated > 0,
        deduplication_working: employeesSkipped > 0
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
    console.error('❌ SYNC FAILED:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
        errorDetails: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error.cause
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
