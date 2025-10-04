-- Phase 1: Enhance staff table for Employes integration
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS manager_id uuid,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS employment_status text,
ADD COLUMN IF NOT EXISTS salary_amount numeric,
ADD COLUMN IF NOT EXISTS working_hours_per_week numeric,
ADD COLUMN IF NOT EXISTS employment_start_date date,
ADD COLUMN IF NOT EXISTS employment_end_date date;

-- Create employment history tracking table
CREATE TABLE IF NOT EXISTS public.staff_employment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES public.staff(id) NOT NULL,
  employes_employee_id text,
  change_type text NOT NULL, -- 'hire', 'promotion', 'role_change', 'termination', 'salary_change'
  previous_data jsonb,
  new_data jsonb,
  effective_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- Create staff conflicts table for sync discrepancies
CREATE TABLE IF NOT EXISTS public.staff_sync_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES public.staff(id),
  employes_employee_id text NOT NULL,
  conflict_type text NOT NULL, -- 'name_mismatch', 'email_mismatch', 'duplicate_match', 'data_conflict'
  lms_data jsonb,
  employes_data jsonb,
  resolution_status text DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.staff_employment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_sync_conflicts ENABLE ROW LEVEL SECURITY;

-- RLS policies for employment history
CREATE POLICY "Managers can view employment history of their staff"
ON public.staff_employment_history
FOR SELECT
USING (
  staff_id IN (
    SELECT managers.staff_id 
    FROM managers 
    WHERE managers.user_id = auth.uid()
  ) OR is_admin()
);

CREATE POLICY "Admins can manage employment history"
ON public.staff_employment_history
FOR ALL
USING (is_admin());

-- RLS policies for sync conflicts
CREATE POLICY "Managers can view sync conflicts of their staff"
ON public.staff_sync_conflicts
FOR SELECT
USING (
  staff_id IN (
    SELECT managers.staff_id 
    FROM managers 
    WHERE managers.user_id = auth.uid()
  ) OR is_admin()
);

CREATE POLICY "Admins can manage sync conflicts"
ON public.staff_sync_conflicts
FOR ALL
USING (is_admin());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_employes_id ON public.staff(employes_id);
CREATE INDEX IF NOT EXISTS idx_staff_employment_history_staff_id ON public.staff_employment_history(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_sync_conflicts_staff_id ON public.staff_sync_conflicts(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_sync_conflicts_employes_id ON public.staff_sync_conflicts(employes_employee_id);