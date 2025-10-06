-- =====================================================
-- Document Storage Setup
-- =====================================================
-- Creates storage bucket and policies for staff documents
-- =====================================================

-- =====================================================
-- 1. CREATE STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staff-documents',
  'staff-documents',
  false, -- Private bucket
  10485760, -- 10MB file size limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- 2. STORAGE POLICIES
-- =====================================================

-- Simplified storage policies - Application-level security handles staff-specific access
-- Authenticated users can upload documents
CREATE POLICY "Authenticated can upload staff documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'staff-documents'
  );

-- Authenticated users can view documents
CREATE POLICY "Authenticated can view staff documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'staff-documents'
  );

-- Authenticated users can delete documents
CREATE POLICY "Authenticated can delete staff documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'staff-documents'
  );

-- Authenticated users can update documents
CREATE POLICY "Authenticated can update staff documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'staff-documents'
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Authenticated can upload staff documents" ON storage.objects IS 
  'Authenticated users can upload documents to staff-documents bucket';

COMMENT ON POLICY "Authenticated can view staff documents" ON storage.objects IS 
  'Authenticated users can view documents in staff-documents bucket';

