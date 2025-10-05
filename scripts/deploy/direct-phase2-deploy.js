#!/usr/bin/env node

// PHASE 2 DATABASE DEPLOYMENT
// Deploy reviews system schema directly to production

const SUPABASE_URL = "https://gjlgaufihseaagzmidhc.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbGdhdWZpaHNlYWFnem1pZGhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc5MDA0MywiZXhwIjoyMDcyMzY2MDQzfQ.VMV7A7Qi3xHERzThHVLACDbaC_ha00Fko5KqMIHa65Q";

const fs = require('fs');
const path = require('path');

async function executeSQLChunk(sql, description) {
  console.log(`\n🔧 ${description}...`);

  // For direct execution, we'll need to use a different approach
  // Let's create the tables step by step

  console.log(`SQL Length: ${sql.length} characters`);
  console.log(`Preview: ${sql.substring(0, 100)}...`);

  return true; // For now, return success
}

async function deployPhase2Schema() {
  console.log('🚀 Starting Phase 2 Database Deployment...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, 'supabase/migrations/20250928_phase2_reviews_system.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file loaded successfully');
  console.log(`📊 Size: ${migrationSQL.length} characters`);

  // Break down into logical chunks for deployment
  const chunks = [
    {
      name: "Review Templates Table",
      sql: `
        CREATE TABLE IF NOT EXISTS public.review_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('six_month', 'yearly', 'performance', 'probation', 'custom')),
          description TEXT,
          questions JSONB NOT NULL DEFAULT '[]',
          criteria JSONB NOT NULL DEFAULT '{}',
          scoring_method TEXT DEFAULT 'five_star' CHECK (scoring_method IN ('five_star', 'percentage', 'qualitative')),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          created_by UUID,
          UNIQUE(type, name)
        );
      `
    },
    {
      name: "Staff Reviews Table",
      sql: `
        CREATE TABLE IF NOT EXISTS public.staff_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
          template_id UUID REFERENCES public.review_templates(id),
          reviewer_id UUID REFERENCES public.staff(id),
          review_type TEXT NOT NULL CHECK (review_type IN ('six_month', 'yearly', 'performance', 'probation', 'exit')),
          review_period_start DATE,
          review_period_end DATE,
          review_date DATE NOT NULL,
          due_date DATE,
          status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'cancelled')),
          scheduled_at TIMESTAMPTZ,
          started_at TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          responses JSONB DEFAULT '{}',
          summary TEXT,
          goals_previous JSONB DEFAULT '[]',
          goals_next JSONB DEFAULT '[]',
          development_areas TEXT[],
          achievements TEXT[],
          overall_score DECIMAL(3,2) CHECK (overall_score >= 0 AND overall_score <= 5),
          score_breakdown JSONB DEFAULT '{}',
          star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
          performance_level TEXT CHECK (performance_level IN ('exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory')),
          promotion_ready BOOLEAN DEFAULT false,
          salary_recommendation TEXT CHECK (salary_recommendation IN ('increase', 'maintain', 'review', 'decrease')),
          signed_by_employee BOOLEAN DEFAULT false,
          signed_by_reviewer BOOLEAN DEFAULT false,
          employee_signature_date TIMESTAMPTZ,
          reviewer_signature_date TIMESTAMPTZ,
          document_path TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `
    }
  ];

  console.log('\n📋 Will deploy the following components:');
  chunks.forEach((chunk, i) => {
    console.log(`  ${i + 1}. ${chunk.name}`);
  });

  console.log('\n✅ Phase 2 schema structure is ready for deployment!');
  console.log('📝 Next step: Deploy using Supabase Dashboard SQL Editor');

  console.log('\n🎯 To deploy manually:');
  console.log('1. Go to Supabase Dashboard > SQL Editor');
  console.log('2. Copy the migration file content');
  console.log('3. Execute in chunks to avoid timeouts');
  console.log('4. Verify tables are created successfully');

  return true;
}

// Run the deployment preparation
deployPhase2Schema().catch(console.error);