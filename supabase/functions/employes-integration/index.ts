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

// Interface definitions - Extended to capture ALL available fields from employes.nl
interface EmployesEmployee {
  // Basic info
  id: string;
  first_name: string;
  surname: string;
  initials?: string;
  surname_prefix?: string;
  date_of_birth?: string;
  nationality_id?: string;
  gender?: 'male' | 'female';
  personal_identification_number?: string;
  
  // Address info
  street?: string;
  housenumber?: string;
  zipcode?: string;
  city?: string;
  country_code?: string;
  
  // Employment info
  status?: 'pending' | 'active' | 'out of service';
  employee_number?: string;
  department?: string;
  department_id?: string;
  location?: string;
  location_id?: string;
  afdeling?: string;
  position?: string;
  role?: string;
  job_title?: string;
  
  // Contact info
  email?: string;
  phone?: string;
  mobile?: string;
  
  // Contract info
  start_date?: string;
  end_date?: string;
  contract_type?: string;
  employment_type?: string;
  hours_per_week?: number;
  salary?: number;
  hourly_rate?: number;
  
  // Additional fields that might be present
  [key: string]: any; // Allow any additional fields
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
  } catch (error: any) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Fetch companies from Employes API - following developer docs
async function fetchCompanies(): Promise<EmployesResponse<any[]>> {
  const endpoint = `${EMPLOYES_BASE_URL}/companies`;
  console.log('Fetching companies from:', endpoint);
  
  const result = await employesRequest<any>(endpoint);
  
  if (result.data && typeof result.data === 'object' && 'data' in result.data) {
    await logSync('fetch_companies', 'success', `Fetched ${result.data.data.length} companies from Employes`);
    return { data: result.data.data, status: result.status };
  } else if (result.data && Array.isArray(result.data)) {
    await logSync('fetch_companies', 'success', `Fetched ${result.data.length} companies from Employes`);
    return result;
  }
  
  return result;
}

// Get company ID - hardcoded for Teddy Kids Daycare
async function getCompanyId(): Promise<string | null> {
  // Hardcoded Teddy Kids Daycare company ID
  return "b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6";
}

async function getAPIEndpoints() {
  const companyId = "b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6"; // Hardcoded Teddy Kids Daycare
  console.log('Building API endpoints with companyId:', companyId);

  return {
    employees: `${EMPLOYES_BASE_URL}/${companyId}/employees`,
    payruns: `${EMPLOYES_BASE_URL}/${companyId}/payruns`,
    company: `${EMPLOYES_BASE_URL}/${companyId}`
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
  } catch (error: any) {
    console.error('Failed to log sync activity:', error);
  }
}

// Validate and log JWT token details
function validateJWTAndLog(token: string): { valid: boolean, details: any, error?: string } {
  console.log('🔍 JWT Token Analysis:');
  console.log(`Token length: ${token.length}`);
  console.log(`Token preview: ${token.substring(0, 50)}...`);
  
  const decoded = decodeJWT(token);
  if (!decoded) {
    console.log('❌ JWT decoding failed - invalid token format');
    return { valid: false, details: null, error: 'Invalid JWT format' };
  }
  
  console.log('✅ JWT decoded successfully:', JSON.stringify(decoded, null, 2));
  
  // Check important JWT fields
  const now = Math.floor(Date.now() / 1000);
  const details = {
    issuer: decoded.iss,
    audience: decoded.aud,
    subject: decoded.sub,
    expires: decoded.exp,
    issuedAt: decoded.iat,
    isExpired: decoded.exp && decoded.exp < now,
    timeToExpiry: decoded.exp ? decoded.exp - now : null,
    scopes: decoded.scope || decoded.scopes || 'not specified'
  };
  
  console.log('🔑 JWT Details:', JSON.stringify(details, null, 2));
  
  if (details.isExpired) {
    console.log('⚠️ WARNING: JWT token is expired!');
    return { valid: false, details, error: 'JWT token expired' };
  }
  
  return { valid: true, details };
}

