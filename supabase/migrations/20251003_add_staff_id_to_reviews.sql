-- Migration: Add legacy staff_id column to staff_reviews table
-- Date: 2025-10-03
-- Purpose: Add backward compatibility for staff_reviews table during transition
-- This allows both staff_id (current) and legacy_staff_id (legacy) to coexist

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Add legacy_staff_id column to staff_reviews table
-- Note: Using legacy_staff_id to avoid conflict with existing staff_id column
DO $$
BEGIN
  -- Check if the column doesn't already exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'staff_reviews'
    AND column_name = 'legacy_staff_id'
  ) THEN
    -- Add the legacy_staff_id column
    ALTER TABLE public.staff_reviews
    ADD COLUMN legacy_staff_id UUID;

    RAISE NOTICE 'Added legacy_staff_id column to staff_reviews table';
  ELSE
    RAISE NOTICE 'Column legacy_staff_id already exists in staff_reviews table';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error adding legacy_staff_id column: %', SQLERRM;
END $$;

-- Step 2: Create index for performance
DO $$
BEGIN
  -- Check if index doesn't already exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'staff_reviews'
    AND indexname = 'idx_staff_reviews_legacy_staff_id'
  ) THEN
    -- Create index on legacy_staff_id
    CREATE INDEX idx_staff_reviews_legacy_staff_id ON public.staff_reviews (legacy_staff_id);

    RAISE NOTICE 'Created index idx_staff_reviews_legacy_staff_id';
  ELSE
    RAISE NOTICE 'Index idx_staff_reviews_legacy_staff_id already exists';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating index on legacy_staff_id: %', SQLERRM;
END $$;

-- Step 3: Create staff_legacy table if it doesn't exist
-- This is a placeholder - adjust structure based on actual legacy staff table needs
DO $$
BEGIN
  -- Check if staff_legacy table exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'staff_legacy'
  ) THEN
    -- Create staff_legacy table as a basic structure
    -- Note: Adjust this structure based on your actual legacy staff data
    CREATE TABLE public.staff_legacy (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      full_name TEXT NOT NULL,
      email TEXT,
      employes_employee_id TEXT,
      legacy_employee_number TEXT,
      position TEXT,
      department TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),

      -- Add any other legacy staff fields as needed
      legacy_data JSONB DEFAULT '{}'
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_staff_legacy_employes_id ON public.staff_legacy (employes_employee_id);
    CREATE INDEX IF NOT EXISTS idx_staff_legacy_employee_number ON public.staff_legacy (legacy_employee_number);
    CREATE INDEX IF NOT EXISTS idx_staff_legacy_email ON public.staff_legacy (email);

    RAISE NOTICE 'Created staff_legacy table with basic structure';
  ELSE
    RAISE NOTICE 'Table staff_legacy already exists';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating staff_legacy table: %', SQLERRM;
END $$;

-- Step 4: Add foreign key constraint with CASCADE delete
DO $$
BEGIN
  -- Check if foreign key constraint doesn't already exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND table_name = 'staff_reviews'
    AND constraint_name = 'fk_staff_reviews_legacy_staff_id'
  ) THEN
    -- Add foreign key constraint to staff_legacy table
    ALTER TABLE public.staff_reviews
    ADD CONSTRAINT fk_staff_reviews_legacy_staff_id
    FOREIGN KEY (legacy_staff_id) REFERENCES public.staff_legacy(id) ON DELETE CASCADE;

    RAISE NOTICE 'Added foreign key constraint fk_staff_reviews_legacy_staff_id';
  ELSE
    RAISE NOTICE 'Foreign key constraint fk_staff_reviews_legacy_staff_id already exists';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error adding foreign key constraint: %', SQLERRM;
END $$;

-- Step 5: Add helpful comment for documentation
DO $$
BEGIN
  -- Add column comment
  COMMENT ON COLUMN public.staff_reviews.legacy_staff_id IS
    'Legacy staff ID for backward compatibility during transition. References staff_legacy.id. Can be NULL for new reviews.';

  RAISE NOTICE 'Added documentation comment for legacy_staff_id column';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Warning: Could not add column comment: %', SQLERRM;
END $$;

-- Step 6: Create a helper view for transition period
-- This view combines both current and legacy staff data for reviews
CREATE OR REPLACE VIEW public.staff_reviews_with_legacy AS
SELECT
  sr.*,
  s.full_name as current_staff_name,
  s.email as current_staff_email,
  sl.full_name as legacy_staff_name,
  sl.email as legacy_staff_email,
  sl.employes_employee_id,
  COALESCE(s.full_name, sl.full_name) as staff_name,
  COALESCE(s.email, sl.email) as staff_email
FROM public.staff_reviews sr
LEFT JOIN public.staff s ON sr.staff_id = s.id
LEFT JOIN public.staff_legacy sl ON sr.legacy_staff_id = sl.id;

-- Grant appropriate permissions
GRANT SELECT ON public.staff_reviews_with_legacy TO authenticated;

-- Add helpful comments
COMMENT ON VIEW public.staff_reviews_with_legacy IS
  'View that combines staff_reviews with both current staff and legacy staff data for transition period';

COMMENT ON TABLE public.staff_legacy IS
  'Legacy staff table for backward compatibility during system transition';

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully: Added legacy_staff_id column to staff_reviews table';
  RAISE NOTICE 'The following was created/verified:';
  RAISE NOTICE '  - legacy_staff_id column in staff_reviews';
  RAISE NOTICE '  - Index on legacy_staff_id';
  RAISE NOTICE '  - staff_legacy table (if not existed)';
  RAISE NOTICE '  - Foreign key constraint with CASCADE delete';
  RAISE NOTICE '  - Helper view staff_reviews_with_legacy';
END $$;