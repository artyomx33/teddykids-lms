-- =====================================================
-- APPLY REVIEW SYSTEM MIGRATIONS
-- =====================================================
-- This script combines both migrations for easy manual execution
-- in the Supabase SQL Editor if needed
-- 
-- Project ID: gjlgaufihseaagzmidhc
-- Run this in: Supabase Dashboard > SQL Editor
-- 
-- Date: 2025-10-16
-- Purpose: Fix Reviews System Schema + Seed Templates
-- =====================================================

\echo '=== STARTING REVIEW SYSTEM MIGRATIONS ==='
\echo ''
\echo 'Migration 1: Fix Reviews System Schema'
\echo ''

-- Include the schema fix migration
\ir supabase/migrations/20251016000000_fix_reviews_system_schema.sql

\echo ''
\echo 'Migration 2: Seed Review Templates'
\echo ''

-- Include the seed data migration
\ir supabase/migrations/20251016000001_seed_review_templates.sql

\echo ''
\echo '=== MIGRATIONS COMPLETE ==='
\echo ''
\echo 'Run these verification queries to confirm:'
\echo ''
\echo 'SELECT COUNT(*) FROM review_templates;  -- Should return 6'
\echo 'SELECT type, name FROM review_templates ORDER BY type;'
\echo ''
\echo 'SELECT column_name FROM information_schema.columns'
\echo 'WHERE table_name = ''staff_reviews'' AND column_name IN (''star_rating'', ''performance_level'', ''summary'');'
\echo ''
\echo 'SELECT table_name FROM information_schema.tables'
\echo 'WHERE table_schema = ''public'' AND table_name = ''review_schedules'';'

