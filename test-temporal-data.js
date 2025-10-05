// Test script to check our temporal data architecture
// and extract Alena Masselink's complete history

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL || 'https://gjlgaufihseaagzmidhc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q';

console.log('🔗 Connecting to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTemporalArchitecture() {
  console.log('🔍 TEMPORAL DATA RECONNAISSANCE\n');
  
  const report = [];
  report.push('# 🔍 TEMPORAL DATA RECONNAISSANCE REPORT');
  report.push('');
  report.push('**Generated:** ' + new Date().toISOString());
  report.push('');
  report.push('---\n');
  
  // 1. Check employes_raw_data
  console.log('📊 Checking employes_raw_data...');
  const { data: rawData, error: rawError } = await supabase
    .from('employes_raw_data')
    .select('*')
    .limit(1000);
  
  if (rawError) {
    console.error('Error fetching raw data:', rawError);
    report.push('## ❌ Error: ' + rawError.message);
  } else {
    console.log('✅ Found ' + rawData.length + ' raw data records');
    
    // Count by endpoint
    const endpointCounts = {};
    const employeeIds = new Set();
    
    rawData.forEach(record => {
      endpointCounts[record.endpoint] = (endpointCounts[record.endpoint] || 0) + 1;
      employeeIds.add(record.employee_id);
    });
    
    report.push('## 📦 Raw Data Summary\n');
    report.push('- **Total Records:** ' + rawData.length);
    report.push('- **Unique Employees:** ' + employeeIds.size);
    report.push('');
    report.push('### Records by Endpoint:\n');
    Object.entries(endpointCounts).sort((a, b) => b[1] - a[1]).forEach(([endpoint, count]) => {
      report.push('- `' + endpoint + '`: ' + count + ' records');
    });
    report.push('');
  }
  
  // 2. Check employes_changes
  console.log('🔍 Checking employes_changes...');
  const { data: changes, error: changesError } = await supabase
    .from('employes_changes')
    .select('*')
    .limit(1000);
  
  if (changesError) {
    console.error('Error fetching changes:', changesError);
    report.push('## ❌ Changes Error: ' + changesError.message);
  } else {
    console.log('✅ Found ' + changes.length + ' change records');
    
    const changeTypeCounts = {};
    changes.forEach(change => {
      changeTypeCounts[change.change_type] = (changeTypeCounts[change.change_type] || 0) + 1;
    });
    
    report.push('## 🔄 Changes Detected Summary\n');
    report.push('- **Total Changes:** ' + changes.length);
    report.push('');
    report.push('### Changes by Type:\n');
    Object.entries(changeTypeCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      report.push('- `' + type + '`: ' + count + ' changes');
    });
    report.push('');
  }
  
  // 3. Check employes_sync_sessions
  console.log('📋 Checking sync sessions...');
  const { data: sessions, error: sessionsError } = await supabase
    .from('employes_sync_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(10);
  
  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError);
  } else {
    console.log('✅ Found ' + sessions.length + ' sync sessions');
    
    report.push('## 📋 Recent Sync Sessions\n');
    report.push('| Session Type | Started | Status | Records |');
    report.push('|-------------|---------|--------|---------|');
    sessions.forEach(session => {
      const started = new Date(session.started_at).toISOString().split('T')[0];
      report.push('| ' + (session.session_type || 'N/A') + ' | ' + started + ' | ' + session.status + ' | ' + (session.total_records || 0) + ' |');
    });
    report.push('');
  }
  
  // 4. Find Alena Masselink
  console.log('\n🎯 SEARCHING FOR ALENA MASSELINK...\n');
  
  report.push('---\n');
  report.push('## 👤 ALENA MASSELINK - COMPLETE HISTORY\n');
  
  // Search for Alena in raw data
  const { data: alenaRecords, error: alenaError } = await supabase
    .from('employes_raw_data')
    .select('*')
    .or('api_response->>first_name.ilike.%alena%,api_response->>surname.ilike.%masselink%')
    .order('effective_from', { ascending: true });
  
  if (alenaError) {
    console.error('Error finding Alena:', alenaError);
    report.push('❌ Error: ' + alenaError.message);
  } else if (!alenaRecords || alenaRecords.length === 0) {
    console.log('❌ Alena Masselink not found');
    report.push('❌ **Not found in database**');
    
    // List all employees to help find her
    console.log('\n📋 Listing all employees...');
    const { data: allEmployees } = await supabase
      .from('employes_raw_data')
      .select('employee_id, api_response')
      .eq('endpoint', '/employee')
      .eq('is_latest', true);
    
    if (allEmployees) {
      report.push('\n### Available Employees:\n');
      allEmployees.slice(0, 20).forEach(emp => {
        const name = (emp.api_response.first_name || '') + ' ' + (emp.api_response.surname || '');
        report.push('- **' + name.trim() + '** (ID: ' + emp.employee_id + ')');
      });
      if (allEmployees.length > 20) {
        report.push('\n_... and ' + (allEmployees.length - 20) + ' more employees_');
      }
    }
  } else {
    console.log('✅ Found ' + alenaRecords.length + ' records for Alena Masselink');
    
    const alenaId = alenaRecords[0].employee_id;
    const alenaName = (alenaRecords[0].api_response.first_name || '') + ' ' + (alenaRecords[0].api_response.surname || '');
    
    report.push('**Employee ID:** `' + alenaId + '`');
    report.push('**Full Name:** ' + alenaName);
    report.push('**Total Records:** ' + alenaRecords.length);
    report.push('');
    
    // Get her latest snapshot
    const latestRecord = alenaRecords.find(r => r.endpoint === '/employee' && r.is_latest);
    if (latestRecord) {
      report.push('### 📸 Current Snapshot\n');
      report.push('```json');
      report.push(JSON.stringify(latestRecord.api_response, null, 2));
      report.push('```\n');
    }
    
    // Get all her historical records
    report.push('### 📜 Historical Records\n');
    report.push('| Collected | Endpoint | Effective From | Is Latest |');
    report.push('|-----------|----------|----------------|-----------|');
    alenaRecords.forEach(record => {
      const collected = new Date(record.collected_at).toISOString().split('T')[0];
      const effective = record.effective_from ? new Date(record.effective_from).toISOString().split('T')[0] : 'N/A';
      report.push('| ' + collected + ' | `' + record.endpoint + '` | ' + effective + ' | ' + (record.is_latest ? '✅' : '❌') + ' |');
    });
    report.push('');
    
    // Get her changes
    const { data: alenaChanges } = await supabase
      .from('employes_changes')
      .select('*')
      .eq('employee_id', alenaId)
      .order('effective_date', { ascending: true });
    
    if (alenaChanges && alenaChanges.length > 0) {
      console.log('✅ Found ' + alenaChanges.length + ' changes for Alena');
      
      report.push('### 🔄 Detected Changes\n');
      report.push('| Date | Type | Field | Old Value | New Value | Change |');
      report.push('|------|------|-------|-----------|-----------|--------|');
      alenaChanges.forEach(change => {
        const date = new Date(change.effective_date).toISOString().split('T')[0];
        const oldVal = JSON.stringify(change.old_value);
        const newVal = JSON.stringify(change.new_value);
        const changeAmt = change.change_amount ? (change.change_amount > 0 ? '+' : '') + change.change_amount : 'N/A';
        report.push('| ' + date + ' | ' + change.change_type + ' | ' + (change.field_name || 'N/A') + ' | ' + oldVal + ' | ' + newVal + ' | ' + changeAmt + ' |');
      });
      report.push('');
      
      // Detailed change breakdown
      report.push('### 📊 Detailed Change Analysis\n');
      alenaChanges.forEach((change, idx) => {
        report.push('#### Change #' + (idx + 1) + ' - ' + change.change_type + '\n');
        report.push('- **Date:** ' + new Date(change.effective_date).toISOString());
        report.push('- **Field:** ' + (change.field_name || 'N/A'));
        report.push('- **Old Value:** `' + JSON.stringify(change.old_value) + '`');
        report.push('- **New Value:** `' + JSON.stringify(change.new_value) + '`');
        if (change.change_amount) {
          report.push('- **Change Amount:** ' + change.change_amount);
        }
        if (change.change_percent) {
          report.push('- **Change Percent:** ' + change.change_percent.toFixed(2) + '%');
        }
        report.push('- **Business Impact:** ' + (change.business_impact || 'N/A'));
        report.push('- **Confidence:** ' + (change.confidence_score || 1.0));
        report.push('');
      });
    } else {
      console.log('⚠️ No changes detected for Alena yet');
      report.push('### 🔄 Detected Changes\n');
      report.push('_No changes detected yet. Run the change-detector service to analyze her history._\n');
    }
    
    // Full data dump
    report.push('### 📦 Complete Raw Data Dump\n');
    report.push('<details>');
    report.push('<summary>Click to expand all ' + alenaRecords.length + ' records</summary>\n');
    report.push('```json');
    report.push(JSON.stringify(alenaRecords, null, 2));
    report.push('```');
    report.push('</details>\n');
  }
  
  // Write report
  const reportContent = report.join('\n');
  fs.writeFileSync('TEMPORAL_DATA_REPORT.md', reportContent);
  console.log('\n✅ Report saved to TEMPORAL_DATA_REPORT.md');
  
  return reportContent;
}

// Run the test
testTemporalArchitecture()
  .then(() => {
    console.log('\n✅ Data reconnaissance complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
