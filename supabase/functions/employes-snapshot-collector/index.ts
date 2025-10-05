// ╔════════════════════════════════════════════════════════════════════╗
// ║  EMPLOYES SNAPSHOT COLLECTOR                                       ║
// ║  Fetches current state of all employees from Employes.nl API      ║
// ╚════════════════════════════════════════════════════════════════════╝

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Local types
interface SyncResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ employee_id: string; error: string }>;
}

interface SyncSession {
  id: string;
  session_type: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  total_records?: number;
  successful_records?: number;
  failed_records?: number;
}

interface TemporalRecord {
  employee_id: string;
  endpoint: string;
  api_response: any;
  data_hash: string;
  collected_at: string;
  effective_from: string | null;
  effective_to: string | null;
  is_latest: boolean;
  sync_session_id: string;
  confidence_score: number;
}

// Helper functions (inlined to avoid cross-function imports)
function getAPIKey(): string {
  const key = Deno.env.get('EMPLOYES_API_KEY');
  if (!key) {
    throw new Error('EMPLOYES_API_KEY not set');
  }
  return key;
}

function getServiceRoleKey(): string {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  }
  return key;
}

function getSupabaseUrl(): string {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) {
    throw new Error('SUPABASE_URL not set');
  }
  return url;
}

// ═══════════════════════════════════════════════════════════════════
// HASH GENERATION
// ═══════════════════════════════════════════════════════════════════

async function generateHash(data: any): Promise<string> {
  const jsonString = JSON.stringify(data);
  const msgUint8 = new TextEncoder().encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex; // Returns 64-character SHA-256 hash
}

