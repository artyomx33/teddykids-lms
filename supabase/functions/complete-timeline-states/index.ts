import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface CompleteStateRequest {
  employee_id?: string;
  event_id?: string;
  batch_size?: number;
  mode: 'single_event' | 'single_employee' | 'all_employees' | 'backfill_all';
  dry_run?: boolean;
}

interface EmploymentState {
  // Personal Info
  employee_number_at_event?: string;
  email_at_event?: string;
  first_name_at_event?: string;
  last_name_at_event?: string;
  birth_date_at_event?: string;

  // Financial Info (enhanced names)
  month_wage_at_event?: number;
  hour_wage_at_event?: number;
  annual_salary_at_event?: number;
  net_monthly_at_event?: number;

  // Work Schedule
  hours_per_week_at_event?: number;
  days_per_week_at_event?: number;
  start_time_at_event?: string;
  end_time_at_event?: string;

  // Contract Info
  contract_id_at_event?: string;
  contract_type_at_event?: string;
  employment_type_at_event?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  probation_end_date_at_event?: string;
  notice_period_days_at_event?: number;

  // Role & Department
  function_name_at_event?: string;
  cost_center_name_at_event?: string;
  cost_center_code_at_event?: string;
  manager_id_at_event?: string;
  manager_name_at_event?: string;

  // Status
  phase_at_event?: string;
  status_at_event?: string;

  // Change Tracking
  fields_changed?: string[];
  change_source?: string;
  state_version?: number;
  change_confidence?: number;
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { employee_id, event_id, batch_size = 10, mode, dry_run = false }: CompleteStateRequest = await req.json();

    console.log('State completion request:', { mode, employee_id, event_id, batch_size, dry_run });

    let result;

    switch (mode) {
      case 'single_event':
        if (!event_id) throw new Error('event_id required for single_event mode');
        result = await completeEventState(supabase, event_id, dry_run);
        break;

      case 'single_employee':
        if (!employee_id) throw new Error('employee_id required for single_employee mode');
        result = await completeEmployeeStates(supabase, employee_id, dry_run);
        break;

      case 'all_employees':
        result = await completeAllEmployeeStates(supabase, batch_size, dry_run);
        break;

      case 'backfill_all':
        result = await backfillAllTimelineStates(supabase, batch_size, dry_run);
        break;

      default:
        throw new Error('Invalid mode. Use: single_event, single_employee, all_employees, or backfill_all');
    }

