import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gjlgaufihseaagzmidhc.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTAwNDMsImV4cCI6MjA3MjM2NjA0M30.sa5p979OT0HN36KsCKabyQ-wB8nrtG-IjE9MsobdBh8'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🔄 Running staff locations migration...')

  try {
    // Step 1: Add missing columns
    console.log('📝 Adding manager and location_key columns...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.staff
        ADD COLUMN IF NOT EXISTS manager text,
        ADD COLUMN IF NOT EXISTS location_key text;
      `
    })

    if (alterError) {
      console.log('⚠️ Column addition result:', alterError.message)
    }

    // Step 2: Create indexes
    console.log('🗂️ Creating indexes...')
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_staff_manager_lower ON public.staff (lower(manager));
        CREATE INDEX IF NOT EXISTS idx_staff_location_key ON public.staff (location_key);
      `
    })

    // Step 3: Update staff locations based on address patterns
    console.log('🏢 Mapping staff to locations based on addresses...')
    const { error: updateError1 } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.staff
        SET
          location_key = CASE
            WHEN address ILIKE '%rijnsburgerweg 35%' OR address ILIKE '%rijnsburgerweg35%' THEN 'RBW'
            WHEN address ILIKE '%rijnsburgerweg 3%' OR address ILIKE '%rijnsburgerweg 5%'
                 OR address ILIKE '%rijnsburgerweg3%' OR address ILIKE '%rijnsburgerweg5%' THEN 'RB3/RB5'
            WHEN address ILIKE '%lorentzkade 15%' OR address ILIKE '%lorentzkade15%' THEN 'LRZ'
            WHEN address ILIKE '%zeemanlaan 22%' OR address ILIKE '%zeemanlaan22%' THEN 'ZML'
            ELSE location_key
          END,
          manager = CASE
            WHEN address ILIKE '%rijnsburgerweg 35%' OR address ILIKE '%rijnsburgerweg35%' THEN 'Sofia'
            WHEN address ILIKE '%rijnsburgerweg 3%' OR address ILIKE '%rijnsburgerweg 5%'
                 OR address ILIKE '%rijnsburgerweg3%' OR address ILIKE '%rijnsburgerweg5%' THEN 'Pamela'
            WHEN address ILIKE '%lorentzkade 15%' OR address ILIKE '%lorentzkade15%' THEN 'Antonella'
            WHEN address ILIKE '%zeemanlaan 22%' OR address ILIKE '%zeemanlaan22%' THEN 'Meral'
            ELSE manager
          END
        WHERE address IS NOT NULL;
      `
    })

    if (updateError1) {
      console.log('⚠️ Address-based mapping error:', updateError1.message)
    }

    // Step 4: Alternative mapping by postal codes
    console.log('📮 Mapping by postal codes...')
    const { error: updateError2 } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.staff
        SET
          location_key = CASE
            WHEN postal_code ILIKE '2313%' AND city ILIKE '%leiden%' THEN 'ZML'
            WHEN postal_code ILIKE '2312%' AND city ILIKE '%leiden%' THEN 'RBW'
            WHEN postal_code ILIKE '2311%' AND city ILIKE '%leiden%' THEN 'LRZ'
            WHEN postal_code ILIKE '2314%' AND city ILIKE '%leiden%' THEN 'RB3/RB5'
            ELSE location_key
          END,
          manager = CASE
            WHEN postal_code ILIKE '2313%' AND city ILIKE '%leiden%' THEN 'Meral'
            WHEN postal_code ILIKE '2312%' AND city ILIKE '%leiden%' THEN 'Sofia'
            WHEN postal_code ILIKE '2311%' AND city ILIKE '%leiden%' THEN 'Antonella'
            WHEN postal_code ILIKE '2314%' AND city ILIKE '%leiden%' THEN 'Pamela'
            ELSE manager
          END
        WHERE
          location_key IS NULL
          AND postal_code IS NOT NULL
          AND city IS NOT NULL;
      `
    })

    if (updateError2) {
      console.log('⚠️ Postal code mapping error:', updateError2.message)
    }

    // Step 5: Get results
    console.log('📊 Getting results...')
    const { data: results, error: resultsError } = await supabase
      .from('staff')
      .select('location_key, manager, full_name')
      .not('location_key', 'is', null)
      .limit(20)

    if (resultsError) {
      console.error('❌ Results error:', resultsError)
    } else {
      console.log('✅ Sample mapped staff:', results)
    }

    // Step 6: Count by location
    const { data: counts, error: countsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          location_key,
          manager,
          COUNT(*) as staff_count
        FROM public.staff
        WHERE location_key IS NOT NULL
        GROUP BY location_key, manager
        ORDER BY location_key;
      `
    })

    if (countsError) {
      console.error('❌ Count error:', countsError)
    } else {
      console.log('📈 Staff counts by location:', counts)
    }

    console.log('🎉 Migration completed!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

runMigration()