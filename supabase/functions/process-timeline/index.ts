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

  // Enhanced complete state fields
  month_wage_at_event?: number;
  hours_per_week_at_event?: number;
  annual_salary_at_event?: number;
  net_monthly_at_event?: number;
  role_at_event?: string;
  department_at_event?: string;
  contract_type_at_event?: string;
  employment_type_at_event?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_phase?: string;

  // Contract milestone fields
  contract_milestone_type?: string;
  contract_milestone_data?: any;
  days_until_expiry?: number;
  expiry_warning_level?: string;

  // Change tracking
  fields_changed?: any;
  change_source?: string;
  state_version?: number;
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

// Contract milestone detection utilities
function calculateDaysUntilExpiry(endDate: string | null): number | null {
  if (!endDate) return null;
  const today = new Date();
  const expiry = new Date(endDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

function getExpiryWarningLevel(daysUntilExpiry: number | null): string {
  if (!daysUntilExpiry || daysUntilExpiry > 90) return 'none';
  if (daysUntilExpiry <= 7) return 'critical';
  if (daysUntilExpiry <= 30) return 'urgent';
  return 'upcoming';
}

function detectContractMilestones(
  currentContract: any,
  previousContract: any | null,
  employeeName: string
): TimelineEvent[] {
  const milestones: TimelineEvent[] = [];

  if (!currentContract) return milestones;

  const contractType = currentContract.contract_duration === 'fixed' ? 'fixed' : 'permanent';
  const daysUntilExpiry = calculateDaysUntilExpiry(currentContract.end_date);
  const warningLevel = getExpiryWarningLevel(daysUntilExpiry);

  // Contract Started (first contract or new contract after gap)
  if (!previousContract) {
    milestones.push({
      employee_id: currentContract.employee_id || '',
      event_type: 'contract_milestone',
      event_date: currentContract.start_date,
      event_title: 'Contract Started',
      event_description: contractType === 'fixed'
        ? 'Fixed-term contract started (' + new Date(currentContract.start_date).toLocaleDateString() +
          (currentContract.end_date ? ' → ' + new Date(currentContract.end_date).toLocaleDateString() : '') + ')'
        : 'Permanent contract started',
      event_data: {
        contract_type: contractType,
        start_date: currentContract.start_date,
        end_date: currentContract.end_date
      },
      contract_milestone_type: 'contract_started',
      contract_milestone_data: {
        contract_type: contractType,
        start_date: currentContract.start_date,
        end_date: currentContract.end_date,
        duration_months: currentContract.end_date ?
          Math.round((new Date(currentContract.end_date).getTime() - new Date(currentContract.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)) :
          null
      },
      days_until_expiry: daysUntilExpiry,
      expiry_warning_level: warningLevel,
      change_source: 'contract_milestone_detection',
      state_version: 1
    });
  }

  // Contract Conversion (fixed → permanent)
  if (previousContract &&
      previousContract.contract_duration === 'fixed' &&
      currentContract.contract_duration === 'permanent') {
    milestones.push({
      employee_id: currentContract.employee_id || '',
      event_type: 'contract_milestone',
      event_date: currentContract.start_date,
      event_title: 'Contract Converted',
      event_description: 'Contract converted from fixed-term to permanent',
      event_data: {
        previous_contract_type: 'fixed',
        new_contract_type: 'permanent',
        conversion_date: currentContract.start_date
      },
      contract_milestone_type: 'contract_converted',
      contract_milestone_data: {
        contract_type: 'permanent',
        previous_contract_type: 'fixed',
        start_date: currentContract.start_date
      },
      days_until_expiry: null,
      expiry_warning_level: 'none',
      change_source: 'contract_milestone_detection',
      state_version: 1
    });
  }

  // Contract Ending Soon (only for fixed-term contracts)
  if (contractType === 'fixed' && daysUntilExpiry && daysUntilExpiry <= 90 && daysUntilExpiry > 0) {
    const warningDays = daysUntilExpiry <= 7 ? 7 : daysUntilExpiry <= 30 ? 30 : 90;
    milestones.push({
      employee_id: currentContract.employee_id || '',
      event_type: 'contract_milestone',
      event_date: new Date(Date.now() - (90 - daysUntilExpiry) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      event_title: 'Contract Ending Soon',
      event_description: 'Contract expires in ' + daysUntilExpiry + ' days',
      event_data: {
        contract_type: contractType,
        end_date: currentContract.end_date,
        days_remaining: daysUntilExpiry,
        warning_level: warningLevel
      },
      contract_milestone_type: 'contract_ending_soon',
      contract_milestone_data: {
        contract_type: contractType,
        end_date: currentContract.end_date,
        warning_days: warningDays
      },
      days_until_expiry: daysUntilExpiry,
      expiry_warning_level: warningLevel,
      change_source: 'contract_milestone_detection',
      state_version: 1
    });
  }

  return milestones;
}

function buildCompleteState(
  event: TimelineEvent,
  employment: EmploymentData,
  currentSalary?: any,
  currentHours?: any,
  currentContract?: any
): TimelineEvent {
  // Calculate complete employment state at this event
  const completeEvent = { ...event };

  // Salary state
  if (currentSalary) {
    completeEvent.month_wage_at_event = currentSalary.month_wage;
    completeEvent.annual_salary_at_event = currentSalary.yearly_wage || currentSalary.month_wage * 12;
    completeEvent.net_monthly_at_event = Math.round(currentSalary.month_wage * 0.63); // Dutch net estimate
  }

  // Hours state
  if (currentHours) {
    completeEvent.hours_per_week_at_event = currentHours.hours_per_week;
  }

  // Contract state
  if (currentContract) {
    completeEvent.contract_type_at_event = currentContract.contract_duration === 'fixed' ? 'fixed' : 'permanent';
    completeEvent.contract_start_date = currentContract.start_date;
    completeEvent.contract_end_date = currentContract.end_date;
    completeEvent.employment_type_at_event = currentContract.employment_type || 'fulltime';

    // Contract phase analysis
    if (currentContract.end_date) {
      const daysUntilExpiry = calculateDaysUntilExpiry(currentContract.end_date);
      if (daysUntilExpiry && daysUntilExpiry <= 90) {
        completeEvent.contract_phase = 'ending_soon';
      } else {
        completeEvent.contract_phase = 'active';
      }
    } else {
      completeEvent.contract_phase = 'permanent';
    }
  }

  // Change tracking
  completeEvent.fields_changed = event.fields_changed || ['event_created'];
  completeEvent.change_source = event.change_source || 'timeline_generation';
  completeEvent.state_version = 1;

  return completeEvent;
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

      // Sort all data chronologically for proper state building
      const salaries = (employment.salary || []).sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      const contracts = (employment.contracts || []).sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      const hours = (employment.hours || []).sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

      // Detect and create contract milestone events first
      for (let i = 0; i < contracts.length; i++) {
        const contract = contracts[i];
        const previousContract = i > 0 ? contracts[i - 1] : null;

        const contractMilestones = detectContractMilestones(
          { ...contract, employee_id: employeeId },
          previousContract,
          employeeName
        );

        // Add contract milestone events
        for (const milestone of contractMilestones) {
          // Check if milestone already exists
          const { data: existingMilestone } = await supabase
            .from('employes_timeline_v2')
            .select('id')
            .eq('employee_id', employeeId)
            .eq('event_type', milestone.event_type)
            .eq('contract_milestone_type', milestone.contract_milestone_type)
            .eq('event_date', milestone.event_date)
            .maybeSingle();

          if (!existingMilestone) {
            events.push(milestone);
          }
        }
      }

      // Process salary history with complete state
      if (employment.salary && Array.isArray(employment.salary)) {
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

            // Find current contract and hours for complete state
            const currentContract = contracts.find(c =>
              new Date(c.start_date) <= new Date(salary.start_date) &&
              (!c.end_date || new Date(c.end_date) >= new Date(salary.start_date))
            );
            const currentHours = hours.find(h =>
              new Date(h.start_date) <= new Date(salary.start_date) &&
              (!h.end_date || new Date(h.end_date) >= new Date(salary.start_date))
            );

            let salaryEvent: TimelineEvent;

            if (i === 0) {
              // First salary - contract started
              salaryEvent = {
                employee_id: employeeId,
                event_type: 'contract_started',
                event_date: salary.start_date,
                event_title: 'Contract Started',
                event_description: employeeName + ' started with €' + salary.month_wage + '/month',
                event_data: {
                  salary: salary.month_wage,
                  hourly_wage: salary.hour_wage,
                  yearly_wage: salary.yearly_wage,
                  employment_id: employment.id
                },
                fields_changed: ['salary'],
                change_source: 'salary_change',
                state_version: 1
              };
            } else if (change !== 0) {
              // Salary change
              salaryEvent = {
                employee_id: employeeId,
                event_type: change > 0 ? 'salary_increase' : 'salary_decrease',
                event_date: salary.start_date,
                event_title: change > 0 ? 'Salary Increase' : 'Salary Decrease',
                event_description: 'Salary ' + (change > 0 ? 'increased' : 'decreased') + ' by €' + Math.abs(change) + ' (' + (changePercentage > 0 ? '+' : '') + changePercentage.toFixed(1) + '%)',
                event_data: {
                  previous_salary: previousSalary.month_wage,
                  new_salary: salary.month_wage,
                  change_amount: change,
                  change_percentage: changePercentage,
                  hourly_wage: salary.hour_wage,
                  yearly_wage: salary.yearly_wage
                },
                fields_changed: ['salary'],
                change_source: 'salary_change',
                state_version: 1
              };
            } else {
              continue; // Skip if no salary change
            }

            // Build complete state for this event
            const completeEvent = buildCompleteState(salaryEvent, employment, salary, currentHours, currentContract);
            events.push(completeEvent);
          }
        }
      }

      // Process hours changes with complete state
      if (employment.hours && Array.isArray(employment.hours)) {
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
              // Find current salary and contract for complete state
              const currentSalary = salaries.find(s =>
                new Date(s.start_date) <= new Date(hour.start_date) &&
                (!s.end_date || new Date(s.end_date) >= new Date(hour.start_date))
              );
              const currentContract = contracts.find(c =>
                new Date(c.start_date) <= new Date(hour.start_date) &&
                (!c.end_date || new Date(c.end_date) >= new Date(hour.start_date))
              );

              const hoursEvent: TimelineEvent = {
                employee_id: employeeId,
                event_type: 'hours_change',
                event_date: hour.start_date,
                event_title: 'Working Hours Changed',
                event_description: 'Hours changed from ' + previousHour.hours_per_week + ' to ' + hour.hours_per_week + ' hours/week',
                event_data: {
                  previous_hours: previousHour.hours_per_week,
                  new_hours: hour.hours_per_week,
                  days_per_week: hour.days_per_week
                },
                fields_changed: ['hours'],
                change_source: 'hours_change',
                state_version: 1
              };

              // Build complete state for this event
              const completeEvent = buildCompleteState(hoursEvent, employment, currentSalary, hour, currentContract);
              events.push(completeEvent);
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
