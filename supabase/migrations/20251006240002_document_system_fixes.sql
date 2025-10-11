-- =====================================================
-- Document System Fixes - Patch Migration
-- =====================================================
-- Purpose: Fix critical issues found in testing
-- Date: 2025-10-07
-- =====================================================

-- =====================================================
-- 1. ADD MISSING COLUMN
-- =====================================================

-- Add last_reminder_sent_at column for reminder tracking
ALTER TABLE staff_documents 
ADD COLUMN IF NOT EXISTS last_reminder_sent_at timestamptz;

COMMENT ON COLUMN staff_documents.last_reminder_sent_at IS 'Timestamp of when last reminder was sent for this document';

-- =====================================================
-- 2. FIX EXPIRY TRACKING FUNCTION
-- =====================================================

-- Fixed version: Keep is_current=true for expired docs (status change is enough)
-- This ensures expired docs remain visible in the UI
CREATE OR REPLACE FUNCTION check_document_expiry()
RETURNS void AS $$
BEGIN
  UPDATE staff_documents
  SET 
    status = 'expired',
    -- DON'T set is_current=false - keep it visible!
    updated_at = now()
  WHERE 
    status = 'uploaded' 
    AND is_current = true
    AND expires_at IS NOT NULL 
    AND expires_at <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_document_expiry() IS 'Marks expired documents but keeps them visible (is_current=true) until replaced';

-- =====================================================
-- 3. FIX DUPLICATE PREVENTION (Critical Bug)
-- =====================================================

-- Create unique partial index to prevent duplicate current documents
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_current_document 
ON staff_documents(staff_id, document_type_id) 
WHERE is_current = true;

COMMENT ON INDEX idx_unique_current_document IS 
  'Ensures only one current document per staff per document type';

-- =====================================================
-- 4. UPDATE SEED DATA (Fix duplicate prevention)
-- =====================================================

-- Recreate the initialization with proper conflict handling
CREATE OR REPLACE FUNCTION initialize_staff_required_documents(p_staff_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO staff_documents (staff_id, document_type_id, status, is_current)
  SELECT 
    p_staff_id,
    dt.id,
    'missing',
    true
  FROM document_types dt
  WHERE dt.is_required = true
  ON CONFLICT (staff_id, document_type_id) WHERE is_current = true DO NOTHING;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION initialize_staff_required_documents(uuid) IS 
  'Initializes required document placeholders for a staff member with proper upsert logic';


