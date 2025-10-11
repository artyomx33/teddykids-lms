const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://gjlgaufihseaagzmidhc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

async function runTimelineSync() {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('🔄 Getting all employee IDs from raw data...');

    // Get all unique employee IDs
    const { data: employeeData, error: employeeError } = await supabase
      .from('employes_raw_data')
      .select('employee_id')
      .eq('is_latest', true);

    if (employeeError) {
      console.error('❌ Error getting employee IDs:', employeeError);
      return;
    }

    const uniqueEmployeeIds = [...new Set(employeeData.map(row => row.employee_id))];
    console.log(`📊 Found ${uniqueEmployeeIds.length} unique employees`);

    console.log('🚀 Starting timeline regeneration with contract milestones...');

    // Call the enhanced process-timeline Edge Function
    const { data, error } = await supabase.functions.invoke('process-timeline', {
      body: {
        employee_ids: uniqueEmployeeIds,
        source: 'contract_milestone_regeneration'
      }
    });

    if (error) {
      console.error('❌ Error calling process-timeline:', error);
      return;
    }

    console.log('✅ Timeline sync completed!');
    console.log('📊 Results:', data);

    // Check final timeline state
    const { data: timelineData, error: timelineError } = await supabase
      .from('employes_timeline_v2')
      .select('event_type, contract_milestone_type')
      .not('contract_milestone_type', 'is', null);

    if (!timelineError) {
      const milestoneTypes = {};
      timelineData.forEach(event => {
        milestoneTypes[event.contract_milestone_type] = (milestoneTypes[event.contract_milestone_type] || 0) + 1;
      });

      console.log('🎯 Contract milestone events created:');
      Object.entries(milestoneTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} events`);
      });
    }

  } catch (error) {
    console.error('💥 Script error:', error);
  }
}

runTimelineSync();