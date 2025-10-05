// ╔════════════════════════════════════════════════════════════════════╗
// ║  EMPLOYES HISTORY COLLECTOR                                        ║
// ║  Fetches ALL historical data from Employes.nl API                  ║
// ║  (employments, salary history, contracts, wage scales, etc.)       ║
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
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const EMPLOYES_BASE_URL = 'https://connect.employes.nl/v4';
const COMPANY_ID = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
const FUNCTION_NAME = 'employes-history-collector';

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

function buildHistoricalEndpoint(employeeId: string, path: string): string {
  const normalized = path.startsWith('/') ? path : '/' + path;
  return (
    EMPLOYES_BASE_URL +
    '/' +
    COMPANY_ID +
    '/employees/' +
    employeeId +
    normalized
  );
}

// Historical endpoint to fetch
// NOTE: /employments returns COMPLETE history in one call:
// - All salary periods (with start/end dates, hourly/monthly/yearly wages)
// - All hours periods (with start/end dates, hours_per_week, days_per_week)
// - All contracts (with start/end dates, contract_duration, is_signed)
// - Tax details, employee info, and more
// This is the ONLY endpoint we need - all other history endpoints return 403 Forbidden
const HISTORICAL_ENDPOINTS = [
  { path: '/employments', label: 'Complete Employment History (All Periods)' }
];

// ═══════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════

