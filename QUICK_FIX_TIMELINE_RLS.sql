-- =====================================================
-- QUICK FIX: Timeline RLS Policy
-- Run this NOW to fix the manual timeline event error
-- =====================================================

-- Add INSERT policy for manual timeline events
CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert manual timeline events"
ON employes_timeline_v2
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add SELECT policy (in case it's missing)
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read timeline events"
ON employes_timeline_v2
FOR SELECT
TO authenticated
USING (true);

-- Add UPDATE policy for manual events
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update manual timeline events"
ON employes_timeline_v2
FOR UPDATE
TO authenticated
USING (is_manual = true)
WITH CHECK (is_manual = true);

-- Success message
SELECT '✅ RLS policies added! Try adding manual event again.' as result;

