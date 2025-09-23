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

    console.log(`API Response Status: ${response.status}`);
    console.log(`API Response Headers:`, [...response.headers.entries()]);

    // Get response text first to handle empty responses
    const responseText = await response.text();
    console.log(`API Response Text (first 200 chars): "${responseText.substring(0, 200)}"`);

    // Try to parse as JSON if there's content
    let data;
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return {
          error: `Invalid JSON response: ${responseText.substring(0, 100)}`,
          statusCode: response.status
        };
      }
    } else {
      console.log('Empty response received');
      data = null;
    }
    
    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : (data?.message || `API request failed with status ${response.status}`),
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

// Sync wage/salary data from LMS to Employes
async function syncWageDataToEmployes() {
  console.log('Starting wage data synchronization...');
  
  try {
    const syncResults = {
      created: [],
      updated: [],
      errors: [],
      skipped: []
    };

    // Get contracts with salary data
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .not('query_params', 'is', null);
    
    if (contractsError) {
      throw new Error(`Failed to fetch contracts: ${contractsError.message}`);
    }

    for (const contract of contracts || []) {
      try {
        const queryParams = contract.query_params || {};
        const salary = queryParams.salary;
        const startDate = queryParams.startDate;
        
        if (!salary || !startDate) {
          syncResults.skipped.push({
            contract: contract,
            reason: 'Missing salary or start date'
          });
          continue;
        }

        // Find employee mapping
        const { data: staffMember } = await supabase
          .from('staff')
          .select('id')
          .eq('full_name', contract.employee_name)
          .single();

        if (!staffMember) {
          syncResults.skipped.push({
            contract: contract,
            reason: 'No staff member found'
          });
          continue;
        }

        const { data: mapping } = await supabase
          .from('employes_employee_map')
          .select('employes_employee_id')
          .eq('lms_staff_id', staffMember.id)
          .single();

        if (!mapping) {
          syncResults.skipped.push({
            contract: contract,
            reason: 'No Employes mapping found'
          });
          continue;
        }

        // Create wage component in Employes
        const wageData = {
          employeeId: mapping.employes_employee_id,
          componentType: 'base_salary',
          amount: parseFloat(salary),
          startDate: startDate,
          frequency: 'monthly'
        };

        const result = await employesRequest('/wage-components', 'POST', wageData);
        
        if (result.error) {
          syncResults.errors.push({
            contract: contract,
            error: result.error,
            action: 'create_wage'
          });
        } else {
          syncResults.created.push({
            contractId: contract.id,
            employesWageId: result.data?.id,
            amount: salary
          });
          
          // Create wage mapping
          await supabase
            .from('employes_wage_map')
            .insert({
              lms_contract_id: contract.id,
              employes_wage_component_id: result.data?.id?.toString(),
              component_type: 'base_salary'
            });
        }
      } catch (error) {
        syncResults.errors.push({
          contract: contract,
          error: error.message,
          action: 'sync_wage'
        });
      }
    }
    
    await logSync('sync_wage_data', 'success', syncResults);
    return syncResults;
    
  } catch (error) {
    console.error('Wage sync error:', error);
    await logSync('sync_wage_data', 'error', null, undefined, undefined, error.message);
    throw error;
  }
}

// Bidirectional sync - fetch updates from Employes and apply to LMS
async function syncFromEmployesToLMS() {
  console.log('Starting bidirectional sync from Employes to LMS...');
  
  try {
    const syncResults = {
      employeeUpdates: [],
      wageUpdates: [],
      errors: []
    };

    // Get all mapped employees
    const { data: mappings, error: mappingsError } = await supabase
      .from('employes_employee_map')
      .select(`
        lms_staff_id,
        employes_employee_id,
        staff:lms_staff_id(*)
      `);
    
    if (mappingsError) {
      throw new Error(`Failed to fetch employee mappings: ${mappingsError.message}`);
    }

    for (const mapping of mappings || []) {
      try {
        // Fetch latest employee data from Employes
        const employeeResult = await employesRequest(`/employees/${mapping.employes_employee_id}`);
        
        if (employeeResult.error) {
          syncResults.errors.push({
            employeId: mapping.employes_employee_id,
            error: employeeResult.error,
            action: 'fetch_employee'
          });
          continue;
        }

        const employesEmployee = employeeResult.data;
        const lmsEmployee = mapping.staff;

        // Check for updates needed in LMS
        const updates = {};
        
        if (employesEmployee.email !== lmsEmployee.email) {
          updates.email = employesEmployee.email;
        }
        if (employesEmployee.position !== lmsEmployee.role) {
          updates.role = employesEmployee.position;
        }
        if (employesEmployee.location !== lmsEmployee.location) {
          updates.location = employesEmployee.location;
        }

        // Apply updates if any
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('staff')
            .update(updates)
            .eq('id', mapping.lms_staff_id);
          
          if (updateError) {
            syncResults.errors.push({
              staffId: mapping.lms_staff_id,
              error: updateError.message,
              action: 'update_staff'
            });
          } else {
            syncResults.employeeUpdates.push({
              staffId: mapping.lms_staff_id,
              updates: updates
            });
          }
        }
      } catch (error) {
        syncResults.errors.push({
          employeId: mapping.employes_employee_id,
          error: error.message,
          action: 'bidirectional_sync'
        });
      }
    }
    
    await logSync('sync_from_employes', 'success', syncResults);
    return syncResults;
    
  } catch (error) {
    console.error('Bidirectional sync error:', error);
    await logSync('sync_from_employes', 'error', null, undefined, undefined, error.message);
    throw error;
  }
}

// Get detailed sync status and statistics
async function getSyncStatistics() {
  try {
    // Employee mapping stats
    const { data: mappingStats, error: mappingError } = await supabase
      .from('employes_employee_map')
      .select('id', { count: 'exact' });

    // Wage mapping stats  
    const { data: wageStats, error: wageError } = await supabase
      .from('employes_wage_map')
      .select('id', { count: 'exact' });

    // Recent sync activity
    const { data: recentLogs, error: logsError } = await supabase
      .from('employes_sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Success/error rates from logs
    const { data: successLogs, error: successError } = await supabase
      .from('employes_sync_logs')
      .select('id', { count: 'exact' })
      .eq('status', 'success')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const { data: errorLogs, error: errorLogsError } = await supabase
      .from('employes_sync_logs')
      .select('id', { count: 'exact' })
      .eq('status', 'error')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    return {
      mappedEmployees: mappingStats?.length || 0,
      mappedWageComponents: wageStats?.length || 0,
      recentActivity: recentLogs || [],
      weeklySuccessRate: {
        successful: successLogs?.length || 0,
        failed: errorLogs?.length || 0
      },
      lastSyncAt: recentLogs?.[0]?.created_at
    };
  } catch (error) {
    console.error('Failed to get sync statistics:', error);
    throw error;
  }
}
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action;

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

      case 'sync_wage_data':
        const wageResults = await syncWageDataToEmployes();
        return new Response(JSON.stringify(wageResults), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'sync_from_employes':
        const bidirectionalResults = await syncFromEmployesToLMS();
        return new Response(JSON.stringify(bidirectionalResults), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_sync_statistics':
        const stats = await getSyncStatistics();
        return new Response(JSON.stringify(stats), {
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