serve(async (req: Request) => {
  const startTime = Date.now();
  
  try {
    console.log('📜 HISTORY COLLECTOR STARTED');
    
    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = getServiceRoleKey();
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const employesApiKey = getAPIKey();
    
    // Parse request
    const { mode = 'full', employeeIds = null, endpoints = null } = await req.json().catch(() => ({}));
    
    console.log('Mode: ' + mode);
    console.log('Specific employees: ' + (employeeIds ? employeeIds.length : 'ALL'));
    console.log('Specific endpoints: ' + (endpoints ? endpoints.join(', ') : 'ALL'));
    
    // Create sync session
    const syncSession = await createSyncSession(supabase);
    console.log('📋 Sync session created: ' + syncSession.id);
    
    // Determine which endpoints to collect
    const endpointsToCollect = endpoints || HISTORICAL_ENDPOINTS.map(e => e.path);
    
    // Collect history
    let result: SyncResult;
    
    if (mode === 'test') {
      // Test mode - fetch just one employee, one endpoint
      result = await collectTestHistory(supabase, employesApiKey, syncSession, endpointsToCollect);
    } else if (employeeIds && employeeIds.length > 0) {
      // Specific employees
      result = await collectSpecificHistory(supabase, employesApiKey, syncSession, employeeIds, endpointsToCollect);
    } else {
      // Full sync - all employees, all endpoints
      result = await collectFullHistory(supabase, employesApiKey, syncSession, endpointsToCollect);
    }
    
    // Complete sync session
    await completeSyncSession(supabase, syncSession.id, result);
    
    // Log completion
    await logSync(supabase, {
      operation: 'history_collect',
      status: result.successful > 0 ? 'success' : 'error',
      function_name: FUNCTION_NAME,
      details: {
        mode: mode,
        endpoints: endpointsToCollect,
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        duration_ms: Date.now() - startTime,
        sync_session_id: syncSession.id
      }
    });
    
    console.log('✅ HISTORY COLLECTION COMPLETE');
    console.log('Total requests: ' + result.total);
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
    console.error('❌ HISTORY COLLECTION FAILED:', error);
    
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
      session_type: 'history',
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
// HISTORY COLLECTION
// ═══════════════════════════════════════════════════════════════════

async function collectTestHistory(
  supabase: any,
  apiKey: string,
  session: SyncSession,
  endpoints: string[]
): Promise<SyncResult> {
  console.log('🧪 TEST MODE - Collecting single employee, single endpoint');
  
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
    
    const testEmployee = employees[0];
    const testEndpoint = endpoints[0];
    
    console.log('Testing: ' + testEmployee.id + ' - ' + testEndpoint);
    
    result.total = 1;
    
    // Fetch historical data
    const historyData = await fetchHistoricalEndpoint(apiKey, testEmployee.id, testEndpoint);
    
    // Store history
    await storeHistoricalData(supabase, session.id, testEmployee.id, testEndpoint, historyData);
    
    result.successful = 1;
    console.log('✅ Test history stored successfully');
    
  } catch (error: any) {
    result.failed = 1;
    result.errors.push({
      employee_id: 'test',
      error: error.message
    });
    console.error('❌ Test history failed:', error);
  }
  
  return result;
}

async function collectSpecificHistory(
  supabase: any,
  apiKey: string,
  session: SyncSession,
  employeeIds: string[],
  endpoints: string[]
): Promise<SyncResult> {
  console.log('🎯 SPECIFIC MODE - Collecting ' + employeeIds.length + ' employees x ' + endpoints.length + ' endpoints');
  
  const result: SyncResult = {
    total: employeeIds.length * endpoints.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  for (const employeeId of employeeIds) {
    for (const endpoint of endpoints) {
      try {
        console.log('Fetching: ' + employeeId + ' - ' + endpoint);
        
        // Fetch historical data
        const historyData = await fetchHistoricalEndpoint(apiKey, employeeId, endpoint);
        
        // Store history
        await storeHistoricalData(supabase, session.id, employeeId, endpoint, historyData);
        
        result.successful++;
        console.log('✅ Stored: ' + employeeId + ' - ' + endpoint + ' (' + result.successful + '/' + result.total + ')');
        
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          employee_id: employeeId + ' - ' + endpoint,
          error: error.message
        });
        console.error('❌ Failed: ' + employeeId + ' - ' + endpoint + ' - ' + error.message);
      }
    }
  }
  
  return result;
}

async function collectFullHistory(
  supabase: any,
  apiKey: string,
  session: SyncSession,
  endpoints: string[]
): Promise<SyncResult> {
  console.log('🌍 FULL MODE - Collecting ALL employees x ' + endpoints.length + ' endpoints');
  
  const result: SyncResult = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // Fetch employee list
    const employees = await fetchEmployeeList(apiKey);
    result.total = employees.length * endpoints.length;
    
    console.log('Found ' + employees.length + ' employees');
    console.log('Total requests: ' + result.total);
    
    // Process each employee x endpoint
    for (const employee of employees) {
      for (const endpoint of endpoints) {
        try {
          const progress = result.successful + result.failed + 1;
          console.log('Fetching: ' + employee.id + ' - ' + endpoint + ' (' + progress + '/' + result.total + ')');
          
          // Fetch historical data
          const historyData = await fetchHistoricalEndpoint(apiKey, employee.id, endpoint);
          
          // Store history
          await storeHistoricalData(supabase, session.id, employee.id, endpoint, historyData);
          
          result.successful++;
          console.log('✅ Stored: ' + employee.id + ' - ' + endpoint);
          
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            employee_id: employee.id + ' - ' + endpoint,
            error: error.message
          });
          console.error('❌ Failed: ' + employee.id + ' - ' + endpoint + ' - ' + error.message);
        }
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

async function fetchHistoricalEndpoint(
  apiKey: string,
  employeeId: string,
  endpoint: string
): Promise<any> {
  const url = buildHistoricalEndpoint(employeeId, endpoint);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    // 404 might mean no historical data exists - this is OK
    if (response.status === 404) {
      console.log('No data found for ' + endpoint + ' (404)');
      return null;
    }
    throw new Error('API call failed: ' + response.status + ' ' + response.statusText);
  }
  
  const data = await response.json();
  
  return data.data || data;
}

// ═══════════════════════════════════════════════════════════════════
// DATA STORAGE
// ═══════════════════════════════════════════════════════════════════

async function storeHistoricalData(
  supabase: any,
  sessionId: string,
  employeeId: string,
  endpoint: string,
  apiResponse: any
): Promise<void> {
  // Skip if no data
  if (!apiResponse || (Array.isArray(apiResponse) && apiResponse.length === 0)) {
    console.log('⏭️ Skipping empty response for ' + employeeId + ' - ' + endpoint);
    return;
  }
  
  const now = new Date().toISOString();
  
  // If API response is an array, store each item separately with its own effective_from
  if (Array.isArray(apiResponse)) {
    console.log('📦 Storing ' + apiResponse.length + ' historical records for ' + endpoint);
    
    for (const item of apiResponse) {
      // Extract effective_from date from the item
      const effectiveFrom = extractEffectiveDate(item, endpoint);
      
      const record: any = {
        employee_id: employeeId,
        endpoint: endpoint,
        api_response: item,
        data_hash: await generateHash(item),
        collected_at: now,
        last_verified_at: now,
        effective_from: effectiveFrom,
        effective_to: null,
        is_latest: true,
        sync_session_id: sessionId,
        confidence_score: 1.0
      };
      
      // Insert historical record
      const { error } = await supabase
        .from('employes_raw_data')
        .insert(record);
      
      if (error) {
        console.error('Failed to insert historical record:', error);
        throw new Error('Failed to insert historical record: ' + error.message);
      }
    }
  } else {
    // Single object response
    const effectiveFrom = extractEffectiveDate(apiResponse, endpoint);
    
    const record: any = {
      employee_id: employeeId,
      endpoint: endpoint,
      api_response: apiResponse,
      data_hash: await generateHash(apiResponse),
      collected_at: now,
      last_verified_at: now,
      effective_from: effectiveFrom,
      effective_to: null,
      is_latest: true,
      sync_session_id: sessionId,
      confidence_score: 1.0
    };
    
    // Insert historical record
    const { error } = await supabase
      .from('employes_raw_data')
      .insert(record);
    
    if (error) {
      console.error('Failed to insert historical record:', error);
      throw new Error('Failed to insert historical record: ' + error.message);
    }
  }
  
  console.log('✅ Historical data stored for ' + employeeId + ' - ' + endpoint);
}

// ═══════════════════════════════════════════════════════════════════
// DATE EXTRACTION
// ═══════════════════════════════════════════════════════════════════

function extractEffectiveDate(item: any, endpoint: string): string {
  // Try to find a date field in the item
  const dateFields = [
    'effective_date',
    'start_date',
    'created_at',
    'date',
    'period_start',
    'from_date',
    'contract_start_date',
    'employment_start_date'
  ];
  
  for (const field of dateFields) {
    if (item[field]) {
      return new Date(item[field]).toISOString();
    }
  }
  
  // Check nested objects
  if (item.employment && item.employment.start_date) {
    return new Date(item.employment.start_date).toISOString();
  }
  
  if (item.contract && item.contract.start_date) {
    return new Date(item.contract.start_date).toISOString();
  }
  
  // Default to collected time if no date found
  console.log('⚠️ No effective date found in ' + endpoint + ', using current time');
  return new Date().toISOString();
}

console.log('📜 Employes History Collector loaded');
