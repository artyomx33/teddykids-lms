import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Employes API configuration
const EMPLOYES_API_BASE = 'https://api-dev.employes.nl';
const EMPLOYES_API_KEY = Deno.env.get('EMPLOYES_API_KEY')!;

interface EmployesResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}

// Log sync activity
async function logSync(
  action: string,
  status: 'success' | 'error',
  payload?: any,
  lmsStaffId?: string,
  employesEmployeeId?: string,
  errorMessage?: string
) {
  try {
    await supabase.from('employes_sync_logs').insert({
      action,
      status,
      payload,
      lms_staff_id: lmsStaffId,
      employes_employee_id: employesEmployeeId,
      error_message: errorMessage
    });
  } catch (logError) {
    console.error('Failed to log sync activity:', logError);
  }
}

// Make authenticated request to Employes API
async function employesRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<EmployesResponse<T>> {
  try {
    const response = await fetch(`${EMPLOYES_API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    
    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.message || 'API request failed',
      statusCode: response.status
    };
  } catch (error) {
    console.error('Employes API request failed:', error);
    return {
      error: error.message,
      statusCode: 500
    };
  }
}

// Fetch all employees from Employes API
async function fetchEmployesEmployees() {
  console.log('Fetching employees from Employes API...');
  
  const result = await employesRequest('/employees');
  
  if (result.error) {
    await logSync('fetch_employees', 'error', null, undefined, undefined, result.error);
    throw new Error(`Failed to fetch employees: ${result.error}`);
  }

  await logSync('fetch_employees', 'success', result.data);
  return result.data;
}

// Compare LMS staff with Employes employees
async function compareStaffData() {
  console.log('Comparing LMS staff with Employes employees...');
  
  // Fetch LMS staff
  const { data: lmsStaff, error: lmsError } = await supabase
    .from('staff')
    .select('*');
    
  if (lmsError) {
    throw new Error(`Failed to fetch LMS staff: ${lmsError.message}`);
  }

  // Fetch Employes employees
  const employesEmployees = await fetchEmployesEmployees();
  
  // Compare and find matches/mismatches
  const matches = [];
  const mismatches = [];
  const employesOnly = [...(employesEmployees || [])];
  
  for (const staff of lmsStaff || []) {
    const employesMatch = employesOnly.find(emp => 
      emp.firstName && emp.lastName && 
      `${emp.firstName} ${emp.lastName}`.toLowerCase() === staff.full_name?.toLowerCase()
    );
    
    if (employesMatch) {
      matches.push({
        lms: staff,
        employes: employesMatch
      });
      // Remove from employesOnly array
      const index = employesOnly.indexOf(employesMatch);
      if (index > -1) employesOnly.splice(index, 1);
    } else {
      mismatches.push({
        lms: staff,
        employes: null
      });
    }
  }
  
  // Remaining in employesOnly are employees not in LMS
  for (const emp of employesOnly) {
    mismatches.push({
      lms: null,
      employes: emp
    });
  }

  await logSync('compare_staff_data', 'success', {
    totalMatches: matches.length,
    totalMismatches: mismatches.length,
    lmsStaffCount: lmsStaff?.length || 0,
    employesEmployeeCount: employesEmployees?.length || 0
  });

  return {
    matches,
    mismatches,
    lmsStaff: lmsStaff || [],
    employesEmployees: employesEmployees || []
  };
}

// Sync employees from Employes to LMS
async function syncEmployeesToLMS() {
  console.log('Starting employee synchronization...');
  
  try {
    // First, get comparison data
    const comparisonData = await compareStaffData();
    const syncResults = {
      created: [],
      updated: [],
      errors: [],
      skipped: []
    };
    
    // Process matches - update existing staff
    for (const match of comparisonData.matches) {
      try {
        const lmsEmployee = match.lms;
        const employesEmployee = match.employes;
        
        // Update LMS staff with Employes data
        const { error: updateError } = await supabase
          .from('staff')
          .update({
            email: employesEmployee.email || lmsEmployee.email,
            role: employesEmployee.position || lmsEmployee.role,
            location: employesEmployee.location || lmsEmployee.location
          })
          .eq('id', lmsEmployee.id);
        
        if (updateError) {
          syncResults.errors.push({
            employee: employesEmployee,
            error: updateError.message,
            action: 'update'
          });
        } else {
          syncResults.updated.push({
            lmsId: lmsEmployee.id,
            employesId: employesEmployee.id,
            name: `${employesEmployee.firstName} ${employesEmployee.lastName}`
          });
          
          // Create/update mapping
          await supabase
            .from('employes_employee_map')
            .upsert({
              lms_staff_id: lmsEmployee.id,
              employes_employee_id: employesEmployee.id.toString()
            });
        }
      } catch (error) {
        syncResults.errors.push({
          employee: match.employes,
          error: error.message,
          action: 'update'
        });
      }
    }
    
    // Process mismatches - create new staff for Employes employees not in LMS
    for (const mismatch of comparisonData.mismatches) {
      if (mismatch.employes && !mismatch.lms) {
        try {
          const employesEmployee = mismatch.employes;
          
          // Check if we should create this employee (has required fields)
          if (!employesEmployee.firstName || !employesEmployee.lastName) {
            syncResults.skipped.push({
              employee: employesEmployee,
              reason: 'Missing required name fields'
            });
            continue;
          }
          
          // Create new staff member
          const { data: newStaff, error: createError } = await supabase
            .from('staff')
            .insert({
              full_name: `${employesEmployee.firstName} ${employesEmployee.lastName}`,
              email: employesEmployee.email,
              role: employesEmployee.position,
              location: employesEmployee.location,
              status: employesEmployee.status === 'active' ? 'active' : 'inactive'
            })
            .select()
            .single();
          
          if (createError) {
            syncResults.errors.push({
              employee: employesEmployee,
              error: createError.message,
              action: 'create'
            });
          } else {
            syncResults.created.push({
              lmsId: newStaff.id,
              employesId: employesEmployee.id,
              name: `${employesEmployee.firstName} ${employesEmployee.lastName}`
            });
            
            // Create mapping
            await supabase
              .from('employes_employee_map')
              .insert({
                lms_staff_id: newStaff.id,
                employes_employee_id: employesEmployee.id.toString()
              });
          }
        } catch (error) {
          syncResults.errors.push({
            employee: mismatch.employes,
            error: error.message,
            action: 'create'
          });
        }
      }
    }
    
    await logSync('sync_employees', 'success', syncResults);
    return syncResults;
    
  } catch (error) {
    console.error('Employee sync error:', error);
    await logSync('sync_employees', 'error', null, undefined, undefined, error.message);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    console.log(`Processing Employes integration request: ${action}`);

    switch (action) {
      case 'fetch_employees':
        const employees = await fetchEmployesEmployees();
        return new Response(JSON.stringify({ employees }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'compare_staff':
        const comparison = await compareStaffData();
        return new Response(JSON.stringify(comparison), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'sync_employees':
        const syncResults = await syncEmployeesToLMS();
        return new Response(JSON.stringify(syncResults), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_sync_logs':
        const { data: logs, error: logsError } = await supabase
          .from('employes_sync_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (logsError) {
          throw new Error(`Failed to fetch sync logs: ${logsError.message}`);
        }
        
        return new Response(JSON.stringify({ logs }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'test_connection':
        // Simple test to verify API connection
        const testResult = await employesRequest('/employees?$top=1');
        return new Response(JSON.stringify({ 
          connected: !testResult.error,
          error: testResult.error,
          statusCode: testResult.statusCode
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in employes-integration function:', error);
    
    await logSync('function_error', 'error', null, undefined, undefined, error.message);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});