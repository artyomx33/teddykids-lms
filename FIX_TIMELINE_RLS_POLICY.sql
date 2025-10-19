-- =====================================================
-- FIX: Add RLS Policy for Manual Timeline Events
-- =====================================================
-- Issue: employes_timeline_v2 has RLS enabled but no insert policy
-- Solution: Add policy to allow authenticated users to insert manual events

BEGIN;

-- Option 1: Add INSERT policy for authenticated users (RECOMMENDED FOR DEVELOPMENT)
CREATE POLICY "Allow authenticated users to insert manual timeline events"
ON employes_timeline_v2
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Option 2: Also add SELECT policy if needed (for reading manual events)
CREATE POLICY "Allow authenticated users to read timeline events"
ON employes_timeline_v2
FOR SELECT
TO authenticated
USING (true);

-- Option 3: Add UPDATE policy (for future editing)
CREATE POLICY "Allow authenticated users to update manual timeline events"
ON employes_timeline_v2
FOR UPDATE
TO authenticated
USING (is_manual = true)
WITH CHECK (is_manual = true);

COMMIT;

-- Verification
DO $$ 
BEGIN
  RAISE NOTICE '✅ RLS policies added for employes_timeline_v2';
  RAISE NOTICE '📋 Users can now insert, read, and update manual timeline events';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test by adding a manual timeline event again';
END $$;

