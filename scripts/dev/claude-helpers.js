// Claude Development Helpers
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gjlgaufihseaagzmidhc.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q'

const supabase = createClient(supabaseUrl, serviceKey)

// Quick database queries
export async function quickQuery(sql) {
  console.log('🔍 Executing:', sql)
  const { data, error } = await supabase.rpc('exec_sql', { sql })
  if (error) console.error('❌ Error:', error)
  else console.log('✅ Result:', data)
  return { data, error }
}

// Quick table inspect
export async function inspectTable(tableName) {
  const sql = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = '${tableName}'
    AND table_schema = 'public'
    ORDER BY ordinal_position;
  `
  return quickQuery(sql)
}

// Quick data peek
export async function peekData(tableName, limit = 5) {
  const sql = `SELECT * FROM ${tableName} LIMIT ${limit};`
  return quickQuery(sql)
}

// Live schema refresh
export async function refreshSchema() {
  const sql = `NOTIFY pgrst, 'reload schema';`
  return quickQuery(sql)
}

console.log('🤖 Claude helpers loaded! Available functions:')
console.log('- quickQuery(sql)')
console.log('- inspectTable(tableName)')
console.log('- peekData(tableName, limit)')
console.log('- refreshSchema()')