import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gjlgaufihseaagzmidhc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySyncSuccess() {
  console.log('🔍 Verifying sync success...\n');

  // 1. Check last sync session
  const { data: lastSession } = await supabase
    .from('employes_sync_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  console.log('📊 Last Sync Session:');
  console.log('  Status:', lastSession?.status);
  console.log('  Started:', lastSession?.started_at);
  console.log('  Completed:', lastSession?.completed_at);
  console.log('  Total Records:', lastSession?.total_records);
  console.log('  Successful:', lastSession?.successful_records);
  console.log('  Failed:', lastSession?.failed_records);
  console.log('  Source:', lastSession?.source);
  console.log('  Details:', JSON.stringify(lastSession?.sync_details, null, 2));

  // 2. Check total employees synced
  const { data: employees } = await supabase
    .from('employes_raw_data')
    .select('employee_id')
    .eq('is_latest', true)
    .eq('endpoint', '/employee');

  const uniqueEmployees = new Set(employees?.map(e => e.employee_id) || []);
  console.log('\n👥 Employees Synced:', uniqueEmployees.size);

  // 3. Check if Adela's birthday is now available
  const { data: adelaData } = await supabase
    .from('employes_raw_data')
    .select('api_response')
    .eq('employee_id', 'b1bc1ed8-79f3-4f45-9790-2a16953879a1')
    .eq('is_latest', true)
    .eq('endpoint', '/employee')
    .single();

  if (adelaData) {
    const response = adelaData.api_response;
    console.log('\n🎂 Adéla Birthday Data:');
    console.log('  date_of_birth:', response.date_of_birth);
    console.log('  country_code:', response.country_code);
    console.log('  phone_number:', response.phone_number);
    console.log('  email:', response.email);
  }

  // 4. Check recent changes
  const { count: changesCount } = await supabase
    .from('employes_changes')
    .select('*', { count: 'exact', head: true })
    .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  console.log('\n📋 Recent Changes (24h):', changesCount || 0);

  console.log('\n✅ Verification complete!');
}

verifySyncSuccess().catch(console.error);