    return new Response(JSON.stringify({
      success: true,
      mode,
      dry_run,
      result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('State completion error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function completeEmployeeStates(supabase: any, employeeId: string, dryRun: boolean = false) {
  console.log('Processing employee:', employeeId);

  // 1. Get all timeline events for employee (chronological order)
  const { data: events, error: eventsError } = await supabase
    .from('employes_timeline_v2')
    .select('*')
    .eq('employee_id', employeeId)
    .order('event_date', { ascending: true })
    .order('sequence_order', { ascending: true });

  if (eventsError) throw eventsError;

  console.log(`Found ${events.length} events for employee ${employeeId}`);

  let previousState: EmploymentState | null = null;
  const completedEvents = [];
  let errorsEncountered = 0;

  for (const event of events) {
    try {
      // 2. Build complete state by carrying forward + applying changes
      const completeState = await buildCompleteState(supabase, event, previousState);

      // 3. Update timeline event with complete state (if not dry run)
      if (!dryRun) {
        await updateEventWithCompleteState(supabase, event.id, completeState);
      }

      completedEvents.push({
        event_id: event.id,
        event_date: event.event_date,
        event_type: event.event_type,
        fields_completed: Object.keys(completeState).filter(key => completeState[key] != null).length,
        fields_changed: completeState.fields_changed || [],
        dry_run: dryRun
      });

      previousState = completeState;

    } catch (error) {
      console.error(`Error processing event ${event.id}:`, error);
      errorsEncountered++;
      completedEvents.push({
        event_id: event.id,
        error: error.message,
        dry_run: dryRun
      });
    }
  }

  return {
    employee_id: employeeId,
    events_processed: events.length,
    events_completed: completedEvents.length - errorsEncountered,
    errors_encountered: errorsEncountered,
    completed_events: completedEvents,
    success_rate: ((events.length - errorsEncountered) / events.length * 100).toFixed(1) + '%'
  };
}

async function buildCompleteState(
  supabase: any,
  event: any,
  previousState: EmploymentState | null
): Promise<EmploymentState> {

  // Start with previous state or get base state from raw data
  let completeState: EmploymentState;

  if (previousState) {
    // Carry forward from previous event
    completeState = { ...previousState };
  } else {
    // First event - get base state from raw data
    console.log(`Getting base state for employee ${event.employee_id} at date ${event.event_date}`);
    completeState = await getBaseStateFromRawData(supabase, event.employee_id, event.event_date);
  }

  // Apply changes from this event
  const fieldsChanged: string[] = [];

  if (event.new_value) {
    const changes = typeof event.new_value === 'string'
      ? JSON.parse(event.new_value)
      : event.new_value;

    console.log(`Applying changes for event ${event.id}:`, changes);

    // Map changes to complete state fields with change tracking
    Object.entries(changes).forEach(([key, value]) => {
      const stateField = mapToStateField(key);
      if (stateField && value != null) {
        const oldValue = completeState[stateField];
        if (oldValue !== value) {
          completeState[stateField] = value;
          fieldsChanged.push(key);
        }
      }
    });
  }

  // Map legacy fields if they exist
  if (event.salary_at_event != null) {
    completeState.month_wage_at_event = Number(event.salary_at_event);
    if (!fieldsChanged.includes('salary_at_event')) fieldsChanged.push('salary_at_event');
  }

  if (event.hours_at_event != null) {
    completeState.hours_per_week_at_event = Number(event.hours_at_event);
    if (!fieldsChanged.includes('hours_at_event')) fieldsChanged.push('hours_at_event');
  }

  // Calculate derived fields
  if (completeState.month_wage_at_event) {
    completeState.annual_salary_at_event = completeState.month_wage_at_event * 12;
    completeState.net_monthly_at_event = calculateNetSalary(completeState.month_wage_at_event);
  }

  // Set change tracking metadata
  completeState.fields_changed = fieldsChanged;
  completeState.change_source = 'state_completion_service';
  completeState.state_version = (previousState?.state_version || 0) + 1;
  completeState.change_confidence = 1.0;

  console.log(`Built complete state for event ${event.id}:`, {
    fieldsChanged,
    stateVersion: completeState.state_version,
    hasMonthWage: !!completeState.month_wage_at_event,
    hasHours: !!completeState.hours_per_week_at_event
  });

  return completeState;
}

async function getBaseStateFromRawData(supabase: any, employeeId: string, eventDate: string): Promise<EmploymentState> {
  console.log(`Getting base state for employee ${employeeId} around date ${eventDate}`);

  // Get the most recent raw data for this employee before or at the event date
  const { data: rawData, error } = await supabase
    .from('employes_raw_data')
    .select('*')
    .eq('employee_id', employeeId)
    .lte('effective_from', eventDate)
    .order('effective_from', { ascending: false })
    .limit(10); // Get multiple records to find the right endpoints

  if (error) {
    console.error('Error getting raw data:', error);
    return {}; // Return empty state if no raw data available
  }

  if (!rawData || rawData.length === 0) {
    console.log('No raw data found for employee, returning empty state');
    return {};
  }

  console.log(`Found ${rawData.length} raw data records for employee ${employeeId}`);

  // Build state from different endpoints
  const baseState: EmploymentState = {};

  for (const record of rawData) {
    const apiResponse = record.api_response;

    if (record.endpoint === '/employee' && apiResponse) {
      baseState.employee_number_at_event = apiResponse.employee_number;
      baseState.email_at_event = apiResponse.email;
      baseState.first_name_at_event = apiResponse.first_name;
      baseState.last_name_at_event = apiResponse.last_name;
      baseState.birth_date_at_event = apiResponse.birth_date;
    }

    if (record.endpoint === '/employments' && apiResponse) {
      const employment = Array.isArray(apiResponse) ? apiResponse[0] : apiResponse;
      if (employment) {
        baseState.contract_start_date = employment.start_date;
        baseState.contract_end_date = employment.end_date;
        baseState.employment_type_at_event = employment.employment_type;

        if (employment.contract) {
          baseState.contract_id_at_event = employment.contract.contract_id;
          baseState.contract_type_at_event = employment.contract.contract_type;
          baseState.hours_per_week_at_event = employment.contract.hours_per_week;
          baseState.phase_at_event = employment.contract.phase;
        }

        if (employment.salary) {
          baseState.month_wage_at_event = employment.salary.month_wage;
          baseState.hour_wage_at_event = employment.salary.hour_wage;
        }

        if (employment.function) {
          baseState.function_name_at_event = employment.function.name;
        }

        if (employment.cost_center) {
          baseState.cost_center_name_at_event = employment.cost_center.name;
          baseState.cost_center_code_at_event = employment.cost_center.code;
        }
      }
    }
  }

  console.log('Built base state from raw data:', {
    hasPersonalInfo: !!(baseState.first_name_at_event && baseState.last_name_at_event),
    hasFinancialInfo: !!baseState.month_wage_at_event,
    hasWorkInfo: !!baseState.hours_per_week_at_event,
    hasContractInfo: !!baseState.contract_type_at_event
  });

  return baseState;
}

function mapToStateField(changeKey: string): string | null {
  const mapping: Record<string, string> = {
    // Legacy mappings
    'salary_at_event': 'month_wage_at_event',
    'hours_at_event': 'hours_per_week_at_event',

    // Direct mappings for enhanced fields
    'month_wage': 'month_wage_at_event',
    'hour_wage': 'hour_wage_at_event',
    'hours_per_week': 'hours_per_week_at_event',
    'contract_type': 'contract_type_at_event',
    'employment_type': 'employment_type_at_event',
    'function.name': 'function_name_at_event',
    'cost_center.name': 'cost_center_name_at_event',
    'cost_center.code': 'cost_center_code_at_event',
    'contract.phase': 'phase_at_event',
    'contract.contract_type': 'contract_type_at_event',
    'contract.hours_per_week': 'hours_per_week_at_event',
    'start_date': 'contract_start_date',
    'end_date': 'contract_end_date'
  };

  return mapping[changeKey] || null;
}

function calculateNetSalary(monthWage: number): number {
  // Simplified Dutch tax calculation for estimation
  // This is a rough estimate - actual calculation is more complex
  const taxRate = 0.37; // Average effective tax rate
  return Math.round(monthWage * (1 - taxRate));
}

async function updateEventWithCompleteState(supabase: any, eventId: string, completeState: EmploymentState) {
  console.log(`Updating event ${eventId} with complete state`);

  const { error } = await supabase
    .from('employes_timeline_v2')
    .update(completeState)
    .eq('id', eventId);

  if (error) {
    console.error(`Error updating event ${eventId}:`, error);
    throw error;
  }

  console.log(`Successfully updated event ${eventId}`);
}

async function completeAllEmployeeStates(supabase: any, batchSize: number, dryRun: boolean) {
  // Get all unique employee IDs from timeline
  const { data: employees, error } = await supabase
    .from('employes_timeline_v2')
    .select('employee_id')
    .order('employee_id');

  if (error) throw error;

  const uniqueEmployees = [...new Set(employees.map(e => e.employee_id))];
  console.log(`Processing ${uniqueEmployees.length} unique employees`);

  const results = [];
  let processed = 0;

  for (const employeeId of uniqueEmployees) {
    try {
      const result = await completeEmployeeStates(supabase, employeeId, dryRun);
      results.push(result);
      processed++;

      if (processed % batchSize === 0) {
        console.log(`Processed ${processed}/${uniqueEmployees.length} employees`);
      }
    } catch (error) {
      console.error(`Error processing employee ${employeeId}:`, error);
      results.push({
        employee_id: employeeId,
        error: error.message
      });
    }
  }

  const totalEvents = results.reduce((sum, r) => sum + (r.events_processed || 0), 0);
  const totalCompleted = results.reduce((sum, r) => sum + (r.events_completed || 0), 0);

  return {
    employees_processed: uniqueEmployees.length,
    total_events: totalEvents,
    total_completed: totalCompleted,
    success_rate: totalEvents > 0 ? ((totalCompleted / totalEvents) * 100).toFixed(1) + '%' : '0%',
    results: results
  };
}

async function backfillAllTimelineStates(supabase: any, batchSize: number, dryRun: boolean) {
  console.log('Starting backfill of all timeline states');

  // Log completion run
  const runId = crypto.randomUUID();

  const { data: logEntry } = await supabase
    .from('employes_state_completion_log')
    .insert({
      employee_id: '00000000-0000-0000-0000-000000000000', // Special ID for batch runs
      completion_run_id: runId,
      status: 'running'
    })
    .select()
    .single();

  try {
    const result = await completeAllEmployeeStates(supabase, batchSize, dryRun);

    // Update completion log
    await supabase
      .from('employes_state_completion_log')
      .update({
        events_processed: result.total_events,
        events_completed: result.total_completed,
        completed_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', logEntry.id);

    return {
      ...result,
      completion_run_id: runId,
      log_entry_id: logEntry.id
    };

  } catch (error) {
    // Update completion log with error
    await supabase
      .from('employes_state_completion_log')
      .update({
        completion_errors: [{ error: error.message, timestamp: new Date().toISOString() }],
        completed_at: new Date().toISOString(),
        status: 'failed'
      })
      .eq('id', logEntry.id);

    throw error;
  }
}

async function completeEventState(supabase: any, eventId: string, dryRun: boolean) {
  console.log(`Processing single event: ${eventId}`);

  const { data: event, error } = await supabase
    .from('employes_timeline_v2')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) throw error;

  // Get previous complete state
  const { data: previousEvents } = await supabase
    .from('employes_timeline_v2')
    .select('*')
    .eq('employee_id', event.employee_id)
    .lt('event_date', event.event_date)
    .order('event_date', { ascending: false })
    .limit(1);

  const previousState = previousEvents && previousEvents.length > 0 ? previousEvents[0] : null;

  const completeState = await buildCompleteState(supabase, event, previousState);

  if (!dryRun) {
    await updateEventWithCompleteState(supabase, eventId, completeState);
  }

  return {
    event_id: eventId,
    employee_id: event.employee_id,
    event_date: event.event_date,
    fields_completed: Object.keys(completeState).filter(key => completeState[key] != null).length,
    fields_changed: completeState.fields_changed || [],
    complete_state: completeState,
    dry_run: dryRun
  };
}