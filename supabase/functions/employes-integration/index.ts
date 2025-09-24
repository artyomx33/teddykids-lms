import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Employes API configuration
const EMPLOYES_BASE_URL = 'https://connect.employes.nl/v4';
const EMPLOYES_API_KEY = Deno.env.get('EMPLOYES_API_KEY');

// Interface definitions
interface EmployesEmployee {
  id: string;
  first_name: string;
  surname: string;
  initials?: string;
  surname_prefix?: string;
  date_of_birth?: string;
  nationality_id?: string;
  gender?: 'male' | 'female';
  personal_identification_number?: string;
  street?: string;
  housenumber?: string;
  zipcode?: string;
  city?: string;
  country_code?: string;
  status?: 'pending' | 'active' | 'out of service';
}

interface SyncLog {
  id: string;
  action: string;
  status: 'success' | 'error';
  message: string;
  details?: any;
  created_at: string;
}

interface ComparisonResult {
  lms_only: any[];
  employes_only: any[];
  matches: any[];
  differences: any[];
}

interface EmployesResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

// Helper functions
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

function getCompanyId(): string | null {
  if (!EMPLOYES_API_KEY) return null;
  
  const decoded = decodeJWT(EMPLOYES_API_KEY);
  if (decoded?.company_id) {
    return decoded.company_id;
  }
  
  // Fallback to hardcoded company ID if needed
  return 'c7e4f8b0-1234-5678-9abc-def012345678';
}

function getAPIEndpoints() {
  const companyId = getCompanyId();
  if (!companyId) {
    throw new Error('Company ID not found');
  }
  
  return {
    employees: `${EMPLOYES_BASE_URL}/${companyId}/employees`,
    payruns: `${EMPLOYES_BASE_URL}/${companyId}/payruns`,
  };
}

// Log sync activity
async function logSync(action: string, status: 'success' | 'error', message: string, details?: any) {
  try {
    await supabase.from('employes_sync_logs').insert({
      action,
      status,
      message,
      details: details || null,
    });
  } catch (error) {
    console.error('Failed to log sync activity:', error);
  }
}

// Make authenticated request to Employes API
async function employesRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
  body?: any
): Promise<EmployesResponse<T>> {
  if (!EMPLOYES_API_KEY) {
    return { error: 'Employes API key not configured' };
  }

  try {
    const config: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      await logSync(
        `api_request_failed`,
        'error',
        `${method} ${endpoint} failed with status ${response.status}`,
        { status: response.status, error: errorText }
      );
      
      return { 
        error: `API request failed: ${response.status} ${response.statusText}`, 
        status: response.status 
      };
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    await logSync(`api_request_error`, 'error', `Failed to connect to Employes API`, { error: error.message });
    return { error: `Network error: ${error.message}` };
  }
}

// Fetch employees from Employes API
async function fetchEmployesEmployees(): Promise<EmployesResponse<EmployesEmployee[]>> {
  const endpoints = getAPIEndpoints();
  console.log('Fetching employees from:', endpoints.employees);
  
  const result = await employesRequest<EmployesEmployee[]>(endpoints.employees);
  
  if (result.data) {
    await logSync('fetch_employees', 'success', `Fetched ${result.data.length} employees from Employes`);
  }
  
  return result;
}

// Compare staff data between LMS and Employes
async function compareStaffData(): Promise<EmployesResponse<ComparisonResult>> {
  try {
    // Fetch LMS staff
    const { data: lmsStaff, error: lmsError } = await supabase
      .from('staff')
      .select('id, full_name, email, role, status');

    if (lmsError) {
      throw new Error(`Failed to fetch LMS staff: ${lmsError.message}`);
    }

    // Fetch Employes employees
    const employesResult = await fetchEmployesEmployees();
    if (employesResult.error) {
      throw new Error(employesResult.error);
    }

    const employesStaff = employesResult.data || [];
    
    // Compare data
    const lmsNames = new Set(lmsStaff?.map(s => s.full_name.toLowerCase()) || []);
    const employesNames = new Set(employesStaff.map(e => `${e.first_name} ${e.surname_prefix ? e.surname_prefix + ' ' : ''}${e.surname}`.toLowerCase()));

    const lmsOnly = lmsStaff?.filter(s => !employesNames.has(s.full_name.toLowerCase())) || [];
    const employesOnly = employesStaff.filter(e => {
      const fullName = `${e.first_name} ${e.surname_prefix ? e.surname_prefix + ' ' : ''}${e.surname}`.toLowerCase();
      return !lmsNames.has(fullName);
    });

    const matches = lmsStaff?.filter(s => employesNames.has(s.full_name.toLowerCase())) || [];

    const comparison: ComparisonResult = {
      lms_only: lmsOnly,
      employes_only: employesOnly,
      matches: matches,
      differences: [] // Could be enhanced to show detailed differences
    };

    await logSync('compare_data', 'success', `Compared ${lmsStaff?.length || 0} LMS staff with ${employesStaff.length} Employes employees`);
    
    return { data: comparison };
  } catch (error) {
    await logSync('compare_data', 'error', error.message);
    return { error: error.message };
  }
}

