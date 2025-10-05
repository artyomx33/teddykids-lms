-- =====================================================
-- Allow authenticated users to read timeline and changes
-- Created: 2025-10-06
-- Purpose: Fix UI access to timeline data
-- =====================================================

BEGIN;

-- Drop the service-role-only policies and create user-friendly ones
DROP POLICY IF EXISTS "Service role full access on changes" ON employes_changes;
DROP POLICY IF EXISTS "Service role full access on timeline" ON employes_timeline_v2;

-- Allow authenticated users to SELECT (read)
CREATE POLICY "Authenticated users can read changes" 
  ON employes_changes 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read timeline" 
  ON employes_timeline_v2 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow service role to do everything
CREATE POLICY "Service role can do everything on changes" 
  ON employes_changes 
  FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on timeline" 
  ON employes_timeline_v2 
  FOR ALL 
  USING (auth.role() = 'service_role');

COMMIT;
