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

// Enhanced sync employees to LMS
async function syncEmployeesToLMS(): Promise<EmployesResponse<any>> {
  console.log('✅ ENHANCED: Verifying staff VIEW sync with employes_raw_data...');

  try {
    console.log('📊 The staff VIEW automatically reflects data from employes_raw_data');
    console.log('🔄 No manual sync required - data is instantly available!');

    // Verify staff view has data and is working
    const { data: staffCount, error: countError } = await supabase
      .from('staff')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Failed to verify staff view:', countError);
      await logSync('verify_staff_view', 'error', `Verification failed: ${countError.message}`);
      return { error: `Staff view verification failed: ${countError.message}` };
    }

    // Get sample of staff data to verify structure
    const { data: sampleStaff, error: sampleError } = await supabase
      .from('staff')
      .select('id, employes_id, full_name, last_sync_at')
      .limit(3);

    if (sampleError) {
      console.error('❌ Failed to sample staff data:', sampleError);
      await logSync('sample_staff_view', 'error', `Sample failed: ${sampleError.message}`);
      return { error: `Staff data sampling failed: ${sampleError.message}` };
    }

    const verificationResults = {
      success: true,
      staff_count: staffCount || 0,
      sample_data: sampleStaff || [],
      message: 'Staff VIEW is automatically synced with employes_raw_data',
      architecture: '2.0 - Pure view-based, no manual sync needed'
    };

    console.log(`✅ Staff view verification complete: ${staffCount || 0} employees visible`);
    console.log('📋 Sample staff data:', sampleStaff?.map(s => `${s.full_name} (${s.employes_id})`).join(', '));
    console.log('🎯 2.0 Architecture: employes_raw_data → staff VIEW → UI (automatic)');

    await logSync('verify_staff_view', 'success', `Staff view has ${staffCount || 0} employees - no sync needed`);

    return {
      data: verificationResults
    };

  } catch (error: any) {
    console.error('❌ Error in staff view verification:', error);
    await logSync('verify_staff_view', 'error', 'Verification failed', undefined, undefined, error.message);
    return { error: `Staff view verification failed: ${error.message}` };
  }
}