// Make authenticated request to Employes API - SIMPLIFIED VERSION
async function employesRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
  body?: any
): Promise<EmployesResponse<T>> {
  if (!EMPLOYES_API_KEY) {
    console.log('❌ No API key configured');
    return { error: 'Employes API key not configured' };
  }

  // Step 3: Log JWT Token info (validation done by API)
  console.log('\n=== JWT TOKEN INFO ===');
  console.log(`Token length: ${EMPLOYES_API_KEY.length}`);
  console.log(`Token preview: ${EMPLOYES_API_KEY.substring(0, 20)}...${EMPLOYES_API_KEY.substring(EMPLOYES_API_KEY.length - 20)}`);

  console.log(`\n📡 Making ${method} request to: ${endpoint}`);

  // Use correct Bearer token authentication as per Employes.nl API documentation
  const headers = {
    'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  console.log('🔑 Using Bearer token authentication');
  console.log('📋 Request headers:', Object.keys(headers));
  console.log('🌐 Request URL:', endpoint);

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(body);
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
  }

  console.log('🚀 Sending request...');

  try {
    const response = await fetch(endpoint, config);

    console.log(`\n📨 Response received:`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Request successful!`);
      console.log('📊 Response data preview:', JSON.stringify(data, null, 2));

      await logSync('api_request_success', 'success', `${method} ${endpoint} succeeded`, {
        status: response.status,
        dataType: typeof data,
        hasData: !!data,
        dataKeys: typeof data === 'object' ? Object.keys(data) : []
      });

      return { data, status: response.status };
    } else {
      const errorText = await response.text();
      console.log(`❌ Request failed with status ${response.status}`);
      console.log(`Error response:`, errorText);

      await logSync('api_request_failed', 'error', `${method} ${endpoint} failed`, {
        status: response.status,
        statusText: response.statusText,
        errorResponse: errorText
      });

      return {
        error: `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
        status: response.status
      };
    }
  } catch (networkError: any) {
    console.log(`💥 Network error:`, networkError.message);
    console.log('Error stack:', networkError.stack);

    await logSync('api_network_error', 'error', `Network error for ${endpoint}`, {
      error: networkError.message,
      stack: networkError.stack,
      endpoint
    });

    return { error: `Network error: ${networkError.message}` };
  }
}

// Fetch employees from Employes API (with pagination support)
async function fetchEmployesEmployees(): Promise<EmployesResponse<any>> {
  const endpoints = await getAPIEndpoints();
  console.log('Fetching all employees from:', endpoints.employees);
  
  try {
    let allEmployees: EmployesEmployee[] = [];
    let currentPage = 1;
    let totalPages = 1;
    
    do {
      const url = `${endpoints.employees}?page=${currentPage}&per_page=100`;
      console.log(`Fetching page ${currentPage}/${totalPages}:`, url);
      
      const result = await employesRequest<any>(url);
      
      if (result.error) {
        return result;
      }
      
      if (result.data && result.data.data) {
        allEmployees = allEmployees.concat(result.data.data);
        totalPages = result.data.pages || 1;
        currentPage++;
        
        console.log(`Fetched ${result.data.data.length} employees from page ${currentPage - 1}, total so far: ${allEmployees.length}`);
        
        // Log specific employee with all UUID fields for debugging
        if (result.data.data.length > 0) {
          const firstEmployee = result.data.data[0];
          console.log('🔍 FIRST EMPLOYEE COMPLETE DATA:', JSON.stringify(firstEmployee, null, 2));
          
          // Check for Adéla specifically  
          const adela = result.data.data.find((emp: any) => 
            emp.first_name === 'Adéla' || emp.first_name?.includes('Adéla')
          );
          if (adela) {
            console.log('🎯 ADÉLA COMPLETE DATA:', JSON.stringify(adela, null, 2));
          }
          
          // Check for Anastasio too since they should both have same location UUID
          const anastasio = result.data.data.find((emp: any) => 
            emp.first_name === 'Anastasio' || emp.first_name?.includes('Anastasio')
          );
          if (anastasio) {
            console.log('🎯 ANASTASIO COMPLETE DATA:', JSON.stringify(anastasio, null, 2));
          }
        }
      } else {
        break;
      }
      
    } while (currentPage <= totalPages);
    
    await logSync('fetch_employees', 'success', `Fetched ${allEmployees.length} employees from Employes across ${totalPages} pages`);
    
    return { 
      data: {
        data: allEmployees,
        total: allEmployees.length,
        pages: totalPages
      }
    };
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    await logSync('fetch_employees', 'error', `Failed to fetch employees: ${error.message}`);
    return { error: error.message };
  }
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

    const employesStaff = employesResult.data?.data || [];
    
    // Compare data
    const lmsNames = new Set(lmsStaff?.map(s => s.full_name.toLowerCase()) || []);
    const employesNames = new Set(employesStaff.map((e: any) => `${e.first_name} ${e.surname_prefix ? e.surname_prefix + ' ' : ''}${e.surname}`.toLowerCase()));

    const lmsOnly = lmsStaff?.filter(s => !employesNames.has(s.full_name.toLowerCase())) || [];
    const employesOnly = employesStaff.filter((e: any) => {
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
  } catch (error: any) {
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

    const employees = employesResult.data?.data || [];
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
      } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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

    const { data: employeeMappings } = await supabase
      .from('employes_employee_map')
      .select('id', { count: 'exact' });

    const { data: wageMappings } = await supabase
      .from('employes_wage_map')
      .select('id', { count: 'exact' });

    // Calculate weekly success rate from recent logs
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const recentLogs = logs?.filter(log => new Date(log.created_at) >= weekStart) || [];
    const successful = recentLogs.filter(l => l.status === 'success').length;
    const failed = recentLogs.filter(l => l.status === 'error').length;

    const stats = {
      mappedEmployees: employeeMappings?.length || 0,
      mappedWageComponents: wageMappings?.length || 0,
      weeklySuccessRate: { successful, failed },
      lastSyncAt: logs?.[0]?.created_at || null,
      // Keep legacy fields for backward compatibility
      total_staff: employeeMappings?.length || 0,
      recent_logs: logs?.length || 0,
      last_sync: logs?.[0]?.created_at || null,
      success_rate: recentLogs.length > 0 ? 
        Math.round((successful / recentLogs.length) * 100) : 0
    };

    return { data: stats };
  } catch (error: any) {
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
  } catch (error: any) {
    return { error: error.message };
  }
}

