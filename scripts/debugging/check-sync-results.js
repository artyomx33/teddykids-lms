const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSyncResults() {
  console.log('🔍 CHECKING SYNC RESULTS...\n');

  // 1. Check sync sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('employes_sync_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(3);

  if (sessionsError) {
    console.error('❌ Error fetching sessions:', sessionsError);
  } else {
    console.log('📊 RECENT SYNC SESSIONS:');
    sessions.forEach((s, i) => {
      console.log(`\n${i + 1}. Session ${s.id.substring(0, 8)}...`);
      console.log(`   Type: ${s.session_type}`);
      console.log(`   Status: ${s.status}`);
      console.log(`   Started: ${s.started_at}`);
      console.log(`   Completed: ${s.completed_at || 'N/A'}`);
      console.log(`   Records: ${s.total_records} total, ${s.successful_records} success, ${s.failed_records} failed`);
      if (s.sync_details) {
        console.log(`   Details:`, JSON.stringify(s.sync_details, null, 2));
      }
    });
  }

  // 2. Check health dashboard
  const { data: health, error: healthError } = await supabase
    .from('v_sync_health_dashboard')
    .select('*')
    .single();

  if (healthError) {
    console.error('\n❌ Error fetching health:', healthError);
  } else {
    console.log('\n\n🏥 SYSTEM HEALTH:');
    console.log(`   Syncs (24h): ${health.syncs_last_24h} (${health.successful_syncs_24h} success, ${health.failed_syncs_24h} failed)`);
    console.log(`   Last sync: ${health.last_successful_sync}`);
    console.log(`   Fresh records: ${health.fresh_records}`);
    console.log(`   Stale records: ${health.stale_records}`);
    console.log(`   Data completeness: ${Math.round(health.avg_data_completeness * 100)}%`);
    console.log(`   Partial records: ${health.partial_records}`);
    console.log(`   Needs retry: ${health.needs_retry}`);
    console.log(`   Failed records: ${health.failed_records}`);
    console.log(`   Changes (7d): ${health.changes_last_7d}`);
    console.log(`   Timeline events (7d): ${health.timeline_events_7d}`);
    console.log(`   Total employees: ${health.total_employees} (${health.active_employees} active)`);
  }

  // 3. Check recent changes
  const { data: changes, error: changesError } = await supabase
    .from('employes_changes')
    .select('*')
    .eq('is_duplicate', false)
    .order('detected_at', { ascending: false })
    .limit(5);

  if (changesError) {
    console.error('\n❌ Error fetching changes:', changesError);
  } else {
    console.log(`\n\n🔄 RECENT CHANGES (${changes.length}):`);
    changes.forEach((c, i) => {
      console.log(`\n${i + 1}. ${c.change_type} - ${c.field_name}`);
      console.log(`   Employee: ${c.employee_id.substring(0, 8)}...`);
      console.log(`   Effective: ${c.effective_date}`);
      console.log(`   Change: ${JSON.stringify(c.old_value)} → ${JSON.stringify(c.new_value)}`);
      if (c.business_impact) {
        console.log(`   Impact: ${c.business_impact}`);
      }
    });
  }

  // 4. Check timeline events
  const { data: timeline, error: timelineError } = await supabase
    .from('employes_timeline_v2')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (timelineError) {
    console.error('\n❌ Error fetching timeline:', timelineError);
  } else {
    console.log(`\n\n📅 RECENT TIMELINE EVENTS (${timeline.length}):`);
    timeline.forEach((t, i) => {
      console.log(`\n${i + 1}. ${t.event_type}`);
      console.log(`   Employee: ${t.employee_id.substring(0, 8)}...`);
      console.log(`   Date: ${t.event_date}`);
      console.log(`   Description: ${t.event_description || 'N/A'}`);
      if (t.change_amount) {
        console.log(`   Change: €${t.change_amount} (${t.change_percentage}%)`);
      }
    });
  }

  console.log('\n\n✅ SYNC CHECK COMPLETE!\n');
}

checkSyncResults().catch(console.error);
