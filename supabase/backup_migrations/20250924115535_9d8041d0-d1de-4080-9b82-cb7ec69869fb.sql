-- Add missing columns to staff table to store Employes employee data
ALTER TABLE public.staff 
ADD COLUMN employes_id text,
ADD COLUMN phone_number text,
ADD COLUMN start_date date,
ADD COLUMN birth_date date,
ADD COLUMN employee_number integer,
ADD COLUMN hourly_wage decimal(10,2),
ADD COLUMN hours_per_week integer,
ADD COLUMN contract_type text,
ADD COLUMN zipcode text,
ADD COLUMN city text,
ADD COLUMN street_address text,
ADD COLUMN house_number text,
ADD COLUMN iban text,
ADD COLUMN last_sync_at timestamp with time zone;

-- Create index on employes_id for fast lookups during sync
CREATE INDEX idx_staff_employes_id ON public.staff(employes_id);

-- Create index on employee_number for fast lookups
CREATE INDEX idx_staff_employee_number ON public.staff(employee_number);