// Step 5: Test connection incrementally
async function testConnection(): Promise<EmployesResponse<any>> {
  if (!EMPLOYES_API_KEY) {
    return { error: 'Employes API key not configured' };
  }

  console.log('\n🧪 === INCREMENTAL CONNECTION TEST ===');
  const testResults: any[] = [];
  
  try {
    // Test 1: API Root connectivity
    console.log('\n1️⃣ Testing API root connectivity...');
    const rootTest = await employesRequest(`${EMPLOYES_BASE_URL}/companies`);
    testResults.push({
      test: 'api_root',
      success: !rootTest.error,
      endpoint: `${EMPLOYES_BASE_URL}/companies`,
      result: rootTest.error || 'Connected successfully',
      status: rootTest.status
    });
    
    if (rootTest.error) {
      console.log('❌ API root test failed, stopping here');
      return { 
        error: `API root connectivity failed: ${rootTest.error}`,
        data: { test_results: testResults }
      };
    }
    console.log('✅ API root connectivity: SUCCESS');

    // Test 2: Company-specific endpoint
    console.log('\n2️⃣ Testing company-specific endpoint...');
    const companyId = "b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6";
    const companyEndpoint = `${EMPLOYES_BASE_URL}/${companyId}`;
    const companyTest = await employesRequest(companyEndpoint);
    testResults.push({
      test: 'company_endpoint',
      success: !companyTest.error,
      endpoint: companyEndpoint,
      result: companyTest.error || 'Company endpoint accessible',
      status: companyTest.status
    });
    
    if (companyTest.error) {
      console.log('❌ Company endpoint test failed');
      return { 
        error: `Company endpoint failed: ${companyTest.error}`,
        data: { test_results: testResults }
      };
    }
    console.log('✅ Company endpoint: SUCCESS');

    // Test 3: Employee endpoint with minimal data
    console.log('\n3️⃣ Testing employee endpoint...');
    const employeeEndpoint = `${EMPLOYES_BASE_URL}/${companyId}/employees?per_page=1`;
    const employeeTest = await employesRequest(employeeEndpoint);
    testResults.push({
      test: 'employee_endpoint',
      success: !employeeTest.error,
      endpoint: employeeEndpoint,
      result: employeeTest.error || 'Employee data accessible',
      status: employeeTest.status,
      data_preview: employeeTest.data ? {
        has_data: !!(employeeTest.data as any).data,
        data_count: (employeeTest.data as any).data ? (employeeTest.data as any).data.length : 0,
        total: (employeeTest.data as any).total || 0,
        structure: typeof employeeTest.data
      } : null
    });
    
    if (employeeTest.error) {
      console.log('❌ Employee endpoint test failed');
      return { 
        error: `Employee endpoint failed: ${employeeTest.error}`,
        data: { test_results: testResults }
      };
    }
    console.log('✅ Employee endpoint: SUCCESS');
    
    console.log('\n🎉 All connection tests passed!');
    
    await logSync('connection_test', 'success', 'All incremental connection tests passed', {
      tests_passed: testResults.length,
      all_successful: true,
      test_details: testResults
    });

    return { 
      data: { 
        status: 'fully_connected',
        api_version: 'v4',
        company_id: companyId,
        base_url: EMPLOYES_BASE_URL,
        test_results: testResults,
        jwt_validation: validateJWTAndLog(EMPLOYES_API_KEY),
        response_preview: (employeeTest.data as any)
      } 
    };
  } catch (error: any) {
    console.log('💥 Connection test error:', error.message);
    
    await logSync('connection_test', 'error', `Connection test failed: ${error.message}`, {
      test_results: testResults,
      error_details: error.message
    });
    
    return { 
      error: `Connection test failed: ${error.message}`,
      data: { test_results: testResults }
    };
  }
}

