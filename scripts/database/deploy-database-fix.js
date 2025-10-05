// INSTANT DATABASE DEPLOYMENT SCRIPT
// Run with: node deploy-database-fix.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gjlgaufihseaagzmidhc.supabase.co';
// You'll need to get the service role key from Supabase Dashboard > Settings > API
const SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key-here';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deployDatabaseFix() {
  console.log('🚀 Starting database deployment...');

  try {
    // Step 1: Create staff_required_documents table
    console.log('📊 Creating staff_required_documents table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS staff_required_documents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
          document_type TEXT NOT NULL,
          file_path TEXT,
          uploaded_at TIMESTAMP WITH TIME ZONE,
          is_required BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_staff_required_documents_staff_id
        ON staff_required_documents(staff_id);
      `
    });

    if (tableError) {
      console.error('❌ Table creation failed:', tableError);
      return;
    }

    // Step 2: Create the correct view
    console.log('👁️ Creating staff_document_compliance view...');
    const { error: viewError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE OR REPLACE VIEW public.staff_document_compliance AS
        SELECT
          (
            SELECT COUNT(DISTINCT s.id)
            FROM staff s
            WHERE EXISTS (
              SELECT 1
              FROM staff_required_documents srd
              WHERE srd.staff_id = s.id
              AND srd.is_required = true
              AND (srd.file_path IS NULL OR srd.file_path = '')
            )
          )::bigint as any_missing,
          (
            SELECT COUNT(*)
            FROM staff_required_documents srd
            WHERE srd.is_required = true
            AND (srd.file_path IS NULL OR srd.file_path = '')
          )::bigint as missing_count,
          (SELECT COUNT(*) FROM staff)::bigint as total_staff;
      `
    });

    if (viewError) {
      console.error('❌ View creation failed:', viewError);
      return;
    }

    // Step 3: Seed required documents
    console.log('🌱 Seeding required documents...');
    const { error: seedError } = await supabase.rpc('exec_sql', {
      query: `
        INSERT INTO staff_required_documents (staff_id, document_type, is_required)
        SELECT s.id, doc_type, true
        FROM staff s
        CROSS JOIN (VALUES ('contract'), ('id_copy'), ('diploma'), ('certificate_of_good_conduct'), ('bank_details')) as required_docs(doc_type)
        ON CONFLICT DO NOTHING;
      `
    });

    if (seedError) {
      console.error('❌ Seeding failed:', seedError);
      return;
    }

    // Step 4: Test the result
    console.log('🧪 Testing the deployment...');
    const { data: testData, error: testError } = await supabase
      .from('staff_document_compliance')
      .select('*')
      .single();

    if (testError) {
      console.error('❌ Test failed:', testError);
      return;
    }

    console.log('✅ SUCCESS! Database deployment complete!');
    console.log('📊 Results:', testData);
    console.log('🎯 Components should now work without 400/406 errors!');

  } catch (error) {
    console.error('💥 Deployment failed:', error);
  }
}

deployDatabaseFix();