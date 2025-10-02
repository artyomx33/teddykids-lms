import { supabase } from "@/integrations/supabase/client";

export interface EmploymentHistoryEvent {
  id: string;
  staff_id: string;
  change_type: string;
  effective_date: string;
  previous_data: any;
  new_data: any;
  created_at: string;
  employes_employee_id?: string;
}

export interface SalaryHistoryEvent {
  id: string;
  staff_id: string;
  scale?: string;
  trede?: string;
  gross_monthly: number;
  hourly_wage?: number;
  hours_per_week: number;
  yearly_wage?: number;
  cao_effective_date: string;
  valid_from: string;
  valid_to?: string;
  data_source?: string;
  employes_employee_id?: string;
}

export async function fetchEmploymentHistory(staffId: string) {
  const { data, error } = await supabase
    .from('staff_employment_history')
    .select('*')
    .eq('staff_id', staffId)
    .order('effective_date', { ascending: false });

  if (error) {
    console.error('Error fetching employment history:', error);
    return [];
  }

  return data as EmploymentHistoryEvent[];
}

export async function fetchSalaryHistory(staffId: string) {
  const { data, error } = await supabase
    .from('cao_salary_history')
    .select('*')
    .eq('staff_id', staffId)
    .order('valid_from', { ascending: false });

  if (error) {
    console.error('Error fetching salary history:', error);
    return [];
  }

  return data as SalaryHistoryEvent[];
}