// Debug connection with detailed information
async function debugConnection(): Promise<EmployesResponse<any>> {
  try {
    const companyId = "b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6";
    const baseUrl = `${EMPLOYES_BASE_URL}/${companyId}`;
    
    // Add comprehensive environment debugging
    const envDebug = {
      EMPLOYES_API_KEY: EMPLOYES_API_KEY ? 'SET' : 'NOT_SET',
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'SET' : 'NOT_SET',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'NOT_SET',
      available_env_vars: Object.keys(Deno.env.toObject()).filter(key => 
        key.includes('EMPLOYES') || key.includes('SUPABASE')
      )
    };
    
    const debugInfo: any = {
      // Match frontend expectations exactly
      apiKey: EMPLOYES_API_KEY ? `${EMPLOYES_API_KEY.substring(0, 10)}...${EMPLOYES_API_KEY.substring(EMPLOYES_API_KEY.length - 4)}` : 'Not configured',
      apiKeyLength: EMPLOYES_API_KEY?.length || 0,
      apiKeyPreview: EMPLOYES_API_KEY ? `${EMPLOYES_API_KEY.substring(0, 4)}...` : null,
      baseUrl: baseUrl,
      testResults: [],
      // Legacy fields for backward compatibility
      api_key_configured: !!EMPLOYES_API_KEY,
      api_key_length: EMPLOYES_API_KEY?.length || 0,
      company_id: companyId,
      base_url: baseUrl,
      endpoints: null,
      test_results: [],
      environment: envDebug,
      authentication_tests: []
    };

    if (EMPLOYES_API_KEY) {
      try {
        debugInfo.endpoints = await getAPIEndpoints();
        
        // Test basic connectivity
        const testResult = await testConnection();
        const connectivityTest = {
          test: 'basic_connection',
          success: !testResult.error,
          result: testResult.data || testResult.error
        };
        
        debugInfo.test_results.push(connectivityTest);
        debugInfo.testResults.push(connectivityTest);

      } catch (error: any) {
        const endpointTest = {
          test: 'endpoint_generation',
          success: false,
          error: error.message
        };
        debugInfo.test_results.push(endpointTest);
        debugInfo.testResults.push(endpointTest);
      }
    } else {
      const apiKeyTest = {
        test: 'api_key_check',
        success: false,
        error: 'API key not configured in environment variables'
      };
      debugInfo.test_results.push(apiKeyTest);
      debugInfo.testResults.push(apiKeyTest);
    }

    return { data: debugInfo };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Discover available endpoints
async function discoverEndpoints(): Promise<EmployesResponse<any>> {
  try {
    const companyId = "b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6";
    
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
  } catch (error: any) {
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
          details: (parseError as any).message
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
        validActions: ['test_connection', 'fetch_companies', 'fetch_employees', 'compare_staff_data', 'sync_employees', 'sync_wage_data', 'sync_from_employes', 'get_sync_statistics', 'get_sync_logs', 'discover_endpoints', 'debug_connection']
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

      case 'fetch_companies':
        result = await fetchCompanies();
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
          data: {
            validActions: ['test_connection', 'fetch_companies', 'fetch_employees', 'compare_staff_data', 'sync_employees', 'sync_wage_data', 'sync_from_employes', 'get_sync_statistics', 'get_sync_logs', 'discover_endpoints', 'debug_connection']
          }
        };
    }

    console.log(`[${new Date().toISOString()}] Action ${action} completed. Success: ${!result.error}`);
    
    // Return 200 for business logic errors, 400 only for malformed requests
    // This allows the frontend to handle API/configuration errors gracefully
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Always return 200 for successful request processing
    });

  } catch (error: any) {
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