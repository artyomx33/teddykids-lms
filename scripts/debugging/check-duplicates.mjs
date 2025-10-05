import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = `https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDuplicates() {
  console.log('🔍 CHECKING FOR DUPLICATE RAW DATA...\n');

  // 1. Count total raw records
  const { count: totalCount } = await supabase
    .from('employes_raw_data')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total raw_data records: ${totalCount}\n`);

  // 2. Check for exact duplicates by employee and endpoint
  const { data: rawRecords } = await supabase
    .from('employes_raw_data')
    .select('employee_id, endpoint, data_hash, collected_at')
    .order('collected_at', { ascending: false });

  // Group by employee_id + endpoint + data_hash
  const duplicateGroups = {};
  rawRecords?.forEach(record => {
    const key = `${record.employee_id}|${record.endpoint}|${record.data_hash}`;
    if (!duplicateGroups[key]) {
      duplicateGroups[key] = [];
    }
    duplicateGroups[key].push(record.collected_at);
  });

  // Find actual duplicates
  let duplicateCount = 0;
  let redundantRecords = 0;
  const examples = [];

  Object.entries(duplicateGroups).forEach(([key, dates]) => {
    if (dates.length > 1) {
      duplicateCount++;
      redundantRecords += (dates.length - 1);
      
      if (examples.length < 3) {
        const [employee_id, endpoint] = key.split('|');
        examples.push({
          employee_id: employee_id.substring(0, 8) + '...',
          endpoint,
          occurrences: dates.length,
          first: dates[dates.length - 1],
          last: dates[0]
        });
      }
    }
  });

  console.log(`🔄 DUPLICATE ANALYSIS:`);
  console.log(`   Unique data combinations: ${Object.keys(duplicateGroups).length}`);
  console.log(`   Duplicate groups found: ${duplicateCount}`);
  console.log(`   Redundant records: ${redundantRecords}`);
  console.log(`   Storage waste: ${Math.round((redundantRecords / totalCount) * 100)}%\n`);

  if (examples.length > 0) {
    console.log(`📋 EXAMPLES:`);
    examples.forEach((ex, i) => {
      console.log(`\n${i + 1}. Employee ${ex.employee_id} - ${ex.endpoint}`);
      console.log(`   Stored ${ex.occurrences} times (same exact data)`);
      console.log(`   First: ${ex.first}`);
      console.log(`   Last: ${ex.last}`);
    });
  }

  // 3. Check employes_changes for duplicates
  const { count: changesCount } = await supabase
    .from('employes_changes')
    .select('*', { count: 'exact', head: true })
    .eq('is_duplicate', false);

  const { count: duplicateChanges } = await supabase
    .from('employes_changes')
    .select('*', { count: 'exact', head: true })
    .eq('is_duplicate', true);

  console.log(`\n\n📈 EMPLOYES_CHANGES:`);
  console.log(`   Valid changes: ${changesCount}`);
  console.log(`   Duplicate changes: ${duplicateChanges || 0}`);

  // 4. Check timeline
  const { count: timelineCount } = await supabase
    .from('employes_timeline_v2')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📅 TIMELINE EVENTS: ${timelineCount}`);

  console.log('\n✅ ANALYSIS COMPLETE!\n');
}

checkDuplicates().catch(console.error);