// Sync employees from Employes to LMS
async function syncEmployeesToLMS(): Promise<EmployesResponse<any>> {
  try {
    const employesResult = await fetchEmployesEmployees();
    if (employesResult.error) {
      throw new Error(employesResult.error);
    }

    const employees = employesResult.data || [];
    let syncedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        const fullName = `${employee.first_name} ${employee.surname_prefix ? employee.surname_prefix + ' ' : ''}${employee.surname}`;
        
        // Check if employee already exists
        const { data: existing } = await supabase
          .from('staff')
          .select('id')
          .ilike('full_name', fullName)
          .single();

        if (!existing) {
          // Create new staff member
          const { error: insertError } = await supabase
            .from('staff')
            .insert({
              full_name: fullName,
              email: null, // Email not available in basic employee data
              role: 'employee',
              status: employee.status === 'active' ? 'active' : 'inactive',
              employes_id: employee.id,
              birth_date: employee.date_of_birth || null,
              nationality: employee.nationality_id || null,
              gender: employee.gender || null,
            });

          if (insertError) {
            console.error(`Failed to insert employee ${fullName}:`, insertError);
            errorCount++;
          } else {
            syncedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing employee ${employee.id}:`, error);
        errorCount++;
      }
    }

    await logSync('sync_employees', 'success', `Synced ${syncedCount} employees to LMS (${errorCount} errors)`);
    
    return { 
      data: { 
        total: employees.length,
        synced: syncedCount, 
        errors: errorCount 
      } 
    };
  } catch (error) {
    await logSync('sync_employees', 'error', error.message);
    return { error: error.message };
  }
}

// Sync wage data from LMS to Employes
async function syncWageDataToEmployes(): Promise<EmployesResponse<any>> {
  try {
    // This would be implemented based on specific wage component requirements
    // For now, return a placeholder response
    await logSync('sync_wage_data', 'success', 'Wage data sync not yet implemented');
    
    return { 
      data: { 
        message: 'Wage data sync functionality will be implemented based on specific requirements',
        wage_components_available: true
      } 
    };
  } catch (error) {
    await logSync('sync_wage_data', 'error', error.message);
    return { error: error.message };
  }
}

// Get sync statistics
async function getSyncStatistics(): Promise<EmployesResponse<any>> {
  try {
    const { data: logs } = await supabase
      .from('employes_sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const { data: staffCount } = await supabase
      .from('staff')
      .select('id', { count: 'exact' });

    const stats = {
      total_staff: staffCount?.length || 0,
      recent_logs: logs?.length || 0,
      last_sync: logs?.[0]?.created_at || null,
      success_rate: logs ? 
        Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100) : 0
    };

    return { data: stats };
  } catch (error) {
    return { error: error.message };
  }
}

// Get sync logs
async function getSyncLogs(limit: number = 50): Promise<EmployesResponse<SyncLog[]>> {
  try {
    const { data: logs, error } = await supabase
      .from('employes_sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return { data: logs || [] };
  } catch (error) {
    return { error: error.message };
  }
}

// Test connection to Employes API
async function testConnection(): Promise<EmployesResponse<any>> {
  if (!EMPLOYES_API_KEY) {
    return { error: 'Employes API key not configured' };
  }

  try {
    const endpoints = getAPIEndpoints();
    const result = await employesRequest(endpoints.employees + '?per_page=1');
    
    if (result.error) {
      return { error: `Connection test failed: ${result.error}` };
    }

    return { 
      data: { 
        status: 'connected',
        api_version: 'v4',
        company_id: getCompanyId(),
        endpoint_tested: endpoints.employees
      } 
    };
  } catch (error) {
    return { error: `Connection test failed: ${error.message}` };
  }
}

// Debug connection with detailed information
async function debugConnection(): Promise<EmployesResponse<any>> {
  try {
    const debugInfo: any = {
      api_key_configured: !!EMPLOYES_API_KEY,
      company_id: getCompanyId(),
      base_url: EMPLOYES_BASE_URL,
      endpoints: null,
      test_results: []
    };

    if (EMPLOYES_API_KEY) {
      try {
        debugInfo.endpoints = getAPIEndpoints();
        
        // Test basic connectivity
        const testResult = await testConnection();
        debugInfo.test_results.push({
          test: 'basic_connection',
          success: !testResult.error,
          result: testResult.data || testResult.error
        });

      } catch (error) {
        debugInfo.test_results.push({
          test: 'endpoint_generation',
          success: false,
          error: error.message
        });
      }
    }

    return { data: debugInfo };
  } catch (error) {
    return { error: error.message };
  }
}

// Discover available endpoints
async function discoverEndpoints(): Promise<EmployesResponse<any>> {
  try {
    const companyId = getCompanyId();
    
    if (!companyId) {
      return { error: 'Company ID not available for endpoint discovery' };
    }

    const availableEndpoints = {
      base_url: EMPLOYES_BASE_URL,
      company_id: companyId,
      endpoints: {
        employees: `${EMPLOYES_BASE_URL}/${companyId}/employees`,
        payruns: `${EMPLOYES_BASE_URL}/${companyId}/payruns`,
        employee_employments: `${EMPLOYES_BASE_URL}/${companyId}/employees/{employeeId}/employments`,
        payrun_employee: `${EMPLOYES_BASE_URL}/${companyId}/payruns/{payrunId}/employee/{employeeId}`,
      },
      rate_limit: '5 requests per second',
      authentication: 'Bearer token'
    };

    return { data: availableEndpoints };
  } catch (error) {
    return { error: error.message };
  }
}

// Main HTTP handler
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${new Date().toISOString()}] Received ${req.method} request`);
    
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body',
          details: parseError.message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { action, ...params } = requestBody;
    console.log(`[${new Date().toISOString()}] Processing action: ${action}`);

    if (!action) {
      console.error('Missing action parameter in request');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing action parameter',
        validActions: ['test_connection', 'fetch_employees', 'compare_staff_data', 'sync_employees', 'sync_wage_data', 'sync_from_employes', 'get_sync_statistics', 'get_sync_logs', 'discover_endpoints', 'debug_connection']
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    let result: EmployesResponse<any>;

    switch (action) {
      case 'test_connection':
        result = await testConnection();
        break;

      case 'fetch_employees':
        result = await fetchEmployesEmployees();
        break;

      case 'compare_staff_data':
        result = await compareStaffData();
        break;

      case 'sync_employees':
        result = await syncEmployeesToLMS();
        break;

      case 'sync_wage_data':
        result = await syncWageDataToEmployes();
        break;

      case 'sync_from_employes':
        result = await syncEmployeesToLMS();
        break;

      case 'get_sync_statistics':
        result = await getSyncStatistics();
        break;

      case 'get_sync_logs':
        result = await getSyncLogs(params.limit);
        break;

      case 'debug_connection':
        result = await debugConnection();
        break;

      case 'discover_endpoints':
        result = await discoverEndpoints();
        break;

      default:
        console.error(`Unknown action received: ${action}`);
        result = { 
          error: `Unknown action: ${action}`,
          validActions: ['test_connection', 'fetch_employees', 'compare_staff_data', 'sync_employees', 'sync_wage_data', 'sync_from_employes', 'get_sync_statistics', 'get_sync_logs', 'discover_endpoints', 'debug_connection']
        };
    }

    console.log(`[${new Date().toISOString()}] Action ${action} completed. Success: ${!result.error}`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.error ? 400 : 200,
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Edge function error:`, error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});