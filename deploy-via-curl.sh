#!/bin/bash

# DIRECT SUPABASE DEPLOYMENT VIA CURL
# No more copy/paste - direct API deployment!

SUPABASE_URL="https://gjlgaufihseaagzmidhc.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q"

echo "🚀 Starting DIRECT database deployment via API..."

echo "📊 Step 1: Creating staff_required_documents table..."

# Create table via SQL execution
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS staff_required_documents (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, staff_id UUID REFERENCES staff(id) ON DELETE CASCADE, document_type TEXT NOT NULL, file_path TEXT, uploaded_at TIMESTAMP WITH TIME ZONE, is_required BOOLEAN DEFAULT true, created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()); CREATE INDEX IF NOT EXISTS idx_staff_required_documents_staff_id ON staff_required_documents(staff_id);"
  }'

echo ""
echo "👁️ Step 2: Creating staff_document_compliance view..."

# Create view
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -d '{
    "sql": "CREATE OR REPLACE VIEW public.staff_document_compliance AS SELECT (SELECT COUNT(DISTINCT s.id) FROM staff s WHERE EXISTS (SELECT 1 FROM staff_required_documents srd WHERE srd.staff_id = s.id AND srd.is_required = true AND (srd.file_path IS NULL OR srd.file_path = '')))::bigint as any_missing, (SELECT COUNT(*) FROM staff_required_documents srd WHERE srd.is_required = true AND (srd.file_path IS NULL OR srd.file_path = ''))::bigint as missing_count, (SELECT COUNT(*) FROM staff)::bigint as total_staff;"
  }'

echo ""
echo "🌱 Step 3: Seeding required documents..."

# Seed data
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -d '{
    "sql": "INSERT INTO staff_required_documents (staff_id, document_type, is_required) SELECT s.id, doc_type, true FROM staff s CROSS JOIN (VALUES ('"'"'contract'"'"'), ('"'"'id_copy'"'"'), ('"'"'diploma'"'"'), ('"'"'certificate_of_good_conduct'"'"'), ('"'"'bank_details'"'"')) as required_docs(doc_type) ON CONFLICT DO NOTHING;"
  }'

echo ""
echo "🧪 Step 4: Testing the deployment..."

# Test the view
curl -X GET "${SUPABASE_URL}/rest/v1/staff_document_compliance?select=*" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "apikey: ${SERVICE_ROLE_KEY}"

echo ""
echo "✅ Deployment complete! Check the results above."
echo "🎯 Your app should now work without 400/406 errors!"