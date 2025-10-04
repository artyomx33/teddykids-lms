-- Minimal Phase 2 Migration: Only Add Missing Pieces
-- Based on inspection: staff_reviews EXISTS, everything else MISSING

-- Step 1: Create missing tables ONLY

-- review_templates table
CREATE TABLE public.review_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  questions JSONB DEFAULT '[]',
  criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- review_schedules table
CREATE TABLE public.review_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id),
  template_id UUID REFERENCES public.review_templates(id),
  next_due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- review_notes table
CREATE TABLE public.review_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES public.staff_reviews(id),
  author_id UUID NOT NULL REFERENCES public.staff(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- performance_metrics table
CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id),
  review_id UUID REFERENCES public.staff_reviews(id),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Add missing columns to existing staff_reviews table
ALTER TABLE public.staff_reviews
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.review_templates(id);

ALTER TABLE public.staff_reviews
ADD COLUMN IF NOT EXISTS review_type TEXT DEFAULT 'performance';

ALTER TABLE public.staff_reviews
ADD COLUMN IF NOT EXISTS review_date DATE DEFAULT CURRENT_DATE;

ALTER TABLE public.staff_reviews
ADD COLUMN IF NOT EXISTS star_rating INTEGER;

ALTER TABLE public.staff_reviews
ADD COLUMN IF NOT EXISTS overall_score DECIMAL(3,2);

ALTER TABLE public.staff_reviews
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';

-- Step 3: Create essential views for Phase 2
CREATE VIEW public.staff_review_summary AS
SELECT
  s.id as staff_id,
  s.full_name,
  s.department,
  s.location,
  COUNT(sr.id) as total_reviews,
  AVG(sr.star_rating) as avg_star_rating,
  AVG(sr.overall_score) as avg_overall_score,
  COUNT(sr.id) FILTER (WHERE sr.star_rating = 5) as five_star_count,
  COUNT(sr.id) FILTER (WHERE sr.status = 'overdue') as overdue_count
FROM public.staff s
LEFT JOIN public.staff_reviews sr ON s.id = sr.staff_id
GROUP BY s.id, s.full_name, s.department, s.location;

-- Step 4: Enable RLS for new tables
ALTER TABLE public.review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Step 5: Basic RLS policies (read access for authenticated users)
CREATE POLICY "Allow read access" ON public.review_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access" ON public.review_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access" ON public.review_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access" ON public.performance_metrics FOR SELECT TO authenticated USING (true);

-- Step 6: Grant permissions
GRANT SELECT ON public.review_templates TO authenticated;
GRANT SELECT ON public.review_schedules TO authenticated;
GRANT SELECT ON public.review_notes TO authenticated;
GRANT SELECT ON public.performance_metrics TO authenticated;
GRANT SELECT ON public.staff_review_summary TO authenticated;