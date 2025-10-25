const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function debugIdMismatch() {
  try {
    console.log('Running diagnostic query...');
    
    const { data, error } = await supabase
      .from('staff')
      .select(`
        id (staff_uuid),
        employes_id (staff_employes_id),
        full_name,
        employes_current_state:employes_current_state (
          employee_id (current_state_employee_id),
          full_name (current_state_name)
        )
      `)
      .eq('employes_current_state.employee_id', 'employes_id')  // This simulates the join
      .limit(10);

    if (error) {
      console.error('Query error:', error.message);
      return;
    }

    console.log('\nQuery Results (first 10):');
    console.table(data.map(row => ({
      staff_uuid: row.staff_uuid,
      staff_employes_id: row.staff_employes_id,
      full_name: row.full_name,
      current_state_employee_id: row.employes_current_state?.[0]?.current_state_employee_id || 'NO MATCH',
      current_state_name: row.employes_current_state?.[0]?.current_state_name || 'NO MATCH'
    })));

    // Count mismatches
    const mismatches = data.filter(row => !row.employes_current_state || row.employes_current_state.length === 0).length;
    console.log(`\nTotal rows checked: ${data.length}`);
    console.log(`Mismatches found: ${mismatches}`);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

debugIdMismatch();
