// 🔍 AFDELING ID FINDER - Extract UUIDs for location codes
// This script fetches employee data and maps afdeling codes to UUIDs

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gjlgaufihseaagzmidhc.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q'

async function findAfdelingIds() {
  console.log('🔍 === AFDELING ID DISCOVERY ===\n')

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, serviceKey)

    // Call our edge function to get employee data
    console.log('📡 Fetching employee data from Employes.nl...')
    const { data, error } = await supabase.functions.invoke('employes-integration', {
      body: { action: 'fetch_employees' }
    })

    if (error) {
      console.log('❌ Error:', error)
      return
    }

    if (!data || !data.data) {
      console.log('❌ No employee data received')
      return
    }

    const employees = data.data
    console.log(`✅ Fetched ${employees.length} employees\n`)

    // Find employees with known location codes
    const targetEmployees = [
      'Adéla Jarošová',    // LRZ (confirmed)
      'Anastasia Christofori', // LRZ (confirmed)
      'Alena Masselink',   // ZML (from screenshot)
      'Anna Cumbo',        // RBW (from screenshot)
      'Anna ten Dolle'     // RB3&5 (from screenshot)
    ]

    console.log('🎯 === TARGET EMPLOYEES ===')

    const afdelingMap = new Map()

    for (const employee of employees) {
      const fullName = `${employee.first_name} ${employee.surname_prefix ? employee.surname_prefix + ' ' : ''}${employee.surname}`

      if (targetEmployees.includes(fullName)) {
        console.log(`\n👤 ${fullName}:`)
        console.log(`   Employee ID: ${employee.id}`)
        console.log(`   Department: ${employee.department || 'N/A'}`)
        console.log(`   Department ID: ${employee.department_id || 'N/A'}`)
        console.log(`   Afdeling: ${employee.afdeling || 'N/A'}`)
        console.log(`   Location: ${employee.location || 'N/A'}`)
        console.log(`   Location ID: ${employee.location_id || 'N/A'}`)

        // Look for any field that might contain the location code
        const allFields = Object.keys(employee)
        const locationFields = allFields.filter(field =>
          field.toLowerCase().includes('afdel') ||
          field.toLowerCase().includes('depart') ||
          field.toLowerCase().includes('location') ||
          field.toLowerCase().includes('afde')
        )

        if (locationFields.length > 0) {
          console.log(`   📍 Location-related fields:`)
          locationFields.forEach(field => {
            console.log(`      ${field}: ${employee[field]}`)

            // If this looks like a location code, map it
            const value = employee[field]
            if (value && typeof value === 'string') {
              const upperValue = value.toUpperCase()
              if (['LRZ', 'ZML', 'RBW', 'RB3&5'].includes(upperValue)) {
                // Find the corresponding ID field
                const idField = field + '_id'
                const uuidField = field.replace(/_(code|key|name)$/, '_id')

                if (employee[idField]) {
                  afdelingMap.set(upperValue, employee[idField])
                  console.log(`      🎯 FOUND MAPPING: ${upperValue} → ${employee[idField]}`)
                } else if (employee[uuidField]) {
                  afdelingMap.set(upperValue, employee[uuidField])
                  console.log(`      🎯 FOUND MAPPING: ${upperValue} → ${employee[uuidField]}`)
                }
              }
            }
          })
        }

        // Print all fields for debugging
        console.log(`   🔍 All fields:`)
        Object.keys(employee).forEach(key => {
          if (employee[key] !== null && employee[key] !== undefined && employee[key] !== '') {
            console.log(`      ${key}: ${employee[key]}`)
          }
        })
      }
    }

    console.log('\n🗺️  === AFDELING MAPPING RESULTS ===')
    if (afdelingMap.size > 0) {
      afdelingMap.forEach((uuid, code) => {
        console.log(`✅ ${code}: ${uuid}`)
      })
    } else {
      console.log('❌ No direct mappings found in standard fields')
      console.log('💡 The location codes might be in non-standard fields or need different mapping')
    }

    // Look for any department/afdeling endpoints
    console.log('\n🏢 === CHECKING FOR DEPARTMENT ENDPOINTS ===')
    try {
      const deptResult = await supabase.functions.invoke('employes-integration', {
        body: { action: 'discover_endpoints' }
      })

      if (deptResult.data) {
        console.log('📋 Available endpoints:')
        console.log(JSON.stringify(deptResult.data, null, 2))
      }
    } catch (err) {
      console.log('⚠️ Could not fetch endpoints')
    }

  } catch (error) {
    console.log('💥 Script error:', error.message)
  }
}

findAfdelingIds()