// Sync wage data from LMS to Employes - REAL IMPLEMENTATION
async function syncWageDataToEmployes(): Promise<EmployesResponse<any>> {
  try {
    console.log('🏦 Starting REAL wage data synchronization from Employes.nl...');
    
    // Fetch wage components from Employes.nl API
    const endpoints = await getAPIEndpoints();
    console.log('Fetching wage components from:', `${endpoints.payruns}/wage-components`);
    
    const wageResult = await employesRequest<any>(`${endpoints.payruns}/wage-components`);
    if (wageResult.error) {
      return { error: `Failed to fetch wage components: ${wageResult.error}` };
    }
    
    const wageComponents = wageResult.data?.data || [];
    console.log(`Processing ${wageComponents.length} wage components`);
    
    let wageRecordsCreated = 0;
    let wageRecordsUpdated = 0;
    let errors: string[] = [];
    
    // Fetch employees to map wage data
    const employeesResult = await fetchEmployesEmployees();
    if (employeesResult.error) {
      return { error: `Failed to fetch employees: ${employeesResult.error}` };
    }
    
    const employees = employeesResult.data?.data || [];
    
    for (const employee of employees) {
      try {
        // Find corresponding contract in LMS
        const { data: contracts } = await supabase
          .from('contracts')
          .select('id')
          .eq('employee_name', `${employee.first_name} ${employee.surname || ''}`.trim())
          .limit(1);
        
        if (!contracts || contracts.length === 0) {
          console.log(`No contract found for ${employee.first_name} ${employee.surname}`);
          continue;
        }
        
        const contractId = contracts[0].id;
        
        // Extract wage information from employee data
        const wageData = {
          contract_id: contractId,
          // Encrypt sensitive financial data
          scale_encrypted: employee.scale ? await encryptData(employee.scale) : null,
          trede_encrypted: employee.trede ? await encryptData(employee.trede.toString()) : null,
          gross_monthly_encrypted: employee.salary ? await encryptData(employee.salary.toString()) : null,
          hours_per_week_encrypted: employee.hours_per_week ? await encryptData(employee.hours_per_week.toString()) : null,
          bruto36h_encrypted: employee.bruto36h ? await encryptData(employee.bruto36h.toString()) : null,
          reiskosten_encrypted: employee.reiskosten ? await encryptData(employee.reiskosten.toString()) : null,
          encrypted_by: 'system', // We'll need to get actual user ID later
          encrypted_at: new Date().toISOString()
        };
        
        // Check if financial record exists
        const { data: existingFinancials } = await supabase
          .from('contract_financials')
          .select('id')
          .eq('contract_id', contractId);
        
        if (existingFinancials && existingFinancials.length > 0) {
          // Update existing record
          const { error } = await supabase
            .from('contract_financials')
            .update(wageData)
            .eq('contract_id', contractId);
          
          if (error) {
            errors.push(`Failed to update financials for ${employee.first_name}: ${error.message}`);
          } else {
            wageRecordsUpdated++;
            console.log(`Updated wage data for ${employee.first_name} ${employee.surname}`);
          }
        } else {
          // Create new record
          const { error } = await supabase
            .from('contract_financials')
            .insert(wageData);
          
          if (error) {
            errors.push(`Failed to create financials for ${employee.first_name}: ${error.message}`);
          } else {
            wageRecordsCreated++;
            console.log(`Created wage data for ${employee.first_name} ${employee.surname}`);
          }
        }
        
        // Also create employee mapping for wage components
        await supabase
          .from('employes_wage_map')
          .upsert({
            lms_contract_id: contractId,
            employes_wage_component_id: employee.id,
            component_type: 'salary',
            synced_at: new Date().toISOString()
          }, { onConflict: 'lms_contract_id,employes_wage_component_id' });
        
        await logSync('sync_wage_data', 'success', `Wage data synced for ${employee.first_name}`, employee.id, contractId);
        
      } catch (employeeError: any) {
        console.error(`Error processing wage data for ${employee.first_name}:`, employeeError);
        errors.push(`Employee ${employee.first_name}: ${employeeError.message}`);
        await logSync('sync_wage_data', 'error', `Failed to sync wage data: ${employeeError.message}`, employee.id);
      }
    }
    
    console.log(`🏦 Wage sync completed: ${wageRecordsCreated} created, ${wageRecordsUpdated} updated, ${errors.length} errors`);
    
    return { 
      data: { 
        success: true,
        message: `Wage sync completed: ${wageRecordsCreated} created, ${wageRecordsUpdated} updated`,
        summary: {
          wage_records_created: wageRecordsCreated,
          wage_records_updated: wageRecordsUpdated,
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

// Helper function to encrypt sensitive data (placeholder - would use actual encryption)
async function encryptData(data: string): Promise<string> {
  // This is a placeholder - in production you'd use proper encryption
  // For now, we'll just return the data encoded (but normally it would be encrypted)
  return btoa(data);
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

// Sync contracts from Employes.nl employment data
async function syncContractsFromEmployes(): Promise<EmployesResponse<any>> {
  try {
    console.log('Starting contract sync from Employes.nl...');
    
    // Fetch current employees with employment data
    const employeesResult = await fetchEmployesEmployees();
    if (employeesResult.error) {
      return { error: `Failed to fetch employees: ${employeesResult.error}` };
    }

    const employees = employeesResult.data?.data || [];
    console.log(`Processing ${employees.length} employees for contract sync`);

    let contractsCreated = 0;
    let contractsUpdated = 0;
    let contractsSkipped = 0;
    let errors: string[] = [];

    for (const employee of employees) {
      try {
        // Skip if no employment data
        if (!employee.employment) {
          contractsSkipped++;
          continue;
        }

        const employment = employee.employment;
        const contractData = {
          employee_name: `${employee.first_name} ${employee.surname || ''}`.trim(),
          status: determineContractStatus(employee.start_date, employee.end_date),
          contract_type: employee.contract_type || employee.employment_type || 'unknown',
          department: employee.department || employee.afdeling || null,
          manager: null, // Can be populated later if manager data available
          query_params: {
            // Employment Dates
            startDate: employee.start_date,
            endDate: employee.end_date,
            
            // Position Information
            position: employee.position || employee.role || employee.job_title,
            location: employee.location,
            department: employee.department || employee.afdeling,
            
            // Compensation Information
            hoursPerWeek: employee.hours_per_week,
            grossMonthly: employee.salary,
            hourlyRate: employee.hourly_rate,
            
            // Contract Details
            contractType: employee.contract_type || employee.employment_type,
            employmentStatus: employee.status,
            
            // Employee Identifiers
            employeesId: employee.id,
            employeeNumber: employee.employee_number,
            
            // Additional Fields from Employes.nl
            locationId: employee.location_id,
            departmentId: employee.department_id,
            personalIdNumber: employee.personal_identification_number,
            syncedAt: new Date().toISOString()
          }
        };

        // Check if contract exists for this employee
        const { data: existingContracts } = await supabase
          .from('contracts')
          .select('id, query_params')
          .eq('employee_name', contractData.employee_name);

        // Check if we already have a contract for this employment period
        const existingContract = existingContracts?.find(c => 
          c.query_params?.startDate === employment.start_date &&
          c.query_params?.endDate === employment.end_date
        );

        if (existingContract) {
          // Update existing contract
          const { error: updateError } = await supabase
            .from('contracts')
            .update(contractData)
            .eq('id', existingContract.id);

          if (updateError) {
            errors.push(`Failed to update contract for ${contractData.employee_name}: ${updateError.message}`);
          } else {
            contractsUpdated++;
            console.log(`Updated contract for ${contractData.employee_name}`);
          }
        } else {
          // Create new contract
          const { error: insertError } = await supabase
            .from('contracts')
            .insert(contractData);

          if (insertError) {
            errors.push(`Failed to create contract for ${contractData.employee_name}: ${insertError.message}`);
          } else {
            contractsCreated++;
            console.log(`Created contract for ${contractData.employee_name}`);
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
      errors: errors.length,
      error_details: errors.slice(0, 10) // Limit error details to first 10
    };

    console.log('Contract sync completed:', summary);
    
    return { 
      data: {
        success: true,
        message: `Contract sync completed: ${contractsCreated} created, ${contractsUpdated} updated, ${contractsSkipped} skipped`,
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

// Fetch employment history for a specific employee
async function fetchEmploymentHistory(employeeId: string): Promise<EmployesResponse<any>> {
  try {
    console.log(`🔍 Fetching employment history for employee: ${employeeId}`);

    if (!EMPLOYES_API_KEY) {
      return { error: 'Employes API key not configured' };
    }

    if (!employeeId) {
      return { error: 'Employee ID is required' };
    }

    const companyId = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';
    const baseUrl = `${EMPLOYES_BASE_URL}/${companyId}`;

    // Test multiple endpoints for employment history
    const endpoints = [
      `employees/${employeeId}/employments`,
      `employees/${employeeId}/employment-history`,
      `employees/${employeeId}/salary-history`,
      `employees/${employeeId}/contracts`,
      `employees/${employeeId}/payruns`
    ];

    const results: any = {
      employeeId,
      baseUrl,
      endpointTests: []
    };

    // Test each endpoint
    for (const endpoint of endpoints) {
      const url = `${baseUrl}/${endpoint}`;
      console.log(`🧪 Testing endpoint: ${endpoint}`);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        const responseData = await response.json();

        results.endpointTests.push({
          endpoint,
          url,
          status: response.status,
          success: response.ok,
          dataKeys: response.ok ? Object.keys(responseData) : null,
          dataType: response.ok ? (Array.isArray(responseData) ? 'array' : typeof responseData) : null,
          itemCount: response.ok ? (Array.isArray(responseData) ? responseData.length : 1) : null,
          sampleData: response.ok ? JSON.stringify(responseData).substring(0, 200) + '...' : null,
          fullData: response.ok ? responseData : null,
          error: !response.ok ? responseData : null
        });

        // Log significant findings
        if (response.ok && responseData) {
          console.log(`✅ ${endpoint}: ${response.status} - Found data`);
          if (Array.isArray(responseData) && responseData.length > 0) {
            console.log(`   → Array with ${responseData.length} items`);
          } else if (typeof responseData === 'object') {
            console.log(`   → Object with keys: ${Object.keys(responseData).join(', ')}`);
          }
        } else {
          console.log(`❌ ${endpoint}: ${response.status} - ${responseData?.message || 'Failed'}`);
        }

      } catch (error) {
        console.error(`❌ Error testing ${endpoint}:`, error);
        results.endpointTests.push({
          endpoint,
          url,
          status: 0,
          success: false,
          error: error.message
        });
      }
    }

    // Filter successful endpoints with data
    const successfulEndpoints = results.endpointTests.filter(test =>
      test.success && test.fullData &&
      (Array.isArray(test.fullData) ? test.fullData.length > 0 : Object.keys(test.fullData).length > 0)
    );

    console.log(`🎯 Found ${successfulEndpoints.length} endpoints with data`);

    return {
      data: {
        ...results,
        summary: {
          totalEndpointsTested: endpoints.length,
          successfulEndpoints: successfulEndpoints.length,
          endpointsWithData: successfulEndpoints.map(test => test.endpoint),
          bestDataSource: successfulEndpoints[0]?.endpoint || null
        }
      }
    };

  } catch (error: any) {
    console.error('Employment history fetch error:', error);
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
        validActions: ['test_connection', 'fetch_companies', 'fetch_employees', 'compare_staff_data', 'sync_employees', 'sync_wage_data', 'sync_from_employes', 'sync_contracts', 'get_sync_statistics', 'get_sync_logs', 'discover_endpoints', 'debug_connection']
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

      case 'sync_contracts':
        result = await syncContractsFromEmployes();
        break;

      case 'test_individual_employees':
        result = await testIndividualEmployees();
        break;

      case 'analyze_employment_data':
        result = await analyzeEmploymentData();
        break;

<<<<<<< Updated upstream
=======
      case 'fetch_employment_history':
        result = await fetchEmploymentHistory(requestData.employeeId);
        break;

      case 'create_staging_table':
        result = await createStagingTableAction();
        break;

>>>>>>> Stashed changes
      default:
        console.error(`Unknown action received: ${action}`);
        result = { 
          error: `Unknown action: ${action}`,
          data: {
            validActions: ['test_connection', 'fetch_companies', 'fetch_employees', 'compare_staff_data', 'sync_employees', 'sync_wage_data', 'sync_from_employes', 'sync_contracts', 'get_sync_statistics', 'get_sync_logs', 'discover_endpoints', 'debug_connection', 'test_individual_employees', 'analyze_employment_data', 'fetch_employment_history']
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