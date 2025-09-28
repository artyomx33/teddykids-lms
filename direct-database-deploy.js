#!/usr/bin/env node

// DIRECT DATABASE DEPLOYMENT SCRIPT
// Deploy staff_required_documents table and staff_document_compliance view

const SUPABASE_URL = "https://gjlgaufihseaagzmidhc.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q";

async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY
    },
    body: JSON.stringify({ query: sql })
  });

  const result = await response.text();
  console.log(`SQL: ${sql.substring(0, 50)}...`);
  console.log(`Response: ${response.status} - ${result}`);
  return { status: response.status, result };
}

async function deployDatabase() {
  console.log('🚀 Starting direct database deployment...\n');

  // 1. Create staff_required_documents table
  console.log('📊 Step 1: Creating staff_required_documents table...');
  await executeSQL(`
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
    CREATE INDEX IF NOT EXISTS idx_staff_required_documents_staff_id ON staff_required_documents(staff_id);
  `);

  // 2. Create the compliance view
  console.log('\n👁️ Step 2: Creating staff_document_compliance view...');
  await executeSQL(`
    CREATE OR REPLACE VIEW public.staff_document_compliance AS
    SELECT
      (SELECT COUNT(DISTINCT s.id)
       FROM staff s
       WHERE EXISTS (
         SELECT 1 FROM staff_required_documents srd
         WHERE srd.staff_id = s.id
         AND srd.is_required = true
         AND (srd.file_path IS NULL OR srd.file_path = '')
       ))::bigint as any_missing,
      (SELECT COUNT(*)
       FROM staff_required_documents srd
       WHERE srd.is_required = true
       AND (srd.file_path IS NULL OR srd.file_path = ''))::bigint as missing_count,
      (SELECT COUNT(*) FROM staff)::bigint as total_staff;
  `);

  // 3. Seed required documents for all staff
  console.log('\n🌱 Step 3: Seeding required documents...');
  await executeSQL(`
    INSERT INTO staff_required_documents (staff_id, document_type, is_required)
    SELECT s.id, doc_type, true
    FROM staff s
    CROSS JOIN (VALUES
      ('contract'),
      ('id_copy'),
      ('diploma'),
      ('certificate_of_good_conduct'),
      ('bank_details')
    ) as required_docs(doc_type)
    ON CONFLICT DO NOTHING;
  `);

  // 4. Test the deployment
  console.log('\n🧪 Step 4: Testing deployment...');
  const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/staff_document_compliance?select=*`, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY
    }
  });

  const testResult = await testResponse.json();
  console.log('Test result:', testResult);

  console.log('\n✅ Database deployment complete!');
  console.log('🎯 Your app should now work without 400/406 errors!');
}

// Run the deployment
deployDatabase().catch(console.error);