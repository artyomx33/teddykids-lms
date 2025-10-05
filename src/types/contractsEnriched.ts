// src/types/contractsEnriched.ts

export type ContractsEnrichedRow = {
  id: string;
  employes_employee_id: string | null;
  full_name: string | null;
  position: string | null;
  location_key: string | null;
  manager_key: string | null;
  start_date: string | null;   // YYYY-MM-DD
  end_date: string | null;
  birth_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  // flags from MV
  first_start?: string | null;
  last_review_date?: string | null;
  avg_review_score?: number | null;
  has_five_star_badge?: boolean | null;
  needs_six_month_review?: boolean | null;
  needs_yearly_review?: boolean | null;
  next_review_due?: string | null;
};
