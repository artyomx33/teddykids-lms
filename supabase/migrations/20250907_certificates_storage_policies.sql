-- Ensure certificates bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Create public read policy for certificates bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='certificates_public_read'
  ) THEN
    CREATE POLICY "certificates_public_read" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'certificates');
  END IF;
END $$;

-- Create authenticated insert policy for certificates bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='certificates_auth_insert'
  ) THEN
    CREATE POLICY "certificates_auth_insert" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
      bucket_id = 'certificates' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Create authenticated update policy for certificates bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='certificates_auth_update'
  ) THEN
    CREATE POLICY "certificates_auth_update" 
    ON storage.objects 
    FOR UPDATE 
    USING (
      bucket_id = 'certificates' 
      AND auth.role() = 'authenticated'
    )
    WITH CHECK (
      bucket_id = 'certificates' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Add comment explaining purpose
COMMENT ON TABLE storage.objects IS 'Storage objects with public read access for certificates bucket';
