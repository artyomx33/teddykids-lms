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

-- Staff can upload to their own folder
CREATE POLICY "Staff can upload own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'staff-documents'
    AND (
      -- Extract staff_id from path: staff/{staff_id}/{document_type_code}.ext
      (storage.foldername(name))[1] = 'staff'
      AND (storage.foldername(name))[2] IN (
        SELECT id::text FROM staff WHERE user_id = auth.uid()
      )
    )
    OR
    -- Admins can upload for anyone
    EXISTS (
      SELECT 1 FROM staff 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Staff can view their own documents
CREATE POLICY "Staff can view own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'staff-documents'
    AND (
      (storage.foldername(name))[1] = 'staff'
      AND (storage.foldername(name))[2] IN (
        SELECT id::text FROM staff WHERE user_id = auth.uid()
      )
    )
    OR
    -- Admins can view all
    EXISTS (
      SELECT 1 FROM staff 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Staff can delete their own documents
CREATE POLICY "Staff can delete own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'staff-documents'
    AND (
      (storage.foldername(name))[1] = 'staff'
      AND (storage.foldername(name))[2] IN (
        SELECT id::text FROM staff WHERE user_id = auth.uid()
      )
    )
    OR
    -- Admins can delete any
    EXISTS (
      SELECT 1 FROM staff 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Staff can update their own documents (for replacing files)
CREATE POLICY "Staff can update own documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'staff-documents'
    AND (
      (storage.foldername(name))[1] = 'staff'
      AND (storage.foldername(name))[2] IN (
        SELECT id::text FROM staff WHERE user_id = auth.uid()
      )
    )
    OR
    -- Admins can update any
    EXISTS (
      SELECT 1 FROM staff 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Staff can upload own documents" ON storage.objects IS 
  'Staff can only upload to their own folder: staff/{their_staff_id}/, admins can upload anywhere';

COMMENT ON POLICY "Staff can view own documents" ON storage.objects IS 
  'Staff can only view files in their own folder, admins can view all';