async function logSync(
  supabase: ReturnType<typeof createClient>,
  entry: {
    operation: string;
    status: string;
    function_name: string;
    details: Record<string, unknown>;
  }
): Promise<void> {
  const { error } = await supabase
    .from('employes_sync_logs')
    .insert({
      operation: entry.operation,
      status: entry.status,
      function_name: entry.function_name,
      details: entry.details,
      logged_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to log sync:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════
// FLEXIBLE FETCH WITH RETRY
// ═══════════════════════════════════════════════════════════════════

interface FlexibleFetchResult {
  success: boolean;
  data: any;
  issues: string[];
  httpStatus: number | null;
  responseTimeMs: number;
}

async function flexibleFetch(
  url: string,
  apiKey: string,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<FlexibleFetchResult> {
  const issues: string[] = [];
  let lastError: any = null;
  let httpStatus: number | null = null;
  const startTime = Date.now();
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Attempt': attempt.toString()
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
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
          data,
          issues,
          httpStatus,
          responseTimeMs
        };
      }
      
      // Handle specific error codes
      if (response.status === 404) {
        issues.push('Resource not found (404)');
        return {
          success: false,
          data: { error: 'not_found', status: 404 },
          issues,
          httpStatus,
          responseTimeMs: Date.now() - startTime
        };
      }
      
      if (response.status === 403) {
        issues.push('Access forbidden (403)');
        return {
          success: false,
          data: { error: 'forbidden', status: 403 },
          issues,
          httpStatus,
          responseTimeMs: Date.now() - startTime
        };
      }
      
      throw new Error(`HTTP ${response.status}`);
      
    } catch (error: any) {
      lastError = error;
      issues.push(`Attempt ${attempt + 1} failed: ${error.message}`);
      
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // All retries failed
  return {
    success: false,
    data: null,
    issues,
    httpStatus,
    responseTimeMs: Date.now() - startTime
  };
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const EMPLOYES_BASE_URL = 'https://connect.employes.nl/v4';
const COMPANY_ID = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
const FUNCTION_NAME = 'employes-snapshot-collector';

function buildEmployeesEndpoint(page: number = 1, perPage: number = 100): string {
  return (
    EMPLOYES_BASE_URL +
    '/' +
    COMPANY_ID +
    '/employees?page=' +
    page +
    '&per_page=' +
    perPage
  );
}

function buildEmployeeEndpoint(employeeId: string): string {
  return (
    EMPLOYES_BASE_URL +
    '/' +
    COMPANY_ID +
    '/employees/' +
    employeeId
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════

serve(async (req: Request) => {
  const startTime = Date.now();
  
  try {
    console.log('📸 SNAPSHOT COLLECTOR STARTED');
    
    // Initialize Supabase client
    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = getServiceRoleKey();
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get Employes.nl API key
    const employesApiKey = getAPIKey();
    
    // Parse request
    const { mode = 'full', employeeIds = null } = await req.json().catch(() => ({}));
    
    console.log('Mode: ' + mode);
    console.log('Specific employees: ' + (employeeIds ? employeeIds.length : 'ALL'));
    
    // Create sync session
    const syncSession = await createSyncSession(supabase);
    console.log('📋 Sync session created: ' + syncSession.id);
    
    // Collect snapshots
    let result: SyncResult;
    
    if (mode === 'test') {
      // Test mode - fetch just one employee
      result = await collectTestSnapshot(supabase, employesApiKey, syncSession);
    } else if (employeeIds && employeeIds.length > 0) {
      // Specific employees
      result = await collectSpecificSnapshots(supabase, employesApiKey, syncSession, employeeIds);
    } else {
      // Full sync - all employees
      result = await collectFullSnapshot(supabase, employesApiKey, syncSession);
    }
    
    // Complete sync session
    await completeSyncSession(supabase, syncSession.id, result);
    
    // Log completion
    await logSync(supabase, {
      operation: 'snapshot_collect',
      status: result.successful > 0 ? 'success' : 'error',
      function_name: FUNCTION_NAME,
      details: {
        mode: mode,
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        duration_ms: Date.now() - startTime,
        sync_session_id: syncSession.id
      }
    });
    
    console.log('✅ SNAPSHOT COLLECTION COMPLETE');
    console.log('Total: ' + result.total);
    console.log('Successful: ' + result.successful);
    console.log('Failed: ' + result.failed);
    console.log('Duration: ' + (Date.now() - startTime) + 'ms');
    
    return new Response(
      JSON.stringify({
        success: true,
        sync_session_id: syncSession.id,
        result: result,
        duration_ms: Date.now() - startTime
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('❌ SNAPSHOT COLLECTION FAILED:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

// ═══════════════════════════════════════════════════════════════════
// SYNC SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

async function createSyncSession(supabase: any): Promise<SyncSession> {
  const { data, error } = await supabase
    .from('employes_sync_sessions')
    .insert({
      session_type: 'snapshot',
      started_at: new Date().toISOString(),
      status: 'running'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Failed to create sync session:', error);
    throw new Error('Failed to create sync session: ' + error.message);
  }
  
  return data;
}

async function completeSyncSession(
  supabase: any,
  sessionId: string,
  result: SyncResult
): Promise<void> {
  const { error } = await supabase
    .from('employes_sync_sessions')
    .update({
      completed_at: new Date().toISOString(),
      status: result.failed === 0 ? 'completed' : 'partial',
      total_records: result.total,
      successful_records: result.successful,
      failed_records: result.failed,
      sync_details: {
        errors: result.errors
      }
    })
    .eq('id', sessionId);
  
  if (error) {
    console.error('Failed to complete sync session:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// SNAPSHOT COLLECTION
// ═══════════════════════════════════════════════════════════════════

async function collectTestSnapshot(
  supabase: any,
  apiKey: string,
  session: SyncSession
): Promise<SyncResult> {
  console.log('🧪 TEST MODE - Collecting single employee');
  
  const result: SyncResult = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // Fetch employee list
    const employees = await fetchEmployeeList(apiKey);
    
    if (employees.length === 0) {
      throw new Error('No employees found');
    }
    
    // Take first employee
    const testEmployee = employees[0];
    console.log('Testing with employee: ' + testEmployee.id);
    
    result.total = 1;
    
    // Fetch detailed data
    const fetchResult = await fetchEmployeeDetails(apiKey, testEmployee.id);
    
    // Store snapshot (always, even if partial)
    await storeSnapshot(supabase, session.id, testEmployee.id, fetchResult);
    
    if (fetchResult.success) {
      result.successful = 1;
      console.log('✅ Test snapshot stored successfully');
    } else {
      result.failed = 1;
      result.errors.push({
        employee_id: testEmployee.id,
        error: fetchResult.issues.join('; ')
      });
      console.log('⚠️ Partial test data stored');
    }
    
  } catch (error: any) {
    result.failed = 1;
    result.errors.push({
      employee_id: 'test',
      error: error.message
    });
    console.error('❌ Test snapshot failed:', error);
  }
  
  return result;
}

async function collectSpecificSnapshots(
  supabase: any,
  apiKey: string,
  session: SyncSession,
  employeeIds: string[]
): Promise<SyncResult> {
  console.log('🎯 SPECIFIC MODE - Collecting ' + employeeIds.length + ' employees');
  
  const result: SyncResult = {
    total: employeeIds.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  for (const employeeId of employeeIds) {
    try {
      console.log('Fetching employee: ' + employeeId);
      
      // Fetch detailed data
      const fetchResult = await fetchEmployeeDetails(apiKey, employeeId);
      
      // Store snapshot (always, even if partial)
      await storeSnapshot(supabase, session.id, employeeId, fetchResult);
      
      if (fetchResult.success) {
        result.successful++;
        console.log('✅ Stored: ' + employeeId + ' (' + result.successful + '/' + result.total + ')');
      } else {
        result.failed++;
        result.errors.push({
          employee_id: employeeId,
          error: fetchResult.issues.join('; ')
        });
        console.log('⚠️ Partial: ' + employeeId);
      }
      
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        employee_id: employeeId,
        error: error.message
      });
      console.error('❌ Failed: ' + employeeId + ' - ' + error.message);
    }
  }
  
  return result;
}

async function collectFullSnapshot(
  supabase: any,
  apiKey: string,
  session: SyncSession
): Promise<SyncResult> {
  console.log('🌍 FULL MODE - Collecting ALL employees');
  
  const result: SyncResult = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // Fetch employee list
    const employees = await fetchEmployeeList(apiKey);
    result.total = employees.length;
    
    console.log('Found ' + result.total + ' employees');
    
    // Process each employee
    for (const employee of employees) {
      try {
        console.log('Fetching: ' + employee.id + ' (' + (result.successful + result.failed + 1) + '/' + result.total + ')');
        
        // Fetch detailed data with flexible ingestion
        const fetchResult = await fetchEmployeeDetails(apiKey, employee.id);
        
        // Store snapshot (always, even if partial)
        await storeSnapshot(supabase, session.id, employee.id, fetchResult);
        
        if (fetchResult.success) {
          result.successful++;
          console.log('✅ Stored: ' + employee.id);
        } else {
          result.failed++;
          result.errors.push({
            employee_id: employee.id,
            error: fetchResult.issues.join('; ')
          });
          console.log('⚠️ Partial: ' + employee.id);
        }
        
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          employee_id: employee.id,
          error: error.message
        });
        console.error('❌ Failed: ' + employee.id + ' - ' + error.message);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Failed to fetch employee list:', error);
    throw error;
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════
// EMPLOYES.NL API CALLS
// ═══════════════════════════════════════════════════════════════════

async function fetchEmployeeList(apiKey: string): Promise<Array<{ id: string }>> {
  const url = buildEmployeesEndpoint(1, 200);
  
  console.log('Calling: ' + url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('API call failed: ' + response.status + ' ' + response.statusText);
  }
  
  const data = await response.json();
  
  return data.data || [];
}

async function fetchEmployeeDetails(apiKey: string, employeeId: string): Promise<FlexibleFetchResult> {
  const url = buildEmployeeEndpoint(employeeId);
  
  // Use flexible fetch with retry logic
  const result = await flexibleFetch(url, apiKey, 3, 1000);
  
  // Extract data from response
  if (result.success && result.data) {
    result.data = result.data.data || result.data;
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════
// DATA STORAGE
// ═══════════════════════════════════════════════════════════════════

async function storeSnapshot(
  supabase: any,
  sessionId: string,
  employeeId: string,
  fetchResult: FlexibleFetchResult
): Promise<void> {
  const now = new Date().toISOString();

  // Generate SHA-256 hash
  const dataHash = await generateHash(fetchResult.data || {});

  // Check if identical data already exists
  const { data: existing } = await supabase
    .from('employes_raw_data')
    .select('id, collected_at, data_hash')
    .eq('employee_id', employeeId)
    .eq('endpoint', '/employee')
    .eq('data_hash', dataHash)
    .eq('is_latest', true)
    .maybeSingle();

  if (existing) {
    // Data unchanged - just update verification timestamp
    console.log('📌 Data unchanged for ' + employeeId.substring(0, 8) + '..., updating last_verified');

    const { error: updateError } = await supabase
      .from('employes_raw_data')
      .update({
        last_verified_at: now,
        sync_session_id: sessionId
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Failed to update verification: ' + updateError.message);
    }

    return; // SKIP INSERT - no duplicate!
  }

  // Data changed or new - proceed with insert
  console.log('✨ New/changed data for ' + employeeId.substring(0, 8) + '..., storing...');

  // Mark previous records as not latest
  const { error: markOldError } = await supabase
    .from('employes_raw_data')
    .update({
      is_latest: false,
      effective_to: now
    })
    .eq('employee_id', employeeId)
    .eq('endpoint', '/employee')
    .eq('is_latest', true);

  if (markOldError) {
    console.log('Note: No previous data to update for ' + employeeId.substring(0, 8) + '...');
  }

  // Create temporal record with flexibility fields
  const record: any = {
    employee_id: employeeId,
    endpoint: '/employee',
    api_response: fetchResult.data || {},
    data_hash: dataHash, // NOW A REAL HASH!
    collected_at: now,
    last_verified_at: now, // NEW: Track verification
    effective_from: now,
    effective_to: null,
    is_latest: true,
    sync_session_id: sessionId,
    confidence_score: fetchResult.success ? 1.0 : 0.5,
    // Flexibility fields
    collection_issues: fetchResult.issues.length > 0 ? fetchResult.issues : null,
    is_partial: !fetchResult.success,
    retry_count: 0,
    http_status_code: fetchResult.httpStatus,
    error_message: fetchResult.success ? null : fetchResult.issues.join('; ')
  };

  // Insert new record
  const { error: insertError } = await supabase
    .from('employes_raw_data')
    .insert(record);

  if (insertError) {
    console.error('Failed to insert snapshot: ' + insertError.message);
    // Don't throw - log and continue
  }
}

console.log('📸 Employes Snapshot Collector loaded');
