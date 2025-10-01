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

// Log sync activity with enhanced fields
async function logSync(action: string, status: 'success' | 'error' | 'info', message: string, employes_employee_id?: string, lms_staff_id?: string, error_message?: string) {
  try {
    await supabase.from('employes_sync_logs').insert({
      action,
      status,
      message,
      employes_employee_id,
      lms_staff_id,
      error_message,
      details: null
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

      await logSync('api_request_success', 'success', `${method} ${endpoint} succeeded`);

      return { data, status: response.status };
    } else {
      const errorText = await response.text();
      console.log(`❌ Request failed with status ${response.status}`);
      console.log(`Error response:`, errorText);

      await logSync('api_request_failed', 'error', `${method} ${endpoint} failed`);

      return {
        error: `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
        status: response.status
      };
    }
  } catch (networkError: any) {
    console.log(`💥 Network error:`, networkError.message);
    console.log('Error stack:', networkError.stack);

    await logSync('api_network_error', 'error', `Network error for ${endpoint}`);

    return { error: `Network error: ${networkError.message}` };
  }
}

// Enhanced data validation function to prevent iteration errors
function validateEmploymentData(data: any, source: string = 'API'): EmployesEmployee[] {
  console.log(`🔍 Validating employment data from ${source}:`, typeof data);

  if (!data) {
    console.warn(`No employment data received from ${source}`);
    return [];
  }

  // Handle multiple response formats from Employes.nl API
  let employees: any;

  if (Array.isArray(data)) {
    employees = data;
  } else if (data.data && Array.isArray(data.data)) {
    employees = data.data;
  } else if (data.employees && Array.isArray(data.employees)) {
    employees = data.employees;
  } else if (typeof data === 'object' && data !== null) {
    // Check if it's a single employee object
    if (data.id && data.first_name) {
      employees = [data];
    } else {
      console.warn(`Employment data structure not recognized from ${source}:`, Object.keys(data));
      return [];
    }
  } else {
    console.error(`Employment data validation failed from ${source}:`, typeof data);
    throw new Error(`Invalid employment data from ${source}: expected array or object with data property, received ${typeof data}`);
  }

  if (!Array.isArray(employees)) {
    console.error(`Final employees data is not an array from ${source}:`, typeof employees);
    throw new Error(`Expected employees array from ${source}, received ${typeof employees}`);
  }

  // Filter and validate individual employee records
  const validEmployees = employees.filter((emp: any, index: number) => {
    if (!emp || typeof emp !== 'object') {
      console.warn(`Skipping invalid employee at index ${index}:`, typeof emp);
      return false;
    }

    const hasBasicInfo = emp.id && emp.first_name;
    if (!hasBasicInfo) {
      console.warn(`Skipping employee with missing basic info at index ${index}:`, {
        id: emp.id,
        first_name: emp.first_name,
        surname: emp.surname
      });
      return false;
    }

    return true;
  });

  console.log(`✅ Validated ${validEmployees.length}/${employees.length} employees from ${source}`);
  return validEmployees;
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
      
      if (result.data) {
        // Use enhanced validation to process API response
        const validatedEmployees = validateEmploymentData(result.data, `Page ${currentPage}`);
        allEmployees = allEmployees.concat(validatedEmployees);
        totalPages = result.data.pages || 1;
        currentPage++;

        console.log(`Fetched and validated ${validatedEmployees.length} employees from page ${currentPage - 1}, total so far: ${allEmployees.length}`);
        
        // Log specific employee with all UUID fields for debugging
        if (validatedEmployees.length > 0) {
          const firstEmployee = validatedEmployees[0];
          console.log('🔍 FIRST VALIDATED EMPLOYEE DATA:', JSON.stringify(firstEmployee, null, 2));

          // Check for Adéla specifically
          const adela = validatedEmployees.find((emp: any) =>
            emp.first_name === 'Adéla' || emp.first_name?.includes('Adéla')
          );
          if (adela) {
            console.log('🎯 ADÉLA VALIDATED DATA:', JSON.stringify(adela, null, 2));
          }

          // Check for Anastasio too since they should both have same location UUID
          const anastasio = validatedEmployees.find((emp: any) =>
            emp.first_name === 'Anastasio' || emp.first_name?.includes('Anastasio')
          );
          if (anastasio) {
            console.log('🎯 ANASTASIO VALIDATED DATA:', JSON.stringify(anastasio, null, 2));
          }
        }
      } else {
        break;
      }
      
    } while (currentPage <= totalPages);
    
    // Final validation of all collected employees
    const finalValidatedEmployees = validateEmploymentData(allEmployees, 'Final Collection');

    await logSync('fetch_employees', 'success', `Fetched and validated ${finalValidatedEmployees.length} employees from Employes across ${totalPages} pages`);

    return {
      data: {
        data: finalValidatedEmployees,
        total: finalValidatedEmployees.length,
        pages: totalPages
      }
    };
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    await logSync('fetch_employees', 'error', `Failed to fetch employees: ${error.message}`);
    return { error: error.message };
  }
}

// ============================================================================
// PHASE 1: COMPREHENSIVE DATA COLLECTION SYSTEM
// ============================================================================

// Calculate MD5 hash for change detection
async function calculateDataHash(data: any): Promise<string> {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Store raw API response with change detection
async function storeRawData(
  employeeId: string,
  endpoint: string,
  apiResponse: any
): Promise<{ stored: boolean; changed: boolean; error?: string }> {
  try {
    const dataHash = await calculateDataHash(apiResponse);
    
    // Check if data changed
    const { data: existingData } = await supabase
      .from('employes_raw_data')
      .select('data_hash, id')
      .eq('employee_id', employeeId)
      .eq('endpoint', endpoint)
      .eq('is_latest', true)
      .single();
    
    const hasChanged = !existingData || existingData.data_hash !== dataHash;
    
    if (hasChanged) {
      // Mark old data as not latest
      if (existingData) {
        await supabase
          .from('employes_raw_data')
          .update({ is_latest: false })
          .eq('employee_id', employeeId)
          .eq('endpoint', endpoint)
          .eq('is_latest', true);
      }
      
      // Insert new data
      const { error: insertError } = await supabase
        .from('employes_raw_data')
        .insert({
          employee_id: employeeId,
          endpoint,
          api_response: apiResponse,
          data_hash: dataHash,
          is_latest: true
        });
      
      if (insertError) {
        console.error(`Error storing raw data for ${employeeId}/${endpoint}:`, insertError);
        return { stored: false, changed: false, error: insertError.message };
      }
      
      return { stored: true, changed: true };
    }
    
    return { stored: false, changed: false };
  } catch (error: any) {
    console.error(`Error in storeRawData:`, error);
    return { stored: false, changed: false, error: error.message };
  }
}

// Detect and log changes
async function detectChanges(
  snapshotId: string,
  employeeId: string,
  endpoint: string,
  previousHash: string | null,
  newHash: string,
  previousData: any,
  newData: any
): Promise<void> {
  try {
    const changeType = !previousHash ? 'new' : 'updated';
    
    await supabase
      .from('employes_change_detection')
      .insert({
        snapshot_id: snapshotId,
        employee_id: employeeId,
        endpoint,
        change_type: changeType,
        previous_hash: previousHash,
        new_hash: newHash,
        previous_data: previousData,
        new_data: newData,
        processed: false
      });
    
    console.log(`✅ Change detected: ${employeeId}/${endpoint} - ${changeType}`);
  } catch (error: any) {
    console.error(`Error detecting changes:`, error);
  }
}

// Comprehensive data collection for a single employee
async function collectEmployeeData(
  snapshotId: string,
  employeeId: string,
  companyId: string
): Promise<{ success: boolean; endpointsCollected: string[]; errors: string[] }> {
  const endpointsCollected: string[] = [];
  const errors: string[] = [];
  
  // Define all endpoints to collect
  const endpoints = [
    { name: '/employee', url: `${EMPLOYES_BASE_URL}/${companyId}/employees/${employeeId}` },
    { name: '/employments', url: `${EMPLOYES_BASE_URL}/${companyId}/employees/${employeeId}/employments` },
    { name: '/payslips', url: `${EMPLOYES_BASE_URL}/${companyId}/employees/${employeeId}/payslips` },
    { name: '/contracts', url: `${EMPLOYES_BASE_URL}/${companyId}/employees/${employeeId}/contracts` },
    { name: '/absences', url: `${EMPLOYES_BASE_URL}/${companyId}/employees/${employeeId}/absences` },
    { name: '/hours', url: `${EMPLOYES_BASE_URL}/${companyId}/employees/${employeeId}/hours` },
    { name: '/documents', url: `${EMPLOYES_BASE_URL}/${companyId}/employees/${employeeId}/documents` },
  ];
  
  console.log(`📦 Collecting data for employee ${employeeId} from ${endpoints.length} endpoints`);
  
  for (const endpoint of endpoints) {
    try {
      console.log(`  Fetching ${endpoint.name}...`);
      const response = await employesRequest<any>(endpoint.url);
      
      if (response.error) {
        errors.push(`${endpoint.name}: ${response.error}`);
        console.warn(`  ⚠️ ${endpoint.name} failed: ${response.error}`);
        continue;
      }
      
      if (response.data) {
        // Store raw data with change detection
        const { stored, changed, error } = await storeRawData(
          employeeId,
          endpoint.name,
          response.data
        );
        
        if (stored && changed) {
          console.log(`  ✅ ${endpoint.name}: NEW DATA STORED`);
          // This will be used for change tracking
          await detectChanges(
            snapshotId,
            employeeId,
            endpoint.name,
            null,
            await calculateDataHash(response.data),
            null,
            response.data
          );
        } else if (!changed) {
          console.log(`  ℹ️ ${endpoint.name}: No changes`);
        } else if (error) {
          errors.push(`${endpoint.name}: ${error}`);
        }
        
        endpointsCollected.push(endpoint.name);
      }
    } catch (error: any) {
      errors.push(`${endpoint.name}: ${error.message}`);
      console.error(`  ❌ ${endpoint.name} exception:`, error);
    }
  }
  
  return {
    success: errors.length < endpoints.length,
    endpointsCollected,
    errors
  };
}

// Main comprehensive collection orchestrator
async function runComprehensiveDataCollection(autoSync = false): Promise<EmployesResponse<any>> {
  console.log('\n🚀 ============================================================');
  console.log('🚀 PHASE 1: COMPREHENSIVE DATA COLLECTION');
  if (autoSync) console.log('🔄 AUTO-SYNC ENABLED: Will sync to staff table after collection');
  console.log('🚀 ============================================================\n');
  
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    
    // Step 1: Create snapshot
    console.log('📸 Creating data snapshot...');
    const { data: snapshot, error: snapshotError } = await supabase
      .from('employes_data_snapshots')
      .insert({
        snapshot_type: 'comprehensive',
        status: 'running',
        total_employees: 0,
        employees_processed: 0,
        endpoints_collected: [],
        errors: []
      })
      .select()
      .single();
    
    if (snapshotError || !snapshot) {
      throw new Error(`Failed to create snapshot: ${snapshotError?.message}`);
    }
    
    console.log(`✅ Snapshot created: ${snapshot.id}`);
    
    // Step 2: Fetch all employees
    console.log('\n👥 Fetching all employees...');
    const employeesResponse = await fetchEmployesEmployees();
    
    if (employeesResponse.error) {
      throw new Error(employeesResponse.error);
    }
    
    const rawEmployesData = employeesResponse.data?.data || employeesResponse.data || [];
    const employees = validateEmploymentData(rawEmployesData, 'Comprehensive Collection');
    
    console.log(`✅ Found ${employees.length} employees\n`);
    
    // Update snapshot with total
    await supabase
      .from('employes_data_snapshots')
      .update({ total_employees: employees.length })
      .eq('id', snapshot.id);
    
    // Step 3: Collect data for each employee
    console.log('📊 Starting data collection for all employees...\n');
    let processedCount = 0;
    const allEndpoints = new Set<string>();
    const allErrors: string[] = [];
    
    for (const employee of employees) {
      console.log(`\n[${processedCount + 1}/${employees.length}] Processing ${employee.first_name} ${employee.surname} (${employee.id})`);
      
      const result = await collectEmployeeData(snapshot.id, employee.id, companyId);
      
      result.endpointsCollected.forEach(e => allEndpoints.add(e));
      allErrors.push(...result.errors);
      
      processedCount++;
      
      // Update progress every 10 employees
      if (processedCount % 10 === 0) {
        await supabase
          .from('employes_data_snapshots')
          .update({
            employees_processed: processedCount,
            endpoints_collected: Array.from(allEndpoints),
            errors: allErrors
          })
          .eq('id', snapshot.id);
        
        console.log(`\n📈 Progress: ${processedCount}/${employees.length} (${Math.round(processedCount/employees.length*100)}%)`);
      }
    }
    
    // Step 4: Complete snapshot
    console.log('\n✅ Data collection complete!');
    await supabase
      .from('employes_data_snapshots')
      .update({
        status: 'completed',
        employees_processed: processedCount,
        endpoints_collected: Array.from(allEndpoints),
        errors: allErrors,
        completed_at: new Date().toISOString()
      })
      .eq('id', snapshot.id);
    
    // Collect company-wide data
    console.log('\n🏢 Collecting company-wide data...');
    const payrunsUrl = `${EMPLOYES_BASE_URL}/${companyId}/payruns`;
    const payrunsResponse = await employesRequest<any>(payrunsUrl);
    
    if (payrunsResponse.data) {
      await storeRawData('company', '/payruns', payrunsResponse.data);
      console.log('✅ Payruns data collected');
    }
    
    console.log('\n📊 COLLECTION SUMMARY:');
    console.log(`   Employees processed: ${processedCount}/${employees.length}`);
    console.log(`   Unique endpoints: ${allEndpoints.size}`);
    console.log(`   Errors: ${allErrors.length}`);
    console.log(`   Snapshot ID: ${snapshot.id}`);
    
    await logSync('comprehensive_collection', 'success', `Collected data for ${processedCount} employees`);
    
    // PHASE 3: Auto-sync to staff table if enabled
    let syncResults = null;
    if (autoSync) {
      console.log('\n🔄 ============================================================');
      console.log('🔄 PHASE 3: AUTO-SYNC TO STAFF TABLE');
      console.log('🔄 ============================================================\n');
      
      // Use the new sync from raw data function
      const syncResponse = await syncFromRawData();
      if (syncResponse.error) {
        console.error('❌ Auto-sync failed:', syncResponse.error);
        await logSync('auto_sync', 'error', `Auto-sync failed: ${syncResponse.error}`);
      } else {
        syncResults = syncResponse.data;
        console.log('✅ Auto-sync completed successfully!');
        console.log(`   Created/Updated: ${syncResults.success}`);
        console.log(`   Failed: ${syncResults.failed}`);
      }
    }
    
    return {
      data: {
        success: true,
        snapshot_id: snapshot.id,
        employees_processed: processedCount,
        total_employees: employees.length,
        endpoints_collected: Array.from(allEndpoints),
        errors: allErrors,
        auto_sync_results: syncResults
      }
    };
    
  } catch (error: any) {
    console.error('❌ Comprehensive collection failed:', error);
    await logSync('comprehensive_collection', 'error', `Failed: ${error.message}`);
    return { error: error.message };
  }
}

// ============================================================================
// END PHASE 1 CODE
// ============================================================================

// Enhanced smart matching algorithm
function calculateNameSimilarity(name1: string, name2: string): number {
  if (!name1 || !name2) return 0;
  
  const n1 = name1.toLowerCase().trim();
  const n2 = name2.toLowerCase().trim();
  
  if (n1 === n2) return 1;
  
  // Simple Levenshtein distance implementation
  const matrix = Array(n2.length + 1).fill(null).map(() => Array(n1.length + 1).fill(null));
  
  for (let i = 0; i <= n1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= n2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= n2.length; j++) {
    for (let i = 1; i <= n1.length; i++) {
      const cost = n1[i - 1] === n2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,     // deletion
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  const maxLength = Math.max(n1.length, n2.length);
  return 1 - (matrix[n2.length][n1.length] / maxLength);
}

interface EmployeeMatch {
  employes: any;
  lms?: any;
  matchType: 'exact' | 'similar' | 'new';
  confidence: number;
  conflicts: string[];
}

// Enhanced compare staff data with smart matching
async function compareStaffData(): Promise<EmployesResponse<any>> {
  console.log('🔄 Starting enhanced staff data comparison...');
  
  try {
    // Fetch employees from Employes
    const employesResponse = await fetchEmployesEmployees();
    if (employesResponse.error) {
      throw new Error(employesResponse.error);
    }
    
    // Fetch current LMS staff
    const { data: lmsStaff, error: lmsError } = await supabase
      .from('staff')
      .select('*');
    
    if (lmsError) {
      throw new Error(`Failed to fetch LMS staff: ${lmsError.message}`);
    }
    
    // Apply enhanced validation to the fetched data
    const rawEmployesData = employesResponse.data?.data || employesResponse.data || [];
    const employesData = validateEmploymentData(rawEmployesData, 'Compare Staff Data');

    console.log(`📊 Comparison data: ${employesData.length} validated Employes employees vs ${lmsStaff?.length || 0} LMS staff`);
    
    const matches: EmployeeMatch[] = [];
    const usedLmsIds = new Set();
    
    for (const emp of employesData) {
      let bestMatch: EmployeeMatch = {
        employes: emp,
        matchType: 'new',
        confidence: 0,
        conflicts: []
      };
      
      // Try to find matches in LMS staff
      for (const staff of lmsStaff || []) {
        if (usedLmsIds.has(staff.id)) continue;
        
        let confidence = 0;
        const conflicts: string[] = [];
        
        // Email match (highest priority)
        if (emp.email && staff.email && emp.email.toLowerCase() === staff.email.toLowerCase()) {
          confidence += 0.8;
        } else if (emp.email && staff.email && emp.email.toLowerCase() !== staff.email.toLowerCase()) {
          conflicts.push('email_mismatch');
        }
        
        // Name similarity
        const fullEmployesName = `${emp.first_name || ''} ${emp.surname || ''}`.trim();
        const nameSimilarity = calculateNameSimilarity(fullEmployesName, staff.full_name || '');
        confidence += nameSimilarity * 0.4;
        
        if (nameSimilarity < 0.7 && confidence > 0) {
          conflicts.push('name_mismatch');
        }
        
        // Phone match
        if (emp.phone_number && staff.phone_number && emp.phone_number === staff.phone_number) {
          confidence += 0.1;
        }
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            employes: emp,
            lms: staff,
            matchType: confidence > 0.7 ? 'exact' : 'similar',
            confidence,
            conflicts
          };
        }
      }
      
      if (bestMatch.lms) {
        usedLmsIds.add(bestMatch.lms.id);
      }
      
      matches.push(bestMatch);
    }
    
    const exactMatches = matches.filter(m => m.matchType === 'exact').length;
    const similarMatches = matches.filter(m => m.matchType === 'similar').length;
    const newEmployees = matches.filter(m => m.matchType === 'new').length;
    const totalConflicts = matches.reduce((sum, m) => sum + m.conflicts.length, 0);
    
    console.log(`📈 Match results: ${exactMatches} exact, ${similarMatches} similar, ${newEmployees} new, ${totalConflicts} conflicts`);
    
    const result = {
      totalEmployes: employesData.length,
      totalLMS: lmsStaff?.length || 0,
      matches: exactMatches + similarMatches,
      newEmployees,
      conflicts: totalConflicts,
      matchDetails: matches
    };
    
    await logSync('compare_data', 'success', `Compared ${lmsStaff?.length || 0} LMS staff with ${employesData.length} Employes employees`);
    
    return { data: result };
    
  } catch (error: any) {
    console.error('❌ Error in compareStaffData:', error);
    await logSync('compare_data', 'error', error.message);
    return { error: error.message };
  }
}

// Transform Employes data to LMS format - ENHANCED VERSION with ALL available fields
function transformEmployesDataForLMS(employes: any) {
  return {
    // Basic Information
    full_name: `${employes.first_name || ''} ${employes.surname || ''}`.trim(),
    email: employes.email,
    phone_number: employes.phone || employes.mobile,
    employes_id: employes.id,
    employee_number: employes.employee_number,
    
    // Personal Information
    birth_date: employes.date_of_birth ? new Date(employes.date_of_birth).toISOString().split('T')[0] : null,
    nationality: employes.country_code || employes.nationality_id,
    
    // Address Information - COMPREHENSIVE
    street_address: employes.street,
    house_number: employes.housenumber,
    city: employes.city,
    zipcode: employes.zipcode,
    
    // Employment Information - EXPANDED
    employment_start_date: employes.start_date ? new Date(employes.start_date).toISOString().split('T')[0] : null,
    employment_end_date: employes.end_date ? new Date(employes.end_date).toISOString().split('T')[0] : null,
    employment_status: employes.status,
    working_hours_per_week: employes.hours_per_week,
    salary_amount: employes.salary,
    hourly_wage: employes.hourly_rate,
    contract_type: employes.contract_type || employes.employment_type,
    
    // Department and Location - DETAILED  
    department: employes.department || employes.afdeling,
    location: employes.location,
    role: employes.position || employes.role || employes.job_title,
    
    // Additional Metadata
    last_sync_at: new Date().toISOString(),
    
    // Raw Employes Data for Reference
    employes_raw_data: {
      original_id: employes.id,
      department_id: employes.department_id,
      location_id: employes.location_id,
      initials: employes.initials,
      surname_prefix: employes.surname_prefix,
      gender: employes.gender,
      personal_identification_number: employes.personal_identification_number
    }
  };
}

// NEW: Sync from raw data table instead of API
async function syncFromRawData(): Promise<EmployesResponse<any>> {
  console.log('🔄 Syncing staff from employes_raw_data...');
  
  try {
    // Fetch all employee data from raw_data table
    const { data: rawEmployees, error: fetchError } = await supabase
      .from('employes_raw_data')
      .select('*')
      .eq('endpoint', '/employee')
      .eq('is_latest', true);
    
    if (fetchError) {
      throw new Error(`Failed to fetch raw data: ${fetchError.message}`);
    }
    
    if (!rawEmployees || rawEmployees.length === 0) {
      throw new Error('No employee data found in employes_raw_data');
    }
    
    console.log(`Found ${rawEmployees.length} employees in raw_data`);
    
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (const rawEmployee of rawEmployees) {
      try {
        const employee = rawEmployee.api_response as any;
        
        // Transform to staff format
        const staffData = {
          full_name: `${employee.first_name || ''} ${employee.surname || ''}`.trim(),
          email: employee.email,
          phone_number: employee.phone || employee.mobile,
          employes_id: employee.id,
          employee_number: employee.employee_number,
          birth_date: employee.date_of_birth ? new Date(employee.date_of_birth).toISOString().split('T')[0] : null,
          nationality: employee.country_code || employee.nationality_id,
          street_address: employee.street,
          house_number: employee.housenumber,
          city: employee.city,
          zipcode: employee.zipcode,
          iban: employee.iban,
          status: employee.status === 'active' ? 'active' : 'inactive',
          last_sync_at: new Date().toISOString()
        };
        
        // Check if already exists
        const { data: existing } = await supabase
          .from('staff')
          .select('id')
          .eq('employes_id', employee.id)
          .single();
        
        if (existing) {
          // Update existing
          const { error: updateError } = await supabase
            .from('staff')
            .update(staffData)
            .eq('id', existing.id);
          
          if (updateError) {
            throw updateError;
          }
          
          console.log(`✅ Updated: ${staffData.full_name}`);
        } else {
          // Insert new
          const { error: insertError } = await supabase
            .from('staff')
            .insert(staffData);
          
          if (insertError) {
            throw insertError;
          }
          
          console.log(`✅ Created: ${staffData.full_name}`);
        }
        
        success++;
      } catch (error: any) {
        failed++;
        const empName = rawEmployee.api_response?.first_name || 'Unknown';
        errors.push(`${empName}: ${error.message}`);
        console.error(`❌ Failed to sync ${empName}:`, error.message);
      }
    }
    
    console.log(`\n✅ Sync complete: ${success} success, ${failed} failed`);
    
    await logSync('sync_from_raw_data', 'success', `Synced ${success} employees from raw data`);
    
    return {
      data: {
        success,
        failed,
        total: rawEmployees.length,
        errors
      }
    };
  } catch (error: any) {
    console.error('❌ Sync from raw data failed:', error);
    await logSync('sync_from_raw_data', 'error', `Failed: ${error.message}`);
    return { error: error.message };
  }
}

// Enhanced sync employees to LMS
async function syncEmployeesToLMS(): Promise<EmployesResponse<any>> {
  console.log('🔄 Starting enhanced employee sync to LMS...');
  
  try {
    const comparison = await compareStaffData();
    if (comparison.error) {
      throw new Error(comparison.error);
    }
    
    const matches = comparison.data.matchDetails;
    let success = 0;
    let failed = 0;
    let skipped = 0;
    
    await logSync('sync_employees', 'info', `Starting sync of ${matches.length} employees`);
    
    for (const match of matches) {
      try {
        const employesData = transformEmployesDataForLMS(match.employes);
        
        if (match.matchType === 'new') {
          // Create new staff member
          const { data, error } = await supabase
            .from('staff')
            .insert(employesData)
            .select()
            .single();
          
          if (error) {
            console.error(`❌ Failed to create staff for ${match.employes.first_name}:`, error);
            await logSync('create_staff', 'error', `Failed to create ${match.employes.first_name}`, match.employes.id, undefined, error.message);
            failed++;
          } else {
            console.log(`✅ Created new staff: ${match.employes.first_name} ${match.employes.surname}`);
            await logSync('create_staff', 'success', `Created new staff member`, match.employes.id, data.id);
            
            // Log employment history
            await supabase
              .from('staff_employment_history')
              .insert({
                staff_id: data.id,
                employes_employee_id: match.employes.id,
                change_type: 'hire',
                new_data: match.employes,
                effective_date: employesData.employment_start_date || new Date().toISOString().split('T')[0]
              });
            
            success++;
          }
        } else if (match.matchType === 'exact' || match.matchType === 'similar') {
          // Check for conflicts and log them
          if (match.conflicts.length > 0) {
            await supabase
              .from('staff_sync_conflicts')
              .insert({
                staff_id: match.lms.id,
                employes_employee_id: match.employes.id,
                conflict_type: match.conflicts.join(','),
                lms_data: match.lms,
                employes_data: match.employes
              });
          }
          
          // Update existing staff member
          const { error } = await supabase
            .from('staff')
            .update(employesData)
            .eq('id', match.lms.id);
          
          if (error) {
            console.error(`❌ Failed to update staff ${match.lms.full_name}:`, error);
            await logSync('update_staff', 'error', `Failed to update ${match.lms.full_name}`, match.employes.id, match.lms.id, error.message);
            failed++;
          } else {
            console.log(`✅ Updated staff: ${match.lms.full_name}`);
            await logSync('update_staff', 'success', `Updated staff member`, match.employes.id, match.lms.id);
            success++;
          }
        } else {
          skipped++;
        }
      } catch (error: any) {
        console.error(`❌ Error processing employee ${match.employes.first_name}:`, error);
        await logSync('sync_employee', 'error', `Error processing ${match.employes.first_name}`, match.employes.id, undefined, error.message);
        failed++;
      }
    }
    
    console.log(`📊 Sync completed: ${success} success, ${failed} failed, ${skipped} skipped`);
    await logSync('sync_employees', 'success', `Sync completed: ${success} success, ${failed} failed, ${skipped} skipped`);
    
    return { 
      data: { 
        total: matches.length,
        success, 
        failed, 
        skipped 
      } 
    };
    
  } catch (error: any) {
    console.error('❌ Error in syncEmployeesToLMS:', error);
    await logSync('sync_employees', 'error', 'Sync failed', undefined, undefined, error.message);
    return { error: error.message };
  }
}


// Sync wage data from Employes to LMS - REAL IMPLEMENTATION
async function syncWageDataToEmployes(): Promise<EmployesResponse<any>> {
  try {
    console.log('🏦 Starting wage data synchronization from Employes.nl...');
    
    // Fetch employees (wage data is embedded in employee records)
    const employeesResult = await fetchEmployesEmployees();
    if (employeesResult.error) {
      return { error: `Failed to fetch employees: ${employeesResult.error}` };
    }
    
    const employees = employeesResult.data?.data || [];
    console.log(`📊 Processing wage data for ${employees.length} employees`);
    
    let historyRecordsCreated = 0;
    let financialsUpdated = 0;
    let errors: string[] = [];
    
    for (const employee of employees) {
      try {
        const employeeId = employee.id?.toString() || employee.persoonsid?.toString();
        const fullName = `${employee.first_name || ''} ${employee.surname || ''}`.trim();
        
        if (!employeeId) {
          console.log(`⚠️ Skipping employee without ID: ${fullName}`);
          continue;
        }

        // Find matching LMS staff by Employes ID
        const { data: mappingData } = await supabase
          .from('employes_employee_map')
          .select('lms_staff_id')
          .eq('employes_employee_id', employeeId)
          .maybeSingle();

        if (!mappingData?.lms_staff_id) {
          console.log(`⚠️ No LMS mapping found for: ${fullName}`);
          continue;
        }

        const staffId = mappingData.lms_staff_id;

        // Extract salary data from employee object
        const salaryData = employee.salary || {};
        const contractData = employee.contract || {};
        
        const monthWage = salaryData.month_wage || 0;
        const hourlyWage = salaryData.hour_wage || 0;
        const yearlyWage = salaryData.yearly_wage || 0;
        const hoursPerWeek = contractData.hours_per_week || 0;
        
        // Get salary start date (use contract or employment start date)
        const salaryStartDate = salaryData.start_date || contractData.start_date || employee.start_date;
        const effectiveDate = salaryStartDate ? new Date(salaryStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        if (!monthWage || !hoursPerWeek) {
          console.log(`⚠️ Skipping ${fullName} - missing wage or hours data`);
          continue;
        }

        // Close any previous open salary periods for this staff member
        await supabase
          .from('cao_salary_history')
          .update({ valid_to: new Date(new Date(effectiveDate).getTime() - 86400000).toISOString().split('T')[0] })
          .eq('staff_id', staffId)
          .is('valid_to', null)
          .lt('valid_from', effectiveDate);

        // Insert new salary history record
        const { error: historyError } = await supabase
          .from('cao_salary_history')
          .insert({
            staff_id: staffId,
            employes_employee_id: employeeId,
            gross_monthly: monthWage,
            hourly_wage: hourlyWage,
            yearly_wage: yearlyWage,
            hours_per_week: hoursPerWeek,
            cao_effective_date: effectiveDate,
            valid_from: effectiveDate,
            valid_to: null, // Open-ended - current salary
            data_source: 'employes_sync',
            scale: null, // Manual entry for now
            trede: null  // Manual entry for now
          });

        if (historyError) {
          // Check if it's a duplicate/overlap error
          if (historyError.code === '23P01') {
            console.log(`ℹ️ Salary record already exists for ${fullName} at ${effectiveDate}`);
          } else {
            throw historyError;
          }
        } else {
          historyRecordsCreated++;
          console.log(`✅ Synced wage data for ${fullName}: €${monthWage}/month, ${hoursPerWeek}h/week`);
        }

        // Also update contract_financials if there's an active contract
        const { data: activeContracts } = await supabase
          .from('contracts')
          .select('id')
          .eq('staff_id', staffId)
          .eq('status', 'signed')
          .order('created_at', { ascending: false })
          .limit(1);

        if (activeContracts && activeContracts.length > 0) {
          const contractId = activeContracts[0].id;
          
          // Encrypt sensitive data
          const encryptedData = {
            gross_monthly_encrypted: await encryptData(monthWage.toString()),
            hours_per_week_encrypted: await encryptData(hoursPerWeek.toString()),
            scale_encrypted: null, // Manual for now
            trede_encrypted: null,  // Manual for now
            cao_effective_date: effectiveDate,
            data_source: 'employes_sync',
            last_verified_at: new Date().toISOString()
          };

          const { error: financialsError } = await supabase
            .from('contract_financials')
            .upsert({
              contract_id: contractId,
              ...encryptedData
            }, { onConflict: 'contract_id' });

          if (financialsError) {
            console.log(`⚠️ Error updating contract financials for ${fullName}:`, financialsError.message);
          } else {
            financialsUpdated++;
          }
        }

        await logSync('sync_wage_data', 'success', `Wage data synced for ${fullName}`, employeeId, staffId);
        
      } catch (employeeError: any) {
        const errorMsg = `Error processing ${employee.first_name}: ${employeeError.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
        await logSync('sync_wage_data', 'error', `Failed to sync wage data: ${employeeError.message}`, employee.id);
      }
    }
    
    console.log(`🏦 Wage sync completed: ${historyRecordsCreated} history records, ${financialsUpdated} financials updated, ${errors.length} errors`);
    
    return { 
      data: { 
        success: true,
        message: `Wage sync completed: ${historyRecordsCreated} history records, ${financialsUpdated} financials updated`,
        summary: {
          history_records_created: historyRecordsCreated,
          financials_updated: financialsUpdated,
          errors: errors.length,
          error_details: errors.slice(0, 10)
        }
      } 
    };
    
  } catch (error: any) {
    console.error('Wage sync failed:', error);
    await logSync('sync_wage_data', 'error', error.message);
    return { error: `Wage sync failed: ${error.message}` };
  }
}

/**
 * Sync wage data for a single employee
 */
async function syncIndividualWage(staffId: string) {
  console.log(`🎯 Starting individual wage sync for staff: ${staffId}`);
  const errors: string[] = [];

  try {
    // 1. Get staff details
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, full_name, employes_id')
      .eq('id', staffId)
      .single();

    if (staffError || !staff) {
      console.error('❌ Staff not found:', staffError);
      return {
        data: {
          success: false,
          errors: ['Staff member not found']
        }
      };
    }

    console.log(`👤 Found staff: ${staff.full_name}`);

    // 2. Check if we have an Employes mapping
    let employesId = staff.employes_id;
    let mappingCreated = false;

    if (!employesId) {
      // Try to find mapping in employes_employee_map
      const { data: mapping } = await supabase
        .from('employes_employee_map')
        .select('employes_employee_id')
        .eq('lms_staff_id', staffId)
        .single();

      if (mapping) {
        employesId = mapping.employes_employee_id;
        console.log(`🔗 Found existing mapping: ${employesId}`);
      } else {
        // Need to search by name in Employes
        console.log(`🔍 No mapping found, searching by name: ${staff.full_name}`);
        
        if (!EMPLOYES_API_KEY) {
          return {
            data: {
              success: false,
              errors: ['Employes API key not configured']
            }
          };
        }
        
        const companyId = Deno.env.get('EMPLOYES_COMPANY_ID') || 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
        
        const searchUrl = `${EMPLOYES_BASE_URL}/${companyId}/employees`;
        const searchResponse = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!searchResponse.ok) {
          throw new Error(`Failed to search employees: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        const employees = Array.isArray(searchData.data) ? searchData.data : [];
        
        // Find matching employee by name
        const nameParts = staff.full_name.toLowerCase().split(' ');
        const matchingEmployee = employees.find((emp: any) => {
          const empFullName = `${emp.first_name || ''} ${emp.surname || ''}`.toLowerCase().trim();
          return nameParts.every((part: string) => empFullName.includes(part));
        });

        if (matchingEmployee) {
          employesId = matchingEmployee.id;
          console.log(`✅ Found matching employee: ${matchingEmployee.first_name} ${matchingEmployee.surname}`);
          
          // Create mapping
          const { error: mapError } = await supabase
            .from('employes_employee_map')
            .insert({
              lms_staff_id: staffId,
              employes_employee_id: employesId
            });

          if (mapError) {
            console.error('⚠️ Failed to create mapping:', mapError);
            errors.push('Failed to create employee mapping');
          } else {
            mappingCreated = true;
            console.log('✅ Created employee mapping');
          }
        } else {
          console.error('❌ No matching employee found in Employes');
          return {
            data: {
              success: false,
              errors: ['No matching employee found in Employes.nl. Please verify the employee name.']
            }
          };
        }
      }
    }

    // 3. Fetch employee data from Employes
    console.log(`📡 Fetching employee data from Employes: ${employesId}`);
    
    if (!EMPLOYES_API_KEY) {
      return {
        data: {
          success: false,
          errors: ['Employes API key not configured']
        }
      };
    }
    
    const companyId = Deno.env.get('EMPLOYES_COMPANY_ID') || 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
    
    const employeeUrl = `${EMPLOYES_BASE_URL}/${companyId}/employees`;
    const employeeResponse = await fetch(employeeUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!employeeResponse.ok) {
      throw new Error(`Failed to fetch employee: ${employeeResponse.status}`);
    }

    const employeeData = await employeeResponse.json();
    const employees = Array.isArray(employeeData.data) ? employeeData.data : [];
    const employee = employees.find((e: any) => e.id === employesId);

    if (!employee) {
      console.error('❌ Employee not found in Employes response');
      return {
        data: {
          success: false,
          errors: ['Employee not found in Employes.nl']
        }
      };
    }

    console.log('✅ Found employee data:', {
      name: `${employee.first_name} ${employee.surname}`,
      has_employment: !!employee.employment
    });

    // 4. Extract comprehensive wage and employment data
    const employment = employee.employment || {};
    const salary = employment.salary || {};
    const contract = employment.contract || {};
    const taxDetails = employment.tax_details || {};

    const monthWage = salary.month_wage;
    const hourWage = salary.hour_wage;
    const yearlyWage = salary.yearly_wage;
    const hoursPerWeek = contract.hours_per_week;

    if (!monthWage || !hoursPerWeek) {
      console.error('❌ Missing wage data:', { monthWage, hoursPerWeek });
      return {
        data: {
          success: false,
          employee_found: employee,
          errors: ['Incomplete wage data in Employes.nl']
        }
      };
    }

    console.log(`💰 Wage data found:`, {
      month_wage: monthWage,
      hour_wage: hourWage,
      yearly_wage: yearlyWage,
      hours_per_week: hoursPerWeek
    });

    // 4b. Extract ALL employment dates from nested employment structure
    const employmentStartDate = employment.start_date 
      ? new Date(employment.start_date).toISOString().split('T')[0]
      : null;
    
    const employmentEndDate = employment.end_date 
      ? new Date(employment.end_date).toISOString().split('T')[0]
      : null;
    
    const contractStartDate = contract.start_date 
      ? new Date(contract.start_date).toISOString().split('T')[0]
      : employmentStartDate;
    
    const contractEndDate = contract.end_date 
      ? new Date(contract.end_date).toISOString().split('T')[0]
      : employmentEndDate;
    
    const salaryStartDate = salary.start_date 
      ? new Date(salary.start_date).toISOString().split('T')[0]
      : contractStartDate;
    
    const salaryEndDate = salary.end_date 
      ? new Date(salary.end_date).toISOString().split('T')[0]
      : null;

    // 4c. Update staff table with comprehensive employment data
    const staffUpdateData: any = {
      salary_amount: monthWage,
      hourly_wage: hourWage,
      hours_per_week: hoursPerWeek,
      employment_status: employee.status || 'active'
    };
    
    // Use employment-level dates (broader period)
    if (employmentStartDate) {
      staffUpdateData.employment_start_date = employmentStartDate;
      staffUpdateData.start_date = employmentStartDate; // Also update start_date for backward compatibility
    }
    
    if (employmentEndDate) {
      staffUpdateData.employment_end_date = employmentEndDate;
    }
    
    // Update contract type
    staffUpdateData.contract_type = contractEndDate ? 'fixed-term' : 'permanent';

    const { error: staffUpdateError } = await supabase
      .from('staff')
      .update(staffUpdateData)
      .eq('id', staffId);

    if (staffUpdateError) {
      console.error('⚠️ Failed to update staff table:', staffUpdateError);
      errors.push(`Failed to update staff: ${staffUpdateError.message}`);
    } else {
      console.log('✅ Updated staff table with complete employment data');
    }

    // 5. Create or update salary history record
    const effectiveSalaryDate = salaryStartDate || contractStartDate || new Date().toISOString().split('T')[0];

    // Close any previous open salary periods
    await supabase
      .from('cao_salary_history')
      .update({ valid_to: new Date(new Date(effectiveSalaryDate).getTime() - 86400000).toISOString().split('T')[0] })
      .eq('staff_id', staffId)
      .is('valid_to', null)
      .lt('valid_from', effectiveSalaryDate);

    const { data: historyRecord, error: historyError } = await supabase
      .from('cao_salary_history')
      .insert({
        staff_id: staffId,
        employes_employee_id: employesId,
        gross_monthly: monthWage,
        hourly_wage: hourWage,
        yearly_wage: yearlyWage,
        hours_per_week: hoursPerWeek,
        cao_effective_date: effectiveSalaryDate,
        valid_from: effectiveSalaryDate,
        valid_to: salaryEndDate,
        data_source: 'employes_sync',
        scale: null,
        trede: null
      })
      .select()
      .single();

    if (historyError) {
      // Check if it's a duplicate
      if (historyError.code === '23P01') {
        console.log('ℹ️ Salary record already exists for this period');
      } else {
        console.error('❌ Failed to create salary history:', historyError);
        errors.push(`Failed to create salary history: ${historyError.message}`);
      }
    } else {
      console.log('✅ Created salary history record');
    }

    // 6. Create or update contract record with FULL details
    // Check if contract already exists for this exact period
    const { data: existingContracts } = await supabase
      .from('contracts')
      .select('id, query_params')
      .eq('staff_id', staffId)
      .eq('employee_name', staff.full_name);

    // Find contract matching this exact period
    const matchingContract = existingContracts?.find(c => 
      c.query_params?.startDate === contractStartDate &&
      c.query_params?.endDate === contractEndDate
    );

    let contractId = matchingContract?.id || null;
    let contractCreated = false;

    const contractData = {
      staff_id: staffId,
      employee_name: staff.full_name,
      status: employee.status === 'active' ? 'signed' : 'draft',
      contract_type: contractEndDate ? 'fixed-term' : 'permanent',
      query_params: {
        // Contract Period (most specific)
        startDate: contractStartDate,
        endDate: contractEndDate,
        
        // Employment Period (broader)
        employmentStartDate: employmentStartDate,
        employmentEndDate: employmentEndDate,
        
        // Salary Period (when current salary started)
        salaryStartDate: salaryStartDate,
        salaryEndDate: salaryEndDate,
        
        // Compensation
        grossMonthly: monthWage,
        hourlyRate: hourWage,
        yearlyWage: yearlyWage,
        hoursPerWeek: hoursPerWeek,
        
        // Contract Details
        contractType: contract.employee_type || (contractEndDate ? 'fixed-term' : 'permanent'),
        maxHours: contract.max_hours || 0,
        minHours: contract.min_hours || 0,
        daysPerWeek: contract.days_per_week || 0,
        
        // Tax Information
        taxReductionApplied: taxDetails.is_reduction_applied || false,
        taxStartDate: taxDetails.start_date,
        taxEndDate: taxDetails.end_date,
        
        // Position Details
        position: employee.position || employee.role || employee.job_title,
        location: employee.location,
        department: employee.department || employee.afdeling,
        
        // Employee Status
        employmentStatus: employee.status || 'active',
        employeeType: contract.employee_type,
        
        // Identifiers
        employeesId: employesId,
        employeeNumber: employee.employee_number,
        
        // Metadata
        syncedAt: new Date().toISOString(),
        dataSource: 'employes_sync'
      }
    };

    if (!contractId) {
      // Create new contract record
      const { data: newContract, error: contractError } = await supabase
        .from('contracts')
        .insert(contractData)
        .select('id')
        .single();

      if (contractError) {
        console.error('❌ Failed to create contract:', contractError);
        errors.push(`Failed to create contract: ${contractError.message}`);
      } else {
        contractId = newContract.id;
        contractCreated = true;
        console.log('✅ Created contract record with full employment timeline');
      }
    } else {
      // Update existing contract with latest data
      const { error: updateError } = await supabase
        .from('contracts')
        .update(contractData)
        .eq('id', contractId);

      if (updateError) {
        console.error('❌ Failed to update contract:', updateError);
        errors.push(`Failed to update contract: ${updateError.message}`);
      } else {
        console.log('✅ Updated contract record with full employment timeline');
      }
    }

    // 7. Update contract financials if contract exists
    let contractFinancial = null;
    if (contractId) {
      // Encrypt the data
      const encryptedHours = await encryptData(hoursPerWeek.toString());
      const encryptedGross = await encryptData(monthWage.toString());
      const effectiveSalaryDate = salaryStartDate || contractStartDate || new Date().toISOString().split('T')[0];

      const { error: financialError } = await supabase
        .from('contract_financials')
        .upsert({
          contract_id: contractId,
          hours_per_week_encrypted: encryptedHours,
          gross_monthly_encrypted: encryptedGross,
          cao_effective_date: effectiveSalaryDate,
          data_source: 'employes_sync',
          last_verified_at: new Date().toISOString()
        }, {
          onConflict: 'contract_id'
        });

      if (financialError) {
        console.error('❌ Failed to update contract financials:', financialError);
        errors.push(`Failed to update financials: ${financialError.message}`);
      } else {
        console.log('✅ Updated contract financials');
        contractFinancial = { updated: true };
      }
    }

    // Return comprehensive result
    return {
      data: {
        success: errors.length === 0,
        employee_found: {
          first_name: employee.first_name,
          surname: employee.surname,
          email: employee.email,
          employment: {
            salary: {
              month_wage: monthWage,
              hour_wage: hourWage
            },
            contract: {
              hours_per_week: hoursPerWeek
            }
          }
        },
        mapping_created: mappingCreated,
        history_record: historyRecord,
        contract_created: contractCreated,
        contract_financial: contractFinancial,
        errors: errors.length > 0 ? errors : undefined
      }
    };

  } catch (error: any) {
    console.error('❌ Individual wage sync failed:', error);
    return {
      data: {
        success: false,
        errors: [error.message]
      }
    };
  }
}

// Helper function to encrypt sensitive data using Supabase encryption
async function encryptData(data: string): Promise<string> {
  try {
    const { data: encrypted, error } = await supabase
      .rpc('encrypt_sensitive', { plaintext: data });
    
    if (error) {
      console.error('Encryption error:', error);
      // Fallback to base64 if encryption fails
      return btoa(data);
    }
    
    return encrypted || btoa(data);
  } catch (error) {
    console.error('Encryption error:', error);
    return btoa(data);
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
    
    await logSync('connection_test', 'success', 'All incremental connection tests passed');

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
    
    await logSync('connection_test', 'error', `Connection test failed: ${error.message}`, undefined, undefined, error.message);
    
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

// Enhanced endpoint discovery with contract history focus
async function discoverEndpoints(): Promise<EmployesResponse<any>> {
  try {
    const companyId = "b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6";
    console.log('🔍 Discovering Employes.nl API endpoints for contract history...');
    
    if (!companyId) {
      return { error: 'Company ID not available for endpoint discovery' };
    }

    if (!EMPLOYES_API_KEY) {
      return { error: 'API key not configured' };
    }

    // Test both general and contract-specific endpoints
    const endpointsToTest = [
      // Basic endpoints we know work
      'employees',
      'payruns',
      'companies',
      'departments',
      'locations',
      
      // Contract history specific endpoints (these are our targets!)
      'contracts',
      'employment-history', 
      'employment',
      'employments',
      'wijzigingen', // Dutch for "changes"
      'salary-history',
      'contract-modifications',
      'looncomponenten', // Dutch for wage components
      'contracten', // Dutch for contracts
      'arbeidscontracten', // Dutch for employment contracts
      'salariswijzigingen', // Dutch for salary changes
      'arbeidsvoorwaarden', // Dutch for employment conditions
      'mutaties', // Dutch for mutations/changes
      'historie', // Dutch for history
      
      // Payroll related endpoints
      'wage-components',
      'salary-components',
      'payroll-history',
      'loonlijsten', // Dutch for payslips
      
      // HR related endpoints
      'personnel-files',
      'personeelsdossiers', // Dutch for personnel files
      'hr-changes',
      
      // Time tracking related (might contain contract hours)
      'timetracking',
      'tijdregistratie', // Dutch for time registration
      'werkuren', // Dutch for working hours
      
      // Additional endpoints
      'planning',
      'rosters',
      'shifts',
      'diensten' // Dutch for shifts
    ];

    const discoveredEndpoints = [];
    console.log(`🔍 Testing ${endpointsToTest.length} potential endpoints...`);

    for (const endpoint of endpointsToTest) {
      try {
        const url = `${EMPLOYES_BASE_URL}/${companyId}/${endpoint}`;
        console.log(`📡 Testing: ${endpoint}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        let responseData = null;
        let dataStructure = null;
        
        if (response.status === 200) {
          try {
            responseData = await response.json();
            // Analyze data structure
            if (responseData && typeof responseData === 'object') {
              if (Array.isArray(responseData)) {
                dataStructure = `Array with ${responseData.length} items`;
                if (responseData.length > 0) {
                  dataStructure += ` - Sample keys: ${Object.keys(responseData[0] || {}).slice(0, 5).join(', ')}`;
                }
              } else if (responseData.data && Array.isArray(responseData.data)) {
                dataStructure = `Object with data array (${responseData.data.length} items)`;
                if (responseData.data.length > 0) {
                  dataStructure += ` - Sample keys: ${Object.keys(responseData.data[0] || {}).slice(0, 5).join(', ')}`;
                }
              } else {
                dataStructure = `Object with keys: ${Object.keys(responseData).slice(0, 8).join(', ')}`;
              }
            }
          } catch (e) {
            responseData = await response.text();
            dataStructure = 'Text response';
          }
        }

        const errorText = response.status !== 200 ? await response.text() : null;

        discoveredEndpoints.push({
          endpoint,
          url,
          status: response.status,
          available: response.status === 200,
          dataStructure,
          sampleData: response.status === 200 && responseData ? 
            (typeof responseData === 'object' ? JSON.stringify(responseData, null, 2).slice(0, 500) + '...' : responseData.slice(0, 200)) : null,
          error: errorText
        });

        // Extra logging for successful contract-related endpoints
        if (response.status === 200 && 
            (endpoint.includes('contract') || endpoint.includes('employment') || endpoint.includes('salary') || 
             endpoint.includes('wijzig') || endpoint.includes('arbeids') || endpoint.includes('historie'))) {
          console.log(`✅ FOUND CONTRACT ENDPOINT: ${endpoint} - ${dataStructure}`);
        }

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        discoveredEndpoints.push({
          endpoint,
          url: `${EMPLOYES_BASE_URL}/${companyId}/${endpoint}`,
          status: 'error',
          available: false,
          error: error.message
        });
      }
    }

    const availableEndpoints = discoveredEndpoints.filter(e => e.available);
    const contractEndpoints = availableEndpoints.filter(e => 
      e.endpoint.includes('contract') || 
      e.endpoint.includes('employment') || 
      e.endpoint.includes('salary') || 
      e.endpoint.includes('wijzig') ||
      e.endpoint.includes('loon') ||
      e.endpoint.includes('arbeids') ||
      e.endpoint.includes('historie') ||
      e.endpoint.includes('mutaties')
    );

    console.log(`🎯 DISCOVERY COMPLETE:`);
    console.log(`📊 Total available: ${availableEndpoints.length}/${endpointsToTest.length}`);
    console.log(`🏛️ Contract-related: ${contractEndpoints.length}`);
    
    contractEndpoints.forEach(ep => {
      console.log(`  ✅ ${ep.endpoint}: ${ep.dataStructure}`);
    });

    await logSync('discover_endpoints', 'success', `Discovered ${availableEndpoints.length} available endpoints, ${contractEndpoints.length} contract-related`);

    return {
      data: {
        base_url: EMPLOYES_BASE_URL,
        company_id: companyId,
        allEndpoints: discoveredEndpoints,
        availableEndpoints,
        contractEndpoints,
        summary: {
          total: endpointsToTest.length,
          available: availableEndpoints.length,
          contractRelated: contractEndpoints.length
        },
        recommendations: contractEndpoints.length > 0 ? 
          'Contract history endpoints found! Ready to implement historical data sync.' :
          'No contract history endpoints found. Will use employment data from employees endpoint.'
      }
    };

  } catch (error: any) {
    console.error('❌ Error discovering endpoints:', error);
    await logSync('discover_endpoints', 'error', `Failed to discover endpoints: ${error.message}`);
    return { error: error.message };
  }
}

// Sync contracts from Employes.nl employment data with Phase 2: Historical Timeline
async function syncContractsFromEmployes(): Promise<EmployesResponse<any>> {
  try {
    console.log('🚀 Starting Phase 2 contract sync from Employes.nl...');
    console.log('   ✓ Historical timeline detection enabled');
    console.log('   ✓ Smart change detection enabled');
    console.log('   ✓ Comprehensive data extraction enabled');
    
    // Phase 2.1: Clean up incomplete contracts first (one-time cleanup)
    console.log('\n🧹 Cleaning up incomplete contracts...');
    const { data: incompleteContracts } = await supabase
      .from('contracts')
      .select('id, employee_name, query_params, created_at')
      .order('created_at', { ascending: true });
    
    let cleanedUp = 0;
    if (incompleteContracts) {
      // Group by employee
      const byEmployee = new Map<string, any[]>();
      incompleteContracts.forEach(c => {
        const contracts = byEmployee.get(c.employee_name) || [];
        contracts.push(c);
        byEmployee.set(c.employee_name, contracts);
      });
      
      // For each employee, keep only the most recent if duplicates have minimal data
      for (const [name, contracts] of byEmployee.entries()) {
        if (contracts.length > 1) {
          // Check if contracts are incomplete (missing key fields)
          const incomplete = contracts.filter(c => 
            !c.query_params?.startDate || 
            !c.query_params?.grossMonthly
          );
          
          if (incomplete.length > 0) {
            // Delete all but the most recent incomplete one
            const toDelete = incomplete.slice(0, -1).map(c => c.id);
            if (toDelete.length > 0) {
              await supabase
                .from('contracts')
                .delete()
                .in('id', toDelete);
              cleanedUp += toDelete.length;
              console.log(`   Cleaned up ${toDelete.length} incomplete contracts for ${name}`);
            }
          }
        }
      }
    }
    console.log(`✅ Cleanup complete: ${cleanedUp} contracts removed\n`);
    
    // Phase 2.2: Fetch and sync with historical detection
    const employeesResult = await fetchEmployesEmployees();
    if (employeesResult.error) {
      return { error: `Failed to fetch employees: ${employeesResult.error}` };
    }

    const employees = employeesResult.data?.data || [];
    console.log(`📊 Processing ${employees.length} employees for historical timeline sync\n`);

    let contractsCreated = 0;
    let contractsUpdated = 0;
    let contractsSkipped = 0;
    let historicalRecordsCreated = 0;
    let errors: string[] = [];

    for (const employee of employees) {
      try {
        // Skip if no employment data
        if (!employee.employment) {
          contractsSkipped++;
          continue;
        }

        const employment = employee.employment;
        const contract = employment.contract || {};
        const salary = employment.salary || {};
        const taxDetails = employment.tax_details || {};
        
        // Find matching staff member by name
        const employeeName = `${employee.first_name} ${employee.surname || ''}`.trim();
        const { data: staffMatches } = await supabase
          .from('staff')
          .select('id')
          .eq('full_name', employeeName)
          .single();
        
        const staffId = staffMatches?.id || null;
        
        // Extract ALL date fields
        const employmentStartDate = employment.start_date;
        const employmentEndDate = employment.end_date;
        const contractStartDate = contract.start_date || employment.start_date;
        const contractEndDate = contract.end_date || employment.end_date;
        const salaryStartDate = salary.start_date;
        const salaryEndDate = salary.end_date;
        
        const contractData = {
          employee_name: employeeName,
          staff_id: staffId,
          status: employee.status === 'active' ? 'signed' : 'draft',
          contract_type: contractEndDate ? 'fixed-term' : 'permanent',
          department: employee.department || employee.afdeling || null,
          manager: null,
          query_params: {
            // Contract Period (most specific - what we show as primary)
            startDate: contractStartDate,
            endDate: contractEndDate,
            
            // Employment Period (broader timeline)
            employmentStartDate: employmentStartDate,
            employmentEndDate: employmentEndDate,
            
            // Salary Period (when this salary was effective)
            salaryStartDate: salaryStartDate,
            salaryEndDate: salaryEndDate,
            
            // Compensation (from nested salary object)
            grossMonthly: salary.month_wage,
            hourlyRate: salary.hour_wage,
            yearlyWage: salary.yearly_wage,
            hoursPerWeek: contract.hours_per_week,
            
            // Contract Details (from nested contract object)
            contractType: contract.employee_type || (contractEndDate ? 'fixed-term' : 'permanent'),
            maxHours: contract.max_hours || 0,
            minHours: contract.min_hours || 0,
            daysPerWeek: contract.days_per_week || 0,
            
            // Tax Details
            taxReductionApplied: taxDetails.is_reduction_applied || false,
            taxStartDate: taxDetails.start_date,
            taxEndDate: taxDetails.end_date,
            
            // Position Information
            position: employee.position || employee.role || employee.job_title,
            location: employee.location,
            department: employee.department || employee.afdeling,
            
            // Employee Status
            employmentStatus: employee.status,
            employeeType: contract.employee_type,
            
            // Identifiers
            employeesId: employee.id,
            employeeNumber: employee.employee_number,
            locationId: employee.location_id,
            departmentId: employee.department_id,
            
            // Metadata
            syncedAt: new Date().toISOString(),
            dataSource: 'employes_sync'
          }
        };

        // Phase 2: Historical Contract Detection
        // Get all existing contracts for this employee, ordered by creation
        const { data: existingContracts } = await supabase
          .from('contracts')
          .select('id, status, contract_type, created_at, query_params')
          .eq('employee_name', contractData.employee_name)
          .order('created_at', { ascending: false });

        // Helper function to compare contract data for changes
        const hasContractChanged = (existing: any, incoming: any) => {
          if (!existing?.query_params) return true;
          
          const e = existing.query_params;
          const i = incoming.query_params;
          
          // Check if key employment details have changed
          return (
            e.startDate !== i.startDate ||
            e.endDate !== i.endDate ||
            e.grossMonthly !== i.grossMonthly ||
            e.hoursPerWeek !== i.hoursPerWeek ||
            e.contractType !== i.contractType ||
            e.salaryStartDate !== i.salaryStartDate ||
            e.employmentStatus !== i.employmentStatus
          );
        };

        // Find the most recent contract
        const mostRecentContract = existingContracts?.[0];
        
        // Determine if we should create a new contract record
        let shouldCreateNew = false;
        let existingContract = null;

        if (!existingContracts || existingContracts.length === 0) {
          // No contracts exist - create first one
          shouldCreateNew = true;
          console.log(`📝 Creating first contract for ${contractData.employee_name}`);
        } else {
          // Check if this is a different contract period or if data has changed significantly
          const exactMatch = existingContracts.find(c => 
            c.query_params?.startDate === contractStartDate &&
            c.query_params?.endDate === contractEndDate &&
            c.query_params?.grossMonthly === contractData.query_params.grossMonthly &&
            c.query_params?.hoursPerWeek === contractData.query_params.hoursPerWeek
          );

          if (exactMatch) {
            // Found exact match - update it with latest data
            existingContract = exactMatch;
            console.log(`🔄 Updating existing contract for ${contractData.employee_name}`);
          } else if (hasContractChanged(mostRecentContract, contractData)) {
            // Contract has changed - create new historical record
            shouldCreateNew = true;
            console.log(`📜 Contract changed for ${contractData.employee_name} - creating historical record`);
            console.log(`   Previous: ${mostRecentContract.query_params?.startDate} to ${mostRecentContract.query_params?.endDate}`);
            console.log(`   New: ${contractStartDate} to ${contractEndDate}`);
          } else {
            // Same contract, just update
            existingContract = mostRecentContract;
            console.log(`✅ No significant changes for ${contractData.employee_name}`);
          }
        }

        if (shouldCreateNew) {
          // Create new historical contract record
          const { error: insertError } = await supabase
            .from('contracts')
            .insert(contractData);

          if (insertError) {
            errors.push(`Failed to create contract for ${contractData.employee_name}: ${insertError.message}`);
          } else {
            contractsCreated++;
            const isHistorical = existingContracts && existingContracts.length > 0;
            if (isHistorical) historicalRecordsCreated++;
            
            console.log(`✅ ${isHistorical ? '📜 Historical' : '📝 First'} contract created for ${contractData.employee_name}`);
            
            // Log to employment history
            if (staffId) {
              await supabase
                .from('staff_employment_history')
                .insert({
                  staff_id: staffId,
                  employes_employee_id: contractData.query_params.employeesId,
                  change_type: isHistorical ? 'contract_change' : 'hire',
                  new_data: contractData.query_params,
                  previous_data: mostRecentContract?.query_params || null,
                  effective_date: contractStartDate || new Date().toISOString().split('T')[0]
                });
            }
          }
        } else if (existingContract) {
          // Update existing contract with latest comprehensive data
          const { error: updateError } = await supabase
            .from('contracts')
            .update(contractData)
            .eq('id', existingContract.id);

          if (updateError) {
            errors.push(`Failed to update contract for ${contractData.employee_name}: ${updateError.message}`);
          } else {
            contractsUpdated++;
            console.log(`✅ Updated contract for ${contractData.employee_name} with complete data`);
          }
        }

        await logSync('sync_contracts', 'success', `Contract synced for ${contractData.employee_name}`, employee.id);

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (employeeError: any) {
        console.error(`Error processing employee ${employee.first_name} ${employee.surname}:`, employeeError);
        errors.push(`Employee ${employee.first_name} ${employee.surname}: ${employeeError.message}`);
        
        await logSync('sync_contracts', 'error', `Failed to sync contract: ${employeeError.message}`, employee.id, undefined, employeeError.message);
      }
    }

    const summary = {
      total_processed: employees.length,
      contracts_created: contractsCreated,
      contracts_updated: contractsUpdated,
      contracts_skipped: contractsSkipped,
      historical_records_created: historicalRecordsCreated,
      cleanup_removed: cleanedUp,
      errors: errors.length,
      error_details: errors.slice(0, 10)
    };

    console.log('\n📊 Phase 2 Contract sync completed:');
    console.log(`   ✅ ${contractsCreated} contracts created (${historicalRecordsCreated} historical)`);
    console.log(`   🔄 ${contractsUpdated} contracts updated`);
    console.log(`   ⏭️  ${contractsSkipped} skipped`);
    console.log(`   🧹 ${cleanedUp} duplicates cleaned`);
    if (errors.length > 0) {
      console.log(`   ❌ ${errors.length} errors`);
    }
    
    return { 
      data: {
        success: true,
        message: `Phase 2 sync completed: ${contractsCreated} created (${historicalRecordsCreated} historical), ${contractsUpdated} updated, ${cleanedUp} cleaned`,
        summary
      }
    };

  } catch (error: any) {
    console.error('Contract sync failed:', error);
    return { error: `Contract sync failed: ${error.message}` };
  }
}

// Test individual employee endpoints
async function testIndividualEmployees(): Promise<EmployesResponse<any>> {
  try {
    console.log('🧪 Testing individual employee endpoints...');
    
    const baseUrl = `https://connect.employes.nl/v4`;
    const companyId = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
    
    // First get employees list to get IDs
    const employeesResponse = await fetch(`${baseUrl}/${companyId}/employees?per_page=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!employeesResponse.ok) {
      throw new Error('Failed to fetch employees for testing');
    }

    const employeesData = await employeesResponse.json();
    const testEmployees = employeesData.data?.slice(0, 3) || [];
    
    const individualTests = [];
    
    for (const employee of testEmployees) {
      const employeeId = employee.id;
      const testEndpoints = [
        `employees/${employeeId}`,
        `employees/${employeeId}/employments`,
        `employees/${employeeId}/employment-history`,
        `employees/${employeeId}/contracts`,
        `employees/${employeeId}/salary-history`,
        `employees/${employeeId}/wijzigingen`
      ];

      for (const endpoint of testEndpoints) {
        try {
          const url = `${baseUrl}/${companyId}/${endpoint}`;
          console.log(`Testing individual endpoint: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          const responseText = await response.text();
          let data = null;
          let dataStructure = null;

          if (response.ok) {
            try {
              data = JSON.parse(responseText);
              
              if (data && typeof data === 'object') {
                if (Array.isArray(data.data)) {
                  dataStructure = `Array with ${data.data.length} items`;
                  if (data.data.length > 0) {
                    const sampleKeys = Object.keys(data.data[0]).slice(0, 8).join(', ');
                    dataStructure += ` - Keys: ${sampleKeys}`;
                  }
                } else if (Array.isArray(data)) {
                  dataStructure = `Direct array with ${data.length} items`;
                  if (data.length > 0) {
                    const sampleKeys = Object.keys(data[0]).slice(0, 8).join(', ');
                    dataStructure += ` - Keys: ${sampleKeys}`;
                  }
                } else {
                  const keys = Object.keys(data);
                  dataStructure = `Object with ${keys.length} keys: ${keys.slice(0, 8).join(', ')}`;
                }
              }
            } catch (parseError) {
              console.error(`Failed to parse response for ${endpoint}:`, parseError);
            }
          }

          individualTests.push({
            employeeId,
            employeeName: `${employee.first_name} ${employee.surname || ''}`.trim(),
            endpoint,
            url,
            status: response.status,
            available: response.ok,
            dataStructure,
            sampleData: response.ok ? JSON.stringify(data).substring(0, 1000) + '...' : null,
            error: response.ok ? null : responseText
          });

        } catch (error: any) {
          console.error(`Error testing individual endpoint ${endpoint}:`, error);
          individualTests.push({
            employeeId,
            employeeName: `${employee.first_name} ${employee.surname || ''}`.trim(),
            endpoint,
            url: `${baseUrl}/${companyId}/${endpoint}`,
            status: 0,
            available: false,
            dataStructure: null,
            sampleData: null,
            error: error.message
          });
        }
      }
    }

    const summary = {
      totalTests: individualTests.length,
      successfulTests: individualTests.filter(t => t.available).length,
      employeesTested: testEmployees.length,
      availableEmploymentEndpoints: individualTests.filter(t => t.available && t.endpoint.includes('employment')).length
    };

    console.log(`🎯 Individual Tests Summary: ${summary.successfulTests}/${summary.totalTests} successful`);

    return {
      data: {
        base_url: baseUrl,
        company_id: companyId,
        testEmployees: testEmployees.map((e: any) => ({
          id: e.id,
          name: `${e.first_name} ${e.surname || ''}`.trim(),
          status: e.status
        })),
        individualTests,
        summary,
        insights: summary.availableEmploymentEndpoints > 0 
          ? `🎉 Found ${summary.availableEmploymentEndpoints} working employment endpoints!`
          : "No individual employment endpoints accessible. Will analyze existing employment data in employees endpoint."
      }
    };
  } catch (error: any) {
    console.error('Individual employee testing error:', error);
    return { error: error.message };
  }
}

/**
 * COMPREHENSIVE DATA EXTRACTION FOR A SPECIFIC EMPLOYEE
 * This function extracts EVERYTHING possible from Employes.nl for one employee
 * and generates a complete data report
 */
async function extractCompleteEmployeeProfile(email?: string, staffId?: string): Promise<EmployesResponse<any>> {
  console.log('🔍 STARTING COMPREHENSIVE DATA EXTRACTION');
  console.log(`Parameters: email=${email}, staffId=${staffId}`);
  
  const report = {
    timestamp: new Date().toISOString(),
    employee: {
      lms_staff_id: staffId,
      search_email: email,
      found: false,
      employes_id: null,
      basic_info: {},
      personal_details: {},
      address: {},
      contact: {},
      employment_status: {},
    },
    endpoints_tested: [],
    employment_history: {
      total_periods: 0,
      periods: [],
      raw_employment_objects: []
    },
    salary_progression: {
      total_records: 0,
      records: [],
      source: 'employment_nested_data'
    },
    contract_timeline: {
      total_contracts: 0,
      contracts: [],
      source: 'employment_nested_data'
    },
    working_schedule: {},
    payroll_data: {},
    tax_information: {},
    raw_api_responses: {},
    data_availability_matrix: {},
    extraction_summary: {
      success: false,
      errors: [],
      warnings: [],
      data_points_extracted: 0
    }
  };

  try {
    const companyId = "b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6";
    
    // PHASE 1: Find the employee in Employes.nl
    console.log('\n=== PHASE 1: FINDING EMPLOYEE ===');
    const employeesUrl = `${EMPLOYES_BASE_URL}/${companyId}/employees`;
    report.endpoints_tested.push({ endpoint: employeesUrl, method: 'GET', purpose: 'Find employee' });
    
    const employeesResult = await employesRequest<any>(employeesUrl);
    if (employeesResult.error) {
      report.extraction_summary.errors.push(`Failed to fetch employees: ${employeesResult.error}`);
      return { data: report };
    }
    
    report.raw_api_responses.employees_list = employeesResult.data;
    
    const employees = validateEmploymentData(employeesResult.data, 'Complete Profile Extraction');
    console.log(`Found ${employees.length} total employees`);
    
    // Find the target employee
    let targetEmployee = null;
    
    if (email) {
      targetEmployee = employees.find((emp: any) => 
        emp.email?.toLowerCase() === email.toLowerCase()
      );
      console.log(`Search by email: ${email} - ${targetEmployee ? 'FOUND' : 'NOT FOUND'}`);
    }
    
    if (!targetEmployee && staffId) {
      // Get staff record to get employes_id or name
      const { data: staffRecord } = await supabase
        .from('staff')
        .select('*')
        .eq('id', staffId)
        .single();
      
      if (staffRecord) {
        report.employee.lms_staff_id = staffId;
        if (staffRecord.employes_id) {
          targetEmployee = employees.find((emp: any) => emp.id === staffRecord.employes_id);
          console.log(`Search by employes_id: ${staffRecord.employes_id} - ${targetEmployee ? 'FOUND' : 'NOT FOUND'}`);
        }
        
        if (!targetEmployee && staffRecord.full_name) {
          const nameParts = staffRecord.full_name.toLowerCase().split(' ');
          targetEmployee = employees.find((emp: any) => {
            const empFullName = `${emp.first_name || ''} ${emp.surname || ''}`.toLowerCase().trim();
            return nameParts.every((part: string) => empFullName.includes(part));
          });
          console.log(`Search by name: ${staffRecord.full_name} - ${targetEmployee ? 'FOUND' : 'NOT FOUND'}`);
        }
      }
    }
    
    if (!targetEmployee) {
      report.extraction_summary.errors.push('Employee not found in Employes.nl');
      return { data: report };
    }
    
    report.employee.found = true;
    report.employee.employes_id = targetEmployee.id;
    console.log(`✅ FOUND EMPLOYEE: ${targetEmployee.first_name} ${targetEmployee.surname} (ID: ${targetEmployee.id})`);
    
    // PHASE 2: Extract ALL basic employee data
    console.log('\n=== PHASE 2: EXTRACTING BASIC DATA ===');
    report.employee.basic_info = {
      id: targetEmployee.id,
      first_name: targetEmployee.first_name,
      surname: targetEmployee.surname,
      surname_prefix: targetEmployee.surname_prefix,
      initials: targetEmployee.initials,
      full_name: `${targetEmployee.first_name || ''} ${targetEmployee.surname_prefix || ''} ${targetEmployee.surname || ''}`.trim(),
      employee_number: targetEmployee.employee_number,
      status: targetEmployee.status
    };
    
    report.employee.personal_details = {
      date_of_birth: targetEmployee.date_of_birth,
      nationality_id: targetEmployee.nationality_id,
      gender: targetEmployee.gender,
      personal_identification_number: targetEmployee.personal_identification_number
    };
    
    report.employee.address = {
      street: targetEmployee.street,
      housenumber: targetEmployee.housenumber,
      zipcode: targetEmployee.zipcode,
      city: targetEmployee.city,
      country_code: targetEmployee.country_code
    };
    
    report.employee.contact = {
      email: targetEmployee.email,
      phone: targetEmployee.phone,
      mobile: targetEmployee.mobile
    };
    
    report.employee.employment_status = {
      status: targetEmployee.status,
      department: targetEmployee.department,
      department_id: targetEmployee.department_id,
      location: targetEmployee.location,
      location_id: targetEmployee.location_id,
      afdeling: targetEmployee.afdeling,
      position: targetEmployee.position,
      role: targetEmployee.role,
      job_title: targetEmployee.job_title
    };
    
    // PHASE 3: Extract NESTED EMPLOYMENT DATA (This is where the magic happens!)
    console.log('\n=== PHASE 3: EXTRACTING NESTED EMPLOYMENT DATA ===');
    
    // The employment data is nested in the employee object
    const employments = targetEmployee.employments || targetEmployee.employment || [];
    const employmentsArray = Array.isArray(employments) ? employments : [employments];
    
    console.log(`Found ${employmentsArray.length} employment periods in nested data`);
    report.employment_history.total_periods = employmentsArray.length;
    report.employment_history.raw_employment_objects = employmentsArray;
    
    // Extract COMPLETE employment timeline
    for (const employment of employmentsArray) {
      if (!employment) continue;
      
      const period = {
        employment_id: employment.id,
        start_date: employment.start_date,
        end_date: employment.end_date,
        contract: {},
        salary: {},
        hours: {},
        tax: {},
        raw_data: employment
      };
      
      // Extract contract data from this employment period
      if (employment.contract) {
        period.contract = {
          contract_type: employment.contract.type,
          contract_code: employment.contract.code,
          start_date: employment.contract.start_date,
          end_date: employment.contract.end_date,
          hours_per_week: employment.contract.hours_per_week,
          fte: employment.contract.fte,
          indefinite: employment.contract.indefinite
        };
        
        report.contract_timeline.contracts.push({
          period: `${employment.contract.start_date || 'N/A'} to ${employment.contract.end_date || 'current'}`,
          type: employment.contract.type,
          hours_per_week: employment.contract.hours_per_week,
          fte: employment.contract.fte,
          ...period.contract
        });
      }
      
      // Extract SALARY DATA from this employment period
      // This is the KEY to getting historical salary data!
      if (employment.salary) {
        const salaryData = employment.salary;
        
        // Handle array of salary records OR single salary object
        const salaryRecords = Array.isArray(salaryData) ? salaryData : [salaryData];
        
        for (const sal of salaryRecords) {
          if (!sal) continue;
          
          const salaryRecord = {
            start_date: sal.start_date || employment.start_date,
            end_date: sal.end_date || employment.end_date,
            month_wage: sal.month_wage || sal.monthly_wage || sal.gross_monthly,
            hour_wage: sal.hour_wage || sal.hourly_wage,
            yearly_wage: sal.yearly_wage || sal.year_wage,
            hours_per_week: sal.hours_per_week || employment.contract?.hours_per_week,
            scale: sal.scale,
            trede: sal.trede || sal.step,
            cao_effective_date: sal.cao_effective_date || sal.start_date,
            source: 'employment_nested_data'
          };
          
          report.salary_progression.records.push(salaryRecord);
        }
        
        period.salary = salaryRecords[0] || {};
      }
      
      // Extract working hours data
      if (employment.hours || employment.working_hours) {
        period.hours = {
          hours_per_week: employment.hours?.per_week || employment.working_hours,
          fte: employment.hours?.fte,
          schedule: employment.hours?.schedule
        };
      }
      
      // Extract tax and legal data
      if (employment.tax || employment.tax_details) {
        period.tax = {
          loonheffingskorting: employment.tax?.loonheffingskorting,
          bijtelling_auto: employment.tax?.bijtelling_auto,
          tax_table: employment.tax?.tax_table,
          tax_credit: employment.tax?.tax_credit
        };
      }
      
      report.employment_history.periods.push(period);
    }
    
    report.salary_progression.total_records = report.salary_progression.records.length;
    report.contract_timeline.total_contracts = report.contract_timeline.contracts.length;
    
    console.log(`✅ Extracted ${report.salary_progression.total_records} salary records`);
    console.log(`✅ Extracted ${report.contract_timeline.total_contracts} contracts`);
    
    // PHASE 4: Try individual employee endpoints
    console.log('\n=== PHASE 4: TESTING INDIVIDUAL EMPLOYEE ENDPOINTS ===');
    const individualEndpoints = [
      `/employees/${targetEmployee.id}`,
      `/employees/${targetEmployee.id}/employments`,
      `/employees/${targetEmployee.id}/contracts`,
      `/employees/${targetEmployee.id}/salary-history`,
      `/employees/${targetEmployee.id}/payslips`,
      `/employees/${targetEmployee.id}/hours`,
      `/employees/${targetEmployee.id}/absences`
    ];
    
    for (const endpoint of individualEndpoints) {
      const fullUrl = `${EMPLOYES_BASE_URL}/${companyId}${endpoint}`;
      console.log(`Testing: ${fullUrl}`);
      
      const testResult = await employesRequest<any>(fullUrl);
      const endpointReport = {
        endpoint: fullUrl,
        method: 'GET',
        status: testResult.status || 'unknown',
        success: !testResult.error,
        has_data: !!testResult.data,
        error: testResult.error || null,
        data_preview: testResult.data ? JSON.stringify(testResult.data).substring(0, 200) : null
      };
      
      report.endpoints_tested.push(endpointReport);
      
      if (testResult.data) {
        report.raw_api_responses[endpoint] = testResult.data;
        console.log(`  ✅ SUCCESS - Data available`);
      } else {
        console.log(`  ❌ ${testResult.error || 'No data'}`);
      }
    }
    
    // PHASE 5: Try payrun endpoints
    console.log('\n=== PHASE 5: TESTING PAYRUN ENDPOINTS ===');
    const payrunsUrl = `${EMPLOYES_BASE_URL}/${companyId}/payruns`;
    console.log(`Testing: ${payrunsUrl}`);
    
    const payrunsResult = await employesRequest<any>(payrunsUrl);
    report.endpoints_tested.push({
      endpoint: payrunsUrl,
      method: 'GET',
      status: payrunsResult.status || 'unknown',
      success: !payrunsResult.error,
      has_data: !!payrunsResult.data
    });
    
    if (payrunsResult.data) {
      report.raw_api_responses.payruns = payrunsResult.data;
      report.payroll_data = {
        available: true,
        payruns_found: Array.isArray(payrunsResult.data) ? payrunsResult.data.length : 0,
        note: 'Payrun data available - contains detailed wage components and employer costs'
      };
    }
    
    // PHASE 6: Build data availability matrix
    console.log('\n=== PHASE 6: BUILDING DATA AVAILABILITY MATRIX ===');
    report.data_availability_matrix = {
      personal_information: {
        full_name: !!report.employee.basic_info.first_name,
        email: !!report.employee.contact.email,
        phone: !!report.employee.contact.phone || !!report.employee.contact.mobile,
        date_of_birth: !!report.employee.personal_details.date_of_birth,
        nationality: !!report.employee.personal_details.nationality_id,
        address: !!(report.employee.address.street && report.employee.address.city),
        employee_number: !!report.employee.basic_info.employee_number
      },
      employment_data: {
        status: !!report.employee.employment_status.status,
        department: !!report.employee.employment_status.department,
        location: !!report.employee.employment_status.location,
        position: !!report.employee.employment_status.position,
        employment_history: report.employment_history.total_periods > 0,
        employment_periods_count: report.employment_history.total_periods
      },
      salary_data: {
        salary_progression: report.salary_progression.total_records > 0,
        salary_records_count: report.salary_progression.total_records,
        current_salary: report.salary_progression.records.length > 0,
        historical_salary: report.salary_progression.records.length > 1,
        cao_scale_trede: report.salary_progression.records.some((r: any) => r.scale && r.trede)
      },
      contract_data: {
        contract_timeline: report.contract_timeline.total_contracts > 0,
        contracts_count: report.contract_timeline.total_contracts,
        contract_types: [...new Set(report.contract_timeline.contracts.map((c: any) => c.type))],
        working_hours: report.contract_timeline.contracts.some((c: any) => c.hours_per_week)
      },
      payroll_data: {
        payrun_access: !!report.payroll_data.available,
        wage_components: false // Would need to parse payrun details
      }
    };
    
    // Count total data points
    const countDataPoints = (obj: any): number => {
      let count = 0;
      for (const key in obj) {
        const val = obj[key];
        if (typeof val === 'boolean' && val === true) count++;
        else if (typeof val === 'object' && val !== null) count += countDataPoints(val);
      }
      return count;
    };
    
    report.extraction_summary.data_points_extracted = countDataPoints(report.data_availability_matrix);
    report.extraction_summary.success = true;
    
    console.log(`\n✅ EXTRACTION COMPLETE: ${report.extraction_summary.data_points_extracted} data points extracted`);
    
    await logSync('extract_complete_profile', 'success', 
      `Complete profile extraction for ${report.employee.basic_info.full_name}: ${report.extraction_summary.data_points_extracted} data points`,
      targetEmployee.id, staffId);
    
    return { data: report };
    
  } catch (error: any) {
    console.error('❌ Complete profile extraction failed:', error);
    report.extraction_summary.success = false;
    report.extraction_summary.errors.push(error.message);
    
    await logSync('extract_complete_profile', 'error', `Extraction failed: ${error.message}`);
    
    return { data: report };
  }
}

// Analyze employment data structure
async function analyzeEmploymentData(): Promise<EmployesResponse<any>> {
  try {
    console.log('🔬 Analyzing employment data structure...');
    
    const baseUrl = `https://connect.employes.nl/v4`;
    const companyId = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
    
    // Get full employee data
    const employeesResponse = await fetch(`${baseUrl}/${companyId}/employees?per_page=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!employeesResponse.ok) {
      throw new Error('Failed to fetch employees for analysis');
    }

    const employeesData = await employeesResponse.json();
    const employees = employeesData.data || [];
    
    // Analyze employment data structure
    const employmentAnalysis = {
      totalEmployees: employees.length,
      employeesWithEmployment: 0,
      employmentFields: new Set<string>(),
      contractFields: new Set<string>(),
      salaryFields: new Set<string>(),
      taxFields: new Set<string>(),
      samples: [] as any[]
    };

    let sampleCount = 0;
    
    for (const employee of employees) {
      if (employee.employment) {
        employmentAnalysis.employeesWithEmployment++;
        
        // Analyze employment object structure
        Object.keys(employee.employment).forEach(key => {
          employmentAnalysis.employmentFields.add(key);
        });

        // Analyze contract sub-object
        if (employee.employment.contract) {
          Object.keys(employee.employment.contract).forEach(key => {
            employmentAnalysis.contractFields.add(key);
          });
        }

        // Analyze salary sub-object
        if (employee.employment.salary) {
          Object.keys(employee.employment.salary).forEach(key => {
            employmentAnalysis.salaryFields.add(key);
          });
        }

        // Analyze tax details sub-object
        if (employee.employment.tax_details) {
          Object.keys(employee.employment.tax_details).forEach(key => {
            employmentAnalysis.taxFields.add(key);
          });
        }

        // Collect samples
        if (sampleCount < 5) {
          employmentAnalysis.samples.push({
            employeeId: employee.id,
            employeeName: `${employee.first_name} ${employee.surname || ''}`.trim(),
            employmentData: employee.employment
          });
          sampleCount++;
        }
      }
    }

    // Convert Sets to Arrays for JSON serialization
    const analysis = {
      ...employmentAnalysis,
      employmentFields: Array.from(employmentAnalysis.employmentFields),
      contractFields: Array.from(employmentAnalysis.contractFields),
      salaryFields: Array.from(employmentAnalysis.salaryFields),
      taxFields: Array.from(employmentAnalysis.taxFields)
    };

    // Extract potential contract history indicators
    const historyIndicators = {
      hasStartDates: analysis.employmentFields.includes('start_date'),
      hasEndDates: analysis.employmentFields.includes('end_date'),
      hasSalaryProgression: analysis.salaryFields.length > 0,
      hasContractTypes: analysis.contractFields.includes('employee_type'),
      hasHourChanges: analysis.contractFields.includes('hours_per_week'),
      potentialHistoryFields: analysis.employmentFields.filter(field => 
        field.includes('date') || field.includes('history') || field.includes('change')
      )
    };

    console.log(`📊 Employment Analysis: ${analysis.employeesWithEmployment}/${analysis.totalEmployees} have employment data`);
    console.log(`🔍 Found ${analysis.employmentFields.length} employment fields, ${analysis.contractFields.length} contract fields`);

    return {
      data: {
        analysis,
        historyIndicators,
        recommendations: {
          canExtractHistory: historyIndicators.hasStartDates && historyIndicators.hasEndDates,
          hasSalaryData: historyIndicators.hasSalaryProgression,
          hasContractDetails: historyIndicators.hasContractTypes,
          nextSteps: historyIndicators.hasStartDates 
            ? "Employment data contains contract timeline information!"
            : "Limited contract history in employment data. Consider payrun integration."
        }
      }
    };
  } catch (error: any) {
    console.error('Employment data analysis error:', error);
    return { error: error.message };
  }
}

// Helper function to determine contract status based on employment dates
function determineContractStatus(startDate?: string, endDate?: string): string {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && start > now) {
    return 'upcoming';
  }
  
  if (end && end < now) {
    return 'expired';
  }
  
  if (start && start <= now && (!end || end >= now)) {
    return 'active';
  }
  
  return 'draft';
}

// ============================================================================
// PHASE 3: COMPLIANCE MONITORING
// ============================================================================

async function checkCompliance(): Promise<EmployesResponse<any>> {
  console.log('📋 Running compliance checks...');
  
  try {
    const alerts = [];
    
    // Check 1: Contract expiring in next 30 days
    const { data: expiringContracts, error: contractError } = await supabase
      .from('staff')
      .select('id, full_name, employment_end_date')
      .not('employment_end_date', 'is', null)
      .gte('employment_end_date', new Date().toISOString().split('T')[0])
      .lte('employment_end_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    if (!contractError && expiringContracts && expiringContracts.length > 0) {
      alerts.push({
        type: 'contract_expiration',
        severity: 'warning',
        count: expiringContracts.length,
        message: `${expiringContracts.length} contract(s) expiring in next 30 days`,
        details: expiringContracts
      });
    }
    
    // Check 2: Missing documents
    const { data: missingDocs } = await supabase
      .from('staff_docs_status')
      .select('*')
      .gt('missing_count', 0)
      .order('missing_count', { ascending: false });
    
    if (missingDocs && missingDocs.length > 0) {
      alerts.push({
        type: 'missing_documents',
        severity: 'warning',
        count: missingDocs.length,
        message: `${missingDocs.length} staff member(s) with missing documents`,
        details: missingDocs.slice(0, 10) // Top 10
      });
    }
    
    // Check 3: Reviews overdue
    const { data: overdueReviews } = await supabase
      .from('staff')
      .select(`
        id, 
        full_name, 
        employment_start_date,
        staff_reviews!inner(review_date)
      `)
      .is('staff_reviews.review_date', null)
      .lt('employment_start_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    if (overdueReviews && overdueReviews.length > 0) {
      alerts.push({
        type: 'overdue_reviews',
        severity: 'info',
        count: overdueReviews.length,
        message: `${overdueReviews.length} staff member(s) need 6-month review`,
        details: overdueReviews.slice(0, 10)
      });
    }
    
    console.log(`✅ Compliance check complete: ${alerts.length} alerts`);
    
    return { data: { alerts, timestamp: new Date().toISOString() } };
  } catch (error: any) {
    console.error('❌ Compliance check failed:', error);
    return { error: error.message };
  }
}

// ============================================================================
// END PHASE 3 CODE
// ============================================================================

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
        validActions: ['test_connection', 'fetch_companies', 'fetch_employees', 'compare_staff_data', 'sync_employees', 'sync_wage_data', 'sync_from_employes', 'sync_contracts', 'get_sync_statistics', 'get_sync_logs', 'discover_endpoints', 'debug_connection', 'collect_comprehensive_data']
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

      case 'sync_individual_wage':
        const staffId = params.staff_id;
        if (!staffId) {
          result = { 
            error: 'staff_id is required',
            data: { success: false, errors: ['staff_id parameter is required'] }
          };
        } else {
          result = await syncIndividualWage(staffId);
        }
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

      case 'sync_contracts':
        result = await syncContractsFromEmployes();
        break;

      case 'test_individual_employees':
        result = await testIndividualEmployees();
        break;

      case 'analyze_employment_data':
        result = await analyzeEmploymentData();
        break;

      case 'extract_complete_profile':
        const email = params.email;
        const extractStaffId = params.staff_id;
        if (!email && !extractStaffId) {
          result = { 
            error: 'email or staff_id is required',
            data: { success: false, errors: ['email or staff_id parameter is required'] }
          };
        } else {
          result = await extractCompleteEmployeeProfile(email, extractStaffId);
        }
        break;

      case 'collect_comprehensive_data':
        console.log('🚀 Starting comprehensive data collection (Phase 1)');
        result = await runComprehensiveDataCollection(false);
        break;

      case 'auto_sync_all':
        console.log('🚀 Starting AUTO SYNC ALL: Collection → Staff Sync → Compliance Check');
        result = await runComprehensiveDataCollection(true);
        
        // Add compliance monitoring after sync
        if (result.data && !result.error) {
          console.log('\n📋 Running compliance checks...');
          const complianceResult = await checkCompliance();
          if (complianceResult.data) {
            result.data.compliance_alerts = complianceResult.data;
          }
        }
        break;

      default:
        console.error(`Unknown action received: ${action}`);
        result = { 
          error: `Unknown action: ${action}`,
          data: {
            validActions: ['test_connection', 'fetch_companies', 'fetch_employees', 'compare_staff_data', 'sync_employees', 'sync_wage_data', 'sync_from_employes', 'sync_contracts', 'get_sync_statistics', 'get_sync_logs', 'discover_endpoints', 'debug_connection', 'test_individual_employees', 'analyze_employment_data', 'extract_complete_profile', 'collect_comprehensive_data']
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