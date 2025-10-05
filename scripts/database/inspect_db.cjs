// Simple script to inspect what exists in our database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gjlgaufihseaagzmidhc.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTAwNDMsImV4cCI6MjA3MjM2NjA0M30.sa5p979OT0HN36KsCKabyQ-wB8nrtG-IjE9MsobdBh8';

const supabase = createClient(supabaseUrl, anonKey);

async function inspectDatabase() {
  console.log('🔍 Inspecting database state...\n');

  // Test what tables exist by trying to access them
  const tables = [
    'staff_reviews',
    'review_templates',
    'review_schedules',
    'review_notes',
    'performance_metrics',
    'staff_review_summary'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS (${data.length} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR - ${err.message}`);
    }
  }

  // Try to get staff_reviews schema by inserting empty record (will fail with column info)
  console.log('\n🔍 Checking staff_reviews columns...');
  try {
    const { data, error } = await supabase
      .from('staff_reviews')
      .insert({})
      .select();
    console.log('Insert result:', { data, error });
  } catch (err) {
    console.log('Insert error:', err.message);
  }
}

inspectDatabase();