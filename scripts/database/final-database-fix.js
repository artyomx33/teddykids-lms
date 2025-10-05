#!/usr/bin/env node

// FINAL DATABASE FIX - Create the missing view that the app expects
const SUPABASE_URL = "https://gjlgaufihseaagzmidhc.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q";

async function executeSQL(sql, description) {
  console.log(`\n🔧 ${description}...`);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ query: sql })
    });

    const result = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${result}`);

    return response.ok;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function fixDatabase() {
  console.log('🎯 Starting FINAL database fix...\n');
  console.log('🎯 Creating the exact view that the app components expect...\n');

  // The exact SQL from our migration file
  const createViewSQL = `
    CREATE OR REPLACE VIEW public.staff_docs_missing_counts AS
    SELECT
      s.id as staff_id,
      s.full_name,
      COUNT(*) FILTER (WHERE d.id IS NULL OR d.file_path IS NULL) as missing_count,
      COUNT(expected_docs.doc_type) as total_expected,
      ARRAY_AGG(expected_docs.doc_type) FILTER (WHERE d.id IS NULL) as missing_doc_types
    FROM staff s
    CROSS JOIN (VALUES ('contract'), ('id_copy'), ('diploma'), ('certificate')) as expected_docs(doc_type)
    LEFT JOIN documents d ON s.id = d.staff_id AND d.doc_type = expected_docs.doc_type
    GROUP BY s.id, s.full_name;
  `;

  const grantPermissionsSQL = `
    GRANT SELECT ON public.staff_docs_missing_counts TO authenticated;
    GRANT SELECT ON public.staff_docs_missing_counts TO anon;
  `;

  // Execute the fix
  const viewCreated = await executeSQL(createViewSQL, 'Creating staff_docs_missing_counts view');
  const permissionsGranted = await executeSQL(grantPermissionsSQL, 'Granting permissions');

  if (viewCreated && permissionsGranted) {
    console.log('\n✅ DATABASE FIX COMPLETE!');
    console.log('🎯 The app should now work without 400/406 errors!');
  } else {
    console.log('\n❌ Database fix failed. Check the logs above.');
  }

  // Test the view
  console.log('\n🧪 Testing the view...');
  try {
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/staff_docs_missing_counts?select=*&limit=1`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    });

    const testResult = await testResponse.json();
    console.log('Test result:', JSON.stringify(testResult, null, 2));
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the fix
fixDatabase().catch(console.error);