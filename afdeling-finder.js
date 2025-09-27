// 🔍 AFDELING UUID FINDER
// Call the edge function to discover afdeling UUIDs for location codes

const supabaseUrl = 'https://gjlgaufihseaagzmidhc.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q'

async function findAfdelingUUIDs() {
  console.log('🔍 === AFDELING UUID DISCOVERY ===\n')

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/employes-integration`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'find_afdeling_ids'
      })
    })

    const result = await response.json()

    if (result.error) {
      console.log('❌ Error:', result.error)
      return
    }

    if (!result.data) {
      console.log('❌ No data received')
      return
    }

    console.log('✅ Discovery completed!\n')

    // Print employee analysis results
    console.log('👥 === EMPLOYEE ANALYSIS ===')
    const employees = result.data.employee_analysis
    if (employees && Object.keys(employees).length > 0) {
      Object.keys(employees).forEach(name => {
        console.log(`\n📋 ${name}:`)
        const employee = employees[name]
        Object.keys(employee).forEach(field => {
          if (field !== 'full_name') {
            console.log(`   ${field}: ${employee[field]}`)
          }
        })
      })
    } else {
      console.log('No employee data found')
    }

    // Print department endpoint results
    console.log('\n🏢 === DEPARTMENT ENDPOINTS ===')
    const endpoints = result.data.department_endpoints
    if (endpoints && Object.keys(endpoints).length > 0) {
      Object.keys(endpoints).forEach(endpoint => {
        const result = endpoints[endpoint]
        if (result.status === 'success') {
          console.log(`✅ ${endpoint}`)
          if (result.data) {
            console.log(`   Data: ${JSON.stringify(result.data).substring(0, 200)}...`)
          }
        } else {
          console.log(`❌ ${endpoint} - ${result.error || 'Failed'}`)
        }
      })
    } else {
      console.log('No endpoint data available')
    }

    // Print any mappings found
    console.log('\n🗺️  === AFDELING MAPPINGS ===')
    const mappings = result.data.afdeling_mappings
    if (mappings && Object.keys(mappings).length > 0) {
      Object.keys(mappings).forEach(code => {
        console.log(`✅ ${code}: ${mappings[code]}`)
      })
    } else {
      console.log('❓ No direct mappings found yet. Need to analyze the data above.')
    }

    console.log('\n🎯 Target location codes: LRZ, ZML, RBW, RB3&5')
    console.log('📝 Next step: Analyze the employee data and endpoint results to find UUIDs')

  } catch (error) {
    console.log('💥 Discovery failed:', error.message)
  }
}

findAfdelingUUIDs()