import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkJoinKeys() {
  try {
    console.log('--- Checking `staff` view (first 5) ---');
    const { data: staffList, error: staffError } = await supabase
      .from('staff')
      .select('id, employes_id, full_name')
      .limit(5);

    if (staffError) {
      console.error('Error fetching from staff view:', staffError.message);
    } else {
      console.table(staffList);
    }

    console.log('\n--- Checking `employes_current_state` view (first 5) ---');
    const { data: enrichedList, error: enrichedError } = await supabase
      .from('employes_current_state')
      .select('employee_id, full_name')
      .limit(5);

    if (enrichedError) {
      console.error('Error fetching from employes_current_state:', enrichedError.message);
    } else {
      console.table(enrichedList);
    }

  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
  }
}

checkJoinKeys();
