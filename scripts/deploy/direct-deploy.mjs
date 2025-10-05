// DIRECT DATABASE DEPLOYMENT - No more copy/paste!
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gjlgaufihseaagzmidhc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🚀 Starting DIRECT database deployment...');

try {
  console.log('📊 Step 1: Creating staff_required_documents table...');

  const createTableResult = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY
    },
    body: JSON.stringify({
      sql: `
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
    })
  });

  console.log('Table creation response:', await createTableResult.text());

  console.log('👁️ Step 2: Creating staff_document_compliance view...');

  const createViewResult = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY
    },
    body: JSON.stringify({
      sql: `
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
    })
  });

  console.log('View creation response:', await createViewResult.text());

  console.log('🌱 Step 3: Seeding required documents...');

  const seedResult = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY
    },
    body: JSON.stringify({
      sql: `
        INSERT INTO staff_required_documents (staff_id, document_type, is_required)
        SELECT s.id, doc_type, true
        FROM staff s
        CROSS JOIN (VALUES ('contract'), ('id_copy'), ('diploma'), ('certificate_of_good_conduct'), ('bank_details')) as required_docs(doc_type)
        ON CONFLICT DO NOTHING;
      `
    })
  });

  console.log('Seeding response:', await seedResult.text());

  console.log('🧪 Step 4: Testing the deployment...');

  const { data: testData, error: testError } = await supabase
    .from('staff_document_compliance')
    .select('*')
    .single();

  if (testError) {
    console.error('❌ Test failed:', testError);
  } else {
    console.log('✅ SUCCESS! Database deployment complete!');
    console.log('📊 Results:', testData);
    console.log('🎯 Components should now work without 400/406 errors!');
  }

} catch (error) {
  console.error('💥 Deployment failed:', error);
}

console.log('🏁 Deployment script finished.');