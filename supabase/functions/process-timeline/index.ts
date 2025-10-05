import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Timeline Processor - Converts raw data to timeline events
// Designed for both immediate and background processing

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

interface TimelineEvent {
  employee_id: string;
  event_type: string;
  event_date: string;
  event_title: string;
  event_description: string;
  event_data: any;
  change_id?: string;
}

interface EmploymentData {
  salary?: Array<{
    id: string;
    start_date: string;
    end_date?: string;
    month_wage: number;
    hour_wage: number;
    yearly_wage: number;
    is_active: boolean;
  }>;
  contracts?: Array<{
    id: string;
    start_date: string;
    end_date?: string;
    contract_duration: string;
    is_active: boolean;
  }>;
  hours?: Array<{
    id: string;
    start_date: string;
    end_date?: string;
    hours_per_week: number;
    days_per_week: number;
    is_active: boolean;
  }>;
  employee?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
  };
}

async function processEmployee(
  supabase: any,
  employeeId: string
): Promise<{ events: number; errors: string[] }> {
  const events: TimelineEvent[] = [];
  const errors: string[] = [];
  
  try {
    // Get employee raw data
    const { data: employeeData } = await supabase
      .from('employes_raw_data')
      .select('api_response')
      .eq('employee_id', employeeId)
      .eq('endpoint', '/employee')
      .eq('is_latest', true)
      .maybeSingle();
    
    const { data: employmentData } = await supabase
      .from('employes_raw_data')
      .select('api_response')
      .eq('employee_id', employeeId)
      .eq('endpoint', '/employments')
      .eq('is_latest', true)
      .maybeSingle();
    
    if (!employeeData && !employmentData) {
      return { events: 0, errors: [`No data found for employee ${employeeId}`] };
    }
    
    const employeeName = employeeData?.api_response?.first_name && employeeData?.api_response?.last_name
      ? `${employeeData.api_response.first_name} ${employeeData.api_response.last_name}`
      : employeeData?.api_response?.display_name || 'Employee';
    
    // Check if employee_added event exists
    const { data: existingAddedEvent } = await supabase
      .from('employes_timeline_v2')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('event_type', 'employee_added')
      .maybeSingle();
    
    if (!existingAddedEvent && employeeData) {
      // Create employee_added event
      events.push({
        employee_id: employeeId,
        event_type: 'employee_added',
        event_date: employeeData.api_response.start_date || new Date().toISOString(),
        event_title: 'Employee Added',
        event_description: `${employeeName} was added to the system`,
        event_data: { 
          status: employeeData.api_response.status || 'active',
          department: employeeData.api_response.department_id
        }
      });
    }
    
    if (employmentData?.api_response) {
      const employment: EmploymentData = employmentData.api_response;
      
      // Process salary history
      if (employment.salary && Array.isArray(employment.salary)) {
        const salaries = employment.salary
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        
        for (let i = 0; i < salaries.length; i++) {
          const salary = salaries[i];
          const previousSalary = i > 0 ? salaries[i - 1] : null;
          
          // Check if this salary event exists
          const { data: existingSalaryEvent } = await supabase
            .from('employes_timeline_v2')
            .select('id')
            .eq('employee_id', employeeId)
            .eq('event_type', i === 0 ? 'contract_started' : 'salary_increase')
            .eq('event_date', salary.start_date)
            .maybeSingle();
          
          if (!existingSalaryEvent) {
            const change = previousSalary ? salary.month_wage - previousSalary.month_wage : 0;
            const changePercentage = previousSalary 
              ? ((change / previousSalary.month_wage) * 100) 
              : 0;
            
            if (i === 0) {
              // First salary - contract started
              events.push({
                employee_id: employeeId,
                event_type: 'contract_started',
                event_date: salary.start_date,
                event_title: 'Contract Started',
                event_description: `${employeeName} started with €${salary.month_wage}/month`,
                event_data: {
                  salary: salary.month_wage,
                  hourly_wage: salary.hour_wage,
                  yearly_wage: salary.yearly_wage,
                  employment_id: employment.id
                }
              });
            } else if (change !== 0) {
              // Salary change
              events.push({
                employee_id: employeeId,
                event_type: change > 0 ? 'salary_increase' : 'salary_decrease',
                event_date: salary.start_date,
                event_title: change > 0 ? 'Salary Increase' : 'Salary Decrease',
                event_description: `Salary ${change > 0 ? 'increased' : 'decreased'} by €${Math.abs(change)} (${changePercentage > 0 ? '+' : ''}${changePercentage.toFixed(1)}%)`,
                event_data: {
                  previous_salary: previousSalary.month_wage,
                  new_salary: salary.month_wage,
                  change_amount: change,
                  change_percentage: changePercentage,
                  hourly_wage: salary.hour_wage,
                  yearly_wage: salary.yearly_wage
                }
              });
            }
          }
        }
      }
      
      // Process contract changes
      if (employment.contracts && Array.isArray(employment.contracts)) {
        const contracts = employment.contracts
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        
        for (let i = 1; i < contracts.length; i++) { // Skip first (covered by salary)
          const contract = contracts[i];
          
          // Check if this contract event exists
          const { data: existingContractEvent } = await supabase
            .from('employes_timeline_v2')
            .select('id')
            .eq('employee_id', employeeId)
            .eq('event_type', 'contract_renewed')
            .eq('event_date', contract.start_date)
            .maybeSingle();
          
          if (!existingContractEvent) {
            events.push({
              employee_id: employeeId,
              event_type: 'contract_renewed',
              event_date: contract.start_date,
              event_title: 'Contract Renewed',
              event_description: `${contract.contract_duration === 'fixed' ? 'Fixed-term' : 'Permanent'} contract${contract.end_date ? ` until ${new Date(contract.end_date).toLocaleDateString()}` : ''}`,
              event_data: {
                contract_type: contract.contract_duration,
                end_date: contract.end_date,
                is_signed: contract.is_signed
              }
            });
          }
        }
      }
      
      // Process hours changes
      if (employment.hours && Array.isArray(employment.hours)) {
        const hours = employment.hours
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        
        for (let i = 1; i < hours.length; i++) { // Skip first
          const hour = hours[i];
          const previousHour = hours[i - 1];
          
          if (hour.hours_per_week !== previousHour.hours_per_week) {
            // Check if this hours event exists
            const { data: existingHoursEvent } = await supabase
              .from('employes_timeline_v2')
              .select('id')
              .eq('employee_id', employeeId)
              .eq('event_type', 'hours_change')
              .eq('event_date', hour.start_date)
              .maybeSingle();
            
            if (!existingHoursEvent) {
              events.push({
                employee_id: employeeId,
                event_type: 'hours_change',
                event_date: hour.start_date,
                event_title: 'Working Hours Changed',
                event_description: `Hours changed from ${previousHour.hours_per_week} to ${hour.hours_per_week} hours/week`,
                event_data: {
                  previous_hours: previousHour.hours_per_week,
                  new_hours: hour.hours_per_week,
                  days_per_week: hour.days_per_week
                }
              });
            }
          }
        }
      }
    }
    
    // Insert all events
    if (events.length > 0) {
      const { error: insertError } = await supabase
        .from('employes_timeline_v2')
        .insert(events);
      
      if (insertError) {
        errors.push(`Failed to insert events: ${insertError.message}`);
        return { events: 0, errors };
      }
    }
    
    return { events: events.length, errors };
    
  } catch (error: any) {
    errors.push(`Error processing employee ${employeeId}: ${error.message}`);
    return { events: 0, errors };
  }
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
    
    const body = await req.json().catch(() => ({}));
    const { employee_ids = [], source = 'manual' } = body;
    
    if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No employee IDs provided'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`🎯 Processing ${employee_ids.length} employees from ${source}`);
    
    let totalEvents = 0;
    const allErrors: string[] = [];
    const processed: string[] = [];
    
    // Process each employee
    for (const employeeId of employee_ids) {
      const result = await processEmployee(supabase, employeeId);
      totalEvents += result.events;
      allErrors.push(...result.errors);
      if (result.events > 0) {
        processed.push(employeeId);
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Timeline processing complete!`);
    console.log(`   Employees: ${employee_ids.length}`);
    console.log(`   Events created: ${totalEvents}`);
    console.log(`   Errors: ${allErrors.length}`);
    console.log(`   Duration: ${duration}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          employees_processed: employee_ids.length,
          events_created: totalEvents,
          employees_with_events: processed.length,
          errors: allErrors.slice(0, 10),
          duration_ms: duration
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
    console.error('❌ Processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error'
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
