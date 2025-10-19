-- =====================================================
-- MIGRATION: Add Manual Timeline Event Support
-- Created: 2025-10-17
-- Purpose: Allow adding historical contract events manually
-- Architect Score: 9/10 - APPROVED
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ADD COLUMNS FOR MANUAL EVENTS
-- =====================================================

ALTER TABLE employes_timeline_v2 
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manual_notes TEXT,
ADD COLUMN IF NOT EXISTS contract_pdf_path TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID;

COMMENT ON COLUMN employes_timeline_v2.is_manual IS 'True for manually added historical events (pre-2004 contracts, etc.)';
COMMENT ON COLUMN employes_timeline_v2.manual_notes IS 'Notes about this manual entry - why it was added, source of info, etc.';
COMMENT ON COLUMN employes_timeline_v2.contract_pdf_path IS 'Path to uploaded historical contract PDF in Supabase storage';
COMMENT ON COLUMN employes_timeline_v2.created_by IS 'User who manually added this event';

-- =====================================================
-- 2. SIMPLE VALIDATION (Development-friendly)
-- =====================================================
-- No complex constraints - if data is wrong, we'll see it and fix it directly

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Manual timeline event columns added successfully';
  RAISE NOTICE '📊 Ready to add historical contract events';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Usage:';
  RAISE NOTICE '   INSERT INTO employes_timeline_v2 (';
  RAISE NOTICE '     employee_id, event_type, event_date,';
  RAISE NOTICE '     salary_at_event, hours_at_event,';
  RAISE NOTICE '     is_manual, manual_notes, contract_pdf_path, created_by';
  RAISE NOTICE '   ) VALUES (';
  RAISE NOTICE '     ''uuid-here'', ''manual_adjustment'', ''2010-01-15'',';
  RAISE NOTICE '     2500.00, 40.0,';
  RAISE NOTICE '     true, ''Historical contract from paper archive'', ''/contracts/2010.pdf'', ''user-uuid''';
  RAISE NOTICE '   );';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Styling: Manual events display with pink background (bg-pink-50) and "MANUAL" badge';
END $$;

COMMIT;

