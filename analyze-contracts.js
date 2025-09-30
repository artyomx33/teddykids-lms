import { quickQuery, inspectTable } from './claude-helpers.js';

async function analyzeContracts() {
  console.log('🔍 Analyzing Contract Data Inconsistencies');
  console.log('==============================================');

  // Check for orphaned contracts
  console.log('1. Orphaned Contracts (no staff_id):');
  const orphaned = await quickQuery('SELECT id, employee_name, contract_type, status, staff_id, created_at FROM contracts WHERE staff_id IS NULL');
  console.table(orphaned);

  // Check for contracts with staff_id
  console.log('\n2. Linked Contracts (with staff_id):');
  const linked = await quickQuery('SELECT id, employee_name, contract_type, status, staff_id, created_at FROM contracts WHERE staff_id IS NOT NULL');
  console.table(linked);

  // Check staff table for specific employee
  console.log('\n3. Staff Record for Adéla Jarošová:');
  const staff = await quickQuery(`SELECT id, full_name, employment_start_date, employment_end_date, salary_amount FROM staff WHERE full_name = 'Adéla Jarošová'`);
  console.table(staff);

  // Check all staff records
  console.log('\n4. All Staff Records:');
  const allStaff = await quickQuery('SELECT id, full_name, employment_start_date, salary_amount FROM staff ORDER BY full_name');
  console.table(allStaff);

  // Check contracts table structure
  console.log('\n5. Contracts Table Schema:');
  await inspectTable('contracts');

  // Check if there are any patterns in contract types
  console.log('\n6. Contract Type Distribution:');
  const contractTypes = await quickQuery('SELECT contract_type, status, COUNT(*) as count FROM contracts GROUP BY contract_type, status ORDER BY count DESC');
  console.table(contractTypes);

  // Check query_params content for orphaned contracts
  console.log('\n7. Query Params for Orphaned Contracts:');
  const queryParams = await quickQuery('SELECT id, employee_name, query_params FROM contracts WHERE staff_id IS NULL');
  console.table(queryParams);
}

analyzeContracts().catch(console.error);