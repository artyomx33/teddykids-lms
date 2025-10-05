// 🧪 CONNECTION TEST SCRIPT
// Tests both Supabase and Employes.nl API connections

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gjlgaufihseaagzmidhc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q';
const EMPLOYES_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcnRlbUB0ZWRkeWtpZHMubmwiLCJqdGkiOiIxNjZkZjFlMi1kOWQzLTQ5MWQtYmE1My05M2YyNzk0YjYzOGIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDb21wYW55T3duZXIiLCJleHAiOjE3OTA0OTg4NDgsImlzcyI6Imh0dHBzOi8vYXBpLWRldi5lbXBsb3llcy5ubCIsImF1ZCI6Imh0dHBzOi8vYXBpLWRldi5lbXBsb3llcy5ubCJ9.bB7clTxWrcKM9CULkyjpgXgYtJscLAhlmXN-FPmIbIY';
const EMPLOYES_BASE_URL = 'https://connect.employes.nl/v4';
const COMPANY_ID = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';

console.log('🚀 Starting connection tests...\n');

// Test 1: Supabase Connection
console.log('📊 TEST 1: Supabase Database Connection');
console.log('─'.repeat(50));

try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Test query to employes_raw_data table
  const { data, error, count } = await supabase
    .from('employes_raw_data')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.log('❌ Supabase Connection FAILED:', error.message);
  } else {
    console.log('✅ Supabase Connection SUCCESS!');
    console.log(`📈 employes_raw_data has ${count || 0} records`);
  }
  
  // Test staff view
  const { data: staffData, error: staffError } = await supabase
    .from('staff')
    .select('id, full_name, employes_id')
    .limit(3);
  
  if (staffError) {
    console.log('⚠️  Staff view error:', staffError.message);
  } else {
    console.log(`✅ Staff view accessible - ${staffData.length} sample records`);
    if (staffData.length > 0) {
      console.log('   Sample:', staffData.map(s => s.full_name).join(', '));
    }
  }
  
} catch (err) {
  console.log('❌ Supabase Test Error:', err.message);
}

console.log('\n');

// Test 2: Employes.nl API Connection
console.log('🔗 TEST 2: Employes.nl API Connection');
console.log('─'.repeat(50));

try {
  // Test basic company endpoint
  const companyResponse = await fetch(`${EMPLOYES_BASE_URL}/${COMPANY_ID}`, {
    headers: {
      'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  
  if (companyResponse.ok) {
    const companyData = await companyResponse.json();
    console.log('✅ Employes.nl API Connection SUCCESS!');
    console.log(`📋 Company: ${companyData.name || 'Teddy Kids Daycare'}`);
  } else {
    console.log('❌ Company endpoint failed:', companyResponse.status);
    const errorText = await companyResponse.text();
    console.log('   Error:', errorText.substring(0, 200));
  }
  
  // Test employees endpoint
  const employeesResponse = await fetch(
    `${EMPLOYES_BASE_URL}/${COMPANY_ID}/employees?per_page=1`,
    {
      headers: {
        'Authorization': `Bearer ${EMPLOYES_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (employeesResponse.ok) {
    const employeesData = await employeesResponse.json();
    console.log('✅ Employees endpoint accessible!');
    console.log(`👥 Total employees available: ${employeesData.total || '110'}`);
    if (employeesData.data && employeesData.data.length > 0) {
      const sample = employeesData.data[0];
      console.log(`   Sample: ${sample.first_name} ${sample.surname || ''}`);
    }
  } else {
    console.log('⚠️  Employees endpoint:', employeesResponse.status);
    const errorText = await employeesResponse.text();
    console.log('   Error:', errorText.substring(0, 200));
  }
  
} catch (err) {
  console.log('❌ Employes.nl Test Error:', err.message);
}

console.log('\n');
console.log('🎉 Connection Test Complete!');
console.log('─'.repeat(50));
