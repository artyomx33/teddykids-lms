import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gjlgaufihseaagzmidhc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTAwNDMsImV4cCI6MjA3MjM2NjA0M30.sa5p979OT0HN36KsCKabyQ-wB8nrtG-IjE9MsobdBh8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function directUpdate() {
  console.log('🔄 Starting direct staff location updates...')

  try {
    // Get all staff records
    console.log('📋 Fetching all staff records...')
    const { data: staff, error: fetchError } = await supabase
      .from('staff')
      .select('id, full_name, address, postal_code, city')

    if (fetchError) {
      console.error('❌ Error fetching staff:', fetchError)
      return
    }

    console.log(`👥 Found ${staff.length} staff members`)

    // Process each staff member to determine location and manager
    const updates = staff.map(person => {
      let location_key = null
      let manager = null

      // Address-based mapping
      if (person.address) {
        const addr = person.address.toLowerCase()
        if (addr.includes('rijnsburgerweg 35') || addr.includes('rijnsburgerweg35')) {
          location_key = 'RBW'
          manager = 'Sofia'
        } else if (addr.includes('rijnsburgerweg 3') || addr.includes('rijnsburgerweg 5') ||
                   addr.includes('rijnsburgerweg3') || addr.includes('rijnsburgerweg5')) {
          location_key = 'RB3/RB5'
          manager = 'Pamela'
        } else if (addr.includes('lorentzkade 15') || addr.includes('lorentzkade15')) {
          location_key = 'LRZ'
          manager = 'Antonella'
        } else if (addr.includes('zeemanlaan 22') || addr.includes('zeemanlaan22')) {
          location_key = 'ZML'
          manager = 'Meral'
        }
      }

      // Postal code fallback mapping
      if (!location_key && person.postal_code && person.city) {
        const postal = person.postal_code.toLowerCase()
        const city = person.city.toLowerCase()

        if (postal.startsWith('2313') && city.includes('leiden')) {
          location_key = 'ZML'
          manager = 'Meral'
        } else if (postal.startsWith('2312') && city.includes('leiden')) {
          location_key = 'RBW'
          manager = 'Sofia'
        } else if (postal.startsWith('2311') && city.includes('leiden')) {
          location_key = 'LRZ'
          manager = 'Antonella'
        } else if (postal.startsWith('2314') && city.includes('leiden')) {
          location_key = 'RB3/RB5'
          manager = 'Pamela'
        }
      }

      return {
        id: person.id,
        full_name: person.full_name,
        location_key,
        manager,
        shouldUpdate: location_key !== null
      }
    })

    const toUpdate = updates.filter(u => u.shouldUpdate)
    console.log(`🏢 Found ${toUpdate.length} staff members to map to locations:`)

    // Show distribution
    const distribution = toUpdate.reduce((acc, person) => {
      const key = person.location_key
      if (!acc[key]) acc[key] = { count: 0, manager: person.manager, names: [] }
      acc[key].count++
      acc[key].names.push(person.full_name)
      return acc
    }, {})

    Object.entries(distribution).forEach(([location, info]) => {
      console.log(`  ${location} (${info.manager}): ${info.count} staff`)
      console.log(`    Sample: ${info.names.slice(0, 3).join(', ')}${info.names.length > 3 ? '...' : ''}`)
    })

    // Now update in batches
    console.log('\n🔄 Updating staff records...')
    let updated = 0

    for (const person of toUpdate) {
      try {
        const { error: updateError } = await supabase
          .from('staff')
          .update({
            location_key: person.location_key,
            manager: person.manager
          })
          .eq('id', person.id)

        if (updateError) {
          console.log(`⚠️ Failed to update ${person.full_name}:`, updateError.message)
        } else {
          updated++
        }
      } catch (err) {
        console.log(`⚠️ Error updating ${person.full_name}:`, err.message)
      }
    }

    console.log(`\n✅ Successfully updated ${updated} out of ${toUpdate.length} staff records!`)

    // Verify results
    console.log('\n📊 Verifying results...')
    const { data: verification, error: verifyError } = await supabase
      .from('staff')
      .select('location_key, manager, full_name')
      .not('location_key', 'is', null)
      .limit(10)

    if (verifyError) {
      console.error('❌ Verification error:', verifyError)
    } else {
      console.log('✅ Sample updated records:', verification)
    }

  } catch (error) {
    console.error('❌ Direct update failed:', error)
  }
}

directUpdate()