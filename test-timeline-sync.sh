#!/bin/bash

# Test script to run timeline sync with sample employee IDs
echo "🚀 Testing timeline sync with contract milestones..."

# Sample employee IDs from earlier query
EMPLOYEE_IDS='["01985c24-ee11-450e-ae80-e7b27f2630d7","07ce3d02-31df-4d4d-baa0-91c41aa8e344","0a4989fd-d222-40fb-80e0-f61200dd142b","0a695c61-9493-4eab-b368-4f242786add8","0c19e79d-23e5-4f53-854c-56e71afdd1aa","0f6b3793-f9d0-4c3a-aed4-ee8127da38b7","10c848fc-cdf3-4362-8826-2805b4bbe5f1","14c1f32e-caad-481d-b592-56077eecc99f","16c44c19-0a9e-44df-a7b5-76fa6cb70188","179c1edb-52f9-43fa-8a2e-5f8c7b0b6ffd"]'

# Project URL
SUPABASE_URL="https://gjlgaufihseaagzmidhc.supabase.co"

echo "📊 Processing 10 test employees..."

# Call the Edge Function
curl -X POST "${SUPABASE_URL}/functions/v1/process-timeline" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY:-missing_key}" \
  -d "{\"employee_ids\": ${EMPLOYEE_IDS}, \"source\": \"test_contract_milestones\"}" \
  | jq '.'

echo "✅ Test completed!"