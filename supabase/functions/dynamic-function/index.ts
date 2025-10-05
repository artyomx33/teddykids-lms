// ╔════════════════════════════════════════════════════════════════════╗
// ║  EMPLOYES CHANGE DETECTOR v2.0                                     ║
// ║  Parses /employments arrays and detects salary/hours/contract     ║
// ║  changes across time periods                                       ║
// ╚════════════════════════════════════════════════════════════════════╝

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface SyncResult {
  total_employees: number;
  total_changes: number;
  salary_changes: number;
  hours_changes: number;
  contract_changes: number;
  errors: Array<{ employee_id: string; error: string }>;
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
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════

serve(async (req: Request) => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 CHANGE DETECTOR v2.0 STARTED');
    
    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = getServiceRoleKey();
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const { mode = 'full', employeeIds = null } = await req.json().catch(() => ({}));
    
    console.log('Mode: ' + mode);
    console.log('Employees: ' + (employeeIds ? employeeIds.length : 'ALL'));
    
    // Get all /employments records
    let query = supabase
      .from('employes_raw_data')
      .select('*')
      .eq('endpoint', '/employments')
      .eq('is_latest', true);
    
    if (employeeIds && employeeIds.length > 0) {
      query = query.in('employee_id', employeeIds);
    }
    
    const { data: employmentsRecords, error: fetchError } = await query;
    
    if (fetchError) {
      throw new Error('Failed to fetch employments: ' + fetchError.message);
    }
    
    console.log('📊 Found ' + (employmentsRecords?.length || 0) + ' employment records');
    
    const result: SyncResult = {
      total_employees: employmentsRecords?.length || 0,
      total_changes: 0,
      salary_changes: 0,
      hours_changes: 0,
      contract_changes: 0,
      errors: []
    };
    
    // Process each employee's employment history
    for (const record of (employmentsRecords || [])) {
      try {
        const employeeId = record.employee_id;
        const apiResponse = record.api_response;
        const rawDataId = record.id;
        
        console.log('Processing: ' + employeeId);
        
        // Parse salary changes
        if (apiResponse.salary && Array.isArray(apiResponse.salary)) {
          const salaryChanges = parseSalaryChanges(employeeId, apiResponse.salary, rawDataId);
          for (const change of salaryChanges) {
            await insertChange(supabase, change);
            result.salary_changes++;
            result.total_changes++;
          }
        }
        
        // Parse hours changes
        if (apiResponse.hours && Array.isArray(apiResponse.hours)) {
          const hoursChanges = parseHoursChanges(employeeId, apiResponse.hours, rawDataId);
          for (const change of hoursChanges) {
            await insertChange(supabase, change);
            result.hours_changes++;
            result.total_changes++;
          }
        }
        
        // Parse contract changes
        if (apiResponse.contracts && Array.isArray(apiResponse.contracts)) {
          const contractChanges = parseContractChanges(employeeId, apiResponse.contracts, rawDataId);
          for (const change of contractChanges) {
            await insertChange(supabase, change);
            result.contract_changes++;
            result.total_changes++;
          }
        }
        
      } catch (error: any) {
        console.error('Error processing ' + record.employee_id + ':', error);
        result.errors.push({
          employee_id: record.employee_id,
          error: error.message
        });
      }
    }
    
    console.log('✅ CHANGE DETECTION COMPLETE');
    console.log('Total employees: ' + result.total_employees);
    console.log('Total changes: ' + result.total_changes);
    console.log('  - Salary: ' + result.salary_changes);
    console.log('  - Hours: ' + result.hours_changes);
    console.log('  - Contract: ' + result.contract_changes);
    console.log('Duration: ' + (Date.now() - startTime) + 'ms');
    
    return new Response(
      JSON.stringify({
        success: true,
        result: result,
        duration_ms: Date.now() - startTime
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('❌ CHANGE DETECTION FAILED:', error);
    
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
// CHANGE PARSERS
// ═══════════════════════════════════════════════════════════════════

function parseSalaryChanges(employeeId: string, salaryArray: any[], rawDataId: string): any[] {
  const changes: any[] = [];
  
  // Sort by start_date
  const sorted = salaryArray
    .filter(s => s.start_date)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  
  // Create a change record for each salary period (comparing to previous)
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    
    const oldWage = prev.month_wage || prev.hour_wage || 0;
    const newWage = curr.month_wage || curr.hour_wage || 0;
    const changeAmount = newWage - oldWage;
    const changePercent = oldWage > 0 ? (changeAmount / oldWage) * 100 : 0;
    
    changes.push({
      employee_id: employeeId,
      change_type: 'salary_change',
      field_name: curr.month_wage ? 'month_wage' : 'hour_wage',
      effective_date: curr.start_date,
      old_value: oldWage,
      new_value: newWage,
      change_amount: changeAmount,
      change_percent: changePercent,
      confidence_score: 1.0,
      business_impact: changeAmount > 0 ? 'salary_increase' : 'salary_decrease',
      metadata: {
        old_hourly: prev.hour_wage,
        new_hourly: curr.hour_wage,
        old_monthly: prev.month_wage,
        new_monthly: curr.month_wage,
        old_yearly: prev.yearly_wage,
        new_yearly: curr.yearly_wage,
        period_start: curr.start_date,
        period_end: curr.end_date || null
      }
    });
  }
  
  return changes;
}

function parseHoursChanges(employeeId: string, hoursArray: any[], rawDataId: string): any[] {
  const changes: any[] = [];
  
  // Sort by start_date
  const sorted = hoursArray
    .filter(h => h.start_date)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  
  // Create a change record for each hours period (comparing to previous)
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    
    const oldHours = prev.hours_per_week || 0;
    const newHours = curr.hours_per_week || 0;
    const changeAmount = newHours - oldHours;
    const changePercent = oldHours > 0 ? (changeAmount / oldHours) * 100 : 0;
    
    changes.push({
      employee_id: employeeId,
      change_type: 'hours_change',
      field_name: 'hours_per_week',
      effective_date: curr.start_date,
      old_value: oldHours,
      new_value: newHours,
      change_amount: changeAmount,
      change_percent: changePercent,
      confidence_score: 1.0,
      business_impact: changeAmount > 0 ? 'hours_increase' : 'hours_decrease',
      metadata: {
        old_hours: prev.hours_per_week,
        new_hours: curr.hours_per_week,
        old_days: prev.days_per_week,
        new_days: curr.days_per_week,
        old_type: prev.employee_type,
        new_type: curr.employee_type,
        period_start: curr.start_date,
        period_end: curr.end_date || null
      }
    });
  }
  
  return changes;
}

function parseContractChanges(employeeId: string, contractsArray: any[], rawDataId: string): any[] {
  const changes: any[] = [];
  
  // Sort by start_date
  const sorted = contractsArray
    .filter(c => c.start_date)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  
  // Create a change record for each contract period (comparing to previous)
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    
    const oldType = prev.contract_duration || 'unknown';
    const newType = curr.contract_duration || 'unknown';
    
    // Only create change if contract type actually changed
    if (oldType !== newType) {
      changes.push({
        employee_id: employeeId,
        change_type: 'contract_change',
        field_name: 'contract_duration',
        effective_date: curr.start_date,
        old_value: oldType,
        new_value: newType,
        change_amount: null,
        change_percent: null,
        confidence_score: 1.0,
        business_impact: newType === 'permanent' ? 'permanent_contract' : 'contract_renewal',
        metadata: {
          old_contract_type: oldType,
          new_contract_type: newType,
          old_start: prev.start_date,
          new_start: curr.start_date,
          old_end: prev.end_date || null,
          new_end: curr.end_date || null,
          is_signed: curr.is_signed || false,
          sign_date: curr.sign_date || null
        }
      });
    }
  }
  
  return changes;
}

// ═══════════════════════════════════════════════════════════════════
// DATABASE OPERATIONS
// ═══════════════════════════════════════════════════════════════════

async function insertChange(supabase: any, change: any): Promise<void> {
  const { error } = await supabase
    .from('employes_changes')
    .insert(change);
  
  if (error) {
    console.error('Failed to insert change:', error.message);
    throw error;
  }
}