-- CAO Salary System Implementation
-- Generated: 2025-10-03
-- Purpose: Dutch CAO salary scale system with temporal support

-- =============================================
-- 1. CAO SALARY SCALES TABLE
-- =============================================

CREATE TABLE public.cao_salary_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_number INTEGER NOT NULL,
  scale_name TEXT NOT NULL,
  scale_category TEXT,
  min_trede INTEGER NOT NULL,
  max_trede INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_scale_range CHECK (scale_number > 0 AND scale_number <= 20),
  CONSTRAINT valid_trede_range CHECK (min_trede <= max_trede),
  CONSTRAINT unique_scale_number UNIQUE (scale_number)
);

-- =============================================
-- 2. CAO SALARY RATES TABLE
-- =============================================

CREATE TABLE public.cao_salary_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_number INTEGER NOT NULL,
  trede INTEGER NOT NULL,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  bruto_36h_monthly DECIMAL(10,2) NOT NULL,
  bruto_40h_monthly DECIMAL(10,2),
  hourly_rate DECIMAL(8,4),
  annual_salary DECIMAL(12,2),

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  source TEXT DEFAULT 'manual',

  -- Constraints
  CONSTRAINT positive_salary CHECK (bruto_36h_monthly > 0),
  CONSTRAINT valid_date_range CHECK (expiry_date IS NULL OR expiry_date > effective_date),
  CONSTRAINT valid_trede CHECK (trede > 0),

  -- Unique constraint: one rate per scale/trede/effective_date
  UNIQUE(scale_number, trede, effective_date)
);

-- =============================================
-- 3. PERFORMANCE INDEXES
-- =============================================

-- Primary lookup indexes
CREATE INDEX idx_cao_rates_scale_trede_date ON cao_salary_rates(scale_number, trede, effective_date DESC);
CREATE INDEX idx_cao_rates_effective_date ON cao_salary_rates(effective_date DESC);
CREATE INDEX idx_cao_rates_salary_reverse ON cao_salary_rates(bruto_36h_monthly, scale_number, effective_date DESC);

-- Active rates optimization
CREATE INDEX idx_cao_rates_active_salary_lookup ON cao_salary_rates (bruto_36h_monthly, scale_number)
WHERE expiry_date IS NULL OR expiry_date > CURRENT_DATE;

-- Scale management
CREATE INDEX idx_cao_scales_active ON cao_salary_scales(scale_number) WHERE is_active = true;

-- =============================================
-- 4. DATABASE FUNCTIONS
-- =============================================

-- Primary lookup function
CREATE OR REPLACE FUNCTION get_cao_salary(
  p_scale INTEGER,
  p_trede INTEGER,
  p_effective_date DATE DEFAULT CURRENT_DATE
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  salary DECIMAL(10,2);
BEGIN
  SELECT bruto_36h_monthly INTO salary
  FROM cao_salary_rates
  WHERE scale_number = p_scale
    AND trede = p_trede
    AND effective_date <= p_effective_date
    AND (expiry_date IS NULL OR expiry_date > p_effective_date)
  ORDER BY effective_date DESC
  LIMIT 1;

  RETURN COALESCE(salary, 0);
END;
$$ LANGUAGE plpgsql;

-- Reverse lookup function with confidence scoring
CREATE OR REPLACE FUNCTION find_trede_by_salary_advanced(
  p_salary DECIMAL(10,2),
  p_effective_date DATE DEFAULT CURRENT_DATE,
  p_preferred_scales INTEGER[] DEFAULT NULL,
  p_tolerance_percentage DECIMAL(5,2) DEFAULT 5.0
) RETURNS TABLE(
  scale_number INTEGER,
  exact_trede INTEGER,
  nearest_trede INTEGER,
  cao_salary DECIMAL(10,2),
  salary_difference DECIMAL(10,2),
  difference_percentage DECIMAL(5,2),
  is_exact_match BOOLEAN,
  confidence_score INTEGER,
  match_rank INTEGER
) AS $$
DECLARE
  tolerance_amount DECIMAL(10,2);
BEGIN
  tolerance_amount := p_salary * (p_tolerance_percentage / 100.0);

  RETURN QUERY
  WITH salary_analysis AS (
    SELECT
      csr.scale_number,
      csr.trede,
      csr.bruto_36h_monthly,
      ABS(csr.bruto_36h_monthly - p_salary) as abs_difference,
      (csr.bruto_36h_monthly - p_salary) as signed_difference,
      (ABS(csr.bruto_36h_monthly - p_salary) / p_salary * 100) as difference_pct,
      (csr.bruto_36h_monthly = p_salary) as is_exact,
      css.scale_name,
      css.scale_category
    FROM cao_salary_rates csr
    JOIN cao_salary_scales css ON csr.scale_number = css.scale_number
    WHERE csr.effective_date <= p_effective_date
      AND (csr.expiry_date IS NULL OR csr.expiry_date > p_effective_date)
      AND css.is_active = true
      AND (p_preferred_scales IS NULL OR csr.scale_number = ANY(p_preferred_scales))
  ),
  ranked_matches AS (
    SELECT *,
      CASE
        WHEN is_exact THEN 100
        WHEN abs_difference <= tolerance_amount THEN 90 - (difference_pct * 2)::INTEGER
        WHEN abs_difference <= (tolerance_amount * 2) THEN 70 - (difference_pct)::INTEGER
        ELSE GREATEST(10, 50 - (difference_pct)::INTEGER)
      END as confidence,
      ROW_NUMBER() OVER (
        PARTITION BY scale_number
        ORDER BY abs_difference ASC, trede ASC
      ) as scale_rank,
      ROW_NUMBER() OVER (
        ORDER BY
          is_exact DESC,
          abs_difference ASC,
          scale_number ASC
      ) as global_rank
    FROM salary_analysis
  )
  SELECT
    rm.scale_number,
    CASE WHEN rm.is_exact THEN rm.trede ELSE NULL END as exact_trede,
    rm.trede as nearest_trede,
    rm.bruto_36h_monthly as cao_salary,
    rm.signed_difference as salary_difference,
    rm.difference_pct as difference_percentage,
    rm.is_exact as is_exact_match,
    rm.confidence as confidence_score,
    rm.global_rank as match_rank
  FROM ranked_matches rm
  WHERE rm.scale_rank = 1  -- Best match per scale
  ORDER BY rm.global_rank
  LIMIT 10;  -- Top 10 matches across all scales
END;
$$ LANGUAGE plpgsql;

-- Get available tredes for a scale
CREATE OR REPLACE FUNCTION get_available_tredes(
  p_scale INTEGER,
  p_effective_date DATE DEFAULT CURRENT_DATE
) RETURNS INTEGER[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT DISTINCT trede
    FROM cao_salary_rates
    WHERE scale_number = p_scale
      AND effective_date <= p_effective_date
      AND (expiry_date IS NULL OR expiry_date > p_effective_date)
    ORDER BY trede
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. MATERIALIZED VIEW FOR CACHING
-- =============================================

CREATE MATERIALIZED VIEW public.cao_salary_lookup_cache AS
SELECT
  scale_number,
  trede,
  effective_date,
  bruto_36h_monthly,
  LEAD(effective_date) OVER (
    PARTITION BY scale_number, trede
    ORDER BY effective_date
  ) as next_effective_date,
  -- Reverse lookup helper
  ROW_NUMBER() OVER (
    PARTITION BY scale_number, effective_date
    ORDER BY bruto_36h_monthly
  ) as salary_rank
FROM cao_salary_rates
WHERE expiry_date IS NULL OR expiry_date > CURRENT_DATE
ORDER BY scale_number, trede, effective_date;

-- Index on materialized view
CREATE INDEX idx_cao_cache_salary_lookup ON cao_salary_lookup_cache(bruto_36h_monthly, scale_number, effective_date);

-- Refresh trigger for materialized view
CREATE OR REPLACE FUNCTION refresh_cao_lookup_cache()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW cao_salary_lookup_cache;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cao_rates_changed
  AFTER INSERT OR UPDATE OR DELETE ON cao_salary_rates
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_cao_lookup_cache();

-- =============================================
-- 6. POPULATE SCALES TABLE
-- =============================================

INSERT INTO cao_salary_scales (scale_number, scale_name, scale_category, min_trede, max_trede, description) VALUES
(1, 'Schaal 1', 'Onderwijsondersteunend personeel', 1, 8, 'Basis ondersteunende functies'),
(2, 'Schaal 2', 'Onderwijsondersteunend personeel', 1, 10, 'Ervaren ondersteunende functies'),
(3, 'Schaal 3', 'Vakspecialist niveau 1', 1, 12, 'Gespecialiseerde ondersteunende functies'),
(4, 'Schaal 4', 'Vakspecialist niveau 2', 1, 15, 'Pedagogisch medewerker basis'),
(5, 'Schaal 5', 'Vakspecialist niveau 3', 1, 18, 'Pedagogisch medewerker ervaren'),
(6, 'Schaal 6', 'Vakspecialist niveau 4', 10, 23, 'Senior pedagogisch medewerker'),
(7, 'Schaal 7', 'Leidinggevend niveau 1', 15, 25, 'Groepsleiding/teamleider'),
(8, 'Schaal 8', 'Leidinggevend niveau 2', 18, 28, 'Locatiemanager/coordinator');

-- =============================================
-- 7. MIGRATE EXISTING SALARYABLE.TS DATA
-- =============================================

-- Scale 6 data from salaryTable.ts
INSERT INTO cao_salary_rates (scale_number, trede, effective_date, bruto_36h_monthly, annual_salary, hourly_rate) VALUES
-- 2025-01-01 rates
(6, 10, '2025-01-01', 2577.00, 30924.00, 17.62),
(6, 11, '2025-01-01', 2642.00, 31704.00, 18.07),
(6, 12, '2025-01-01', 2709.00, 32508.00, 18.52),
(6, 13, '2025-01-01', 2777.00, 33324.00, 18.98),
(6, 14, '2025-01-01', 2844.00, 34128.00, 19.44),
(6, 15, '2025-01-01', 2917.00, 35004.00, 19.95),
(6, 16, '2025-01-01', 2990.00, 35880.00, 20.45),
(6, 17, '2025-01-01', 3061.00, 36732.00, 20.93),
(6, 18, '2025-01-01', 3135.00, 37620.00, 21.42),
(6, 19, '2025-01-01', 3211.00, 38532.00, 21.95),
(6, 20, '2025-01-01', 3292.00, 39504.00, 22.51),
(6, 21, '2025-01-01', 3371.00, 40452.00, 23.05),
(6, 22, '2025-01-01', 3450.00, 41400.00, 23.58),
(6, 23, '2025-01-01', 3541.00, 42492.00, 24.21),

-- 2025-07-01 rates (salary increase)
(6, 10, '2025-07-01', 2641.00, 31692.00, 18.06),
(6, 11, '2025-07-01', 2708.00, 32496.00, 18.51),
(6, 12, '2025-07-01', 2777.00, 33324.00, 18.98),
(6, 13, '2025-07-01', 2846.00, 34152.00, 19.46),
(6, 14, '2025-07-01', 2915.00, 34980.00, 19.93),
(6, 15, '2025-07-01', 2990.00, 35880.00, 20.45),
(6, 16, '2025-07-01', 3065.00, 36780.00, 20.96),
(6, 17, '2025-07-01', 3138.00, 37656.00, 21.46),
(6, 18, '2025-07-01', 3213.00, 38556.00, 21.97),
(6, 19, '2025-07-01', 3291.00, 39492.00, 22.51),
(6, 20, '2025-07-01', 3374.00, 40488.00, 23.07),
(6, 21, '2025-07-01', 3455.00, 41460.00, 23.62),
(6, 22, '2025-07-01', 3536.00, 42432.00, 24.17),
(6, 23, '2025-07-01', 3630.00, 43560.00, 24.81),

-- 2026-01-01 rates (same as 2025-07-01)
(6, 10, '2026-01-01', 2641.00, 31692.00, 18.06),
(6, 11, '2026-01-01', 2708.00, 32496.00, 18.51),
(6, 12, '2026-01-01', 2777.00, 33324.00, 18.98),
(6, 13, '2026-01-01', 2846.00, 34152.00, 19.46),
(6, 14, '2026-01-01', 2915.00, 34980.00, 19.93),
(6, 15, '2026-01-01', 2990.00, 35880.00, 20.45),
(6, 16, '2026-01-01', 3065.00, 36780.00, 20.96),
(6, 17, '2026-01-01', 3138.00, 37656.00, 21.46),
(6, 18, '2026-01-01', 3213.00, 38556.00, 21.97),
(6, 19, '2026-01-01', 3291.00, 39492.00, 22.51),
(6, 20, '2026-01-01', 3374.00, 40488.00, 23.07),
(6, 21, '2026-01-01', 3455.00, 41460.00, 23.62),
(6, 22, '2026-01-01', 3536.00, 42432.00, 24.17),
(6, 23, '2026-01-01', 3630.00, 43560.00, 24.81),

-- 2026-09-01 rates (final increase)
(6, 10, '2026-09-01', 2681.00, 32172.00, 18.33),
(6, 11, '2026-09-01', 2749.00, 32988.00, 18.80),
(6, 12, '2026-09-01', 2819.00, 33828.00, 19.28),
(6, 13, '2026-09-01', 2889.00, 34668.00, 19.75),
(6, 14, '2026-09-01', 2959.00, 35508.00, 20.23),
(6, 15, '2026-09-01', 3035.00, 36420.00, 20.75),
(6, 16, '2026-09-01', 3111.00, 37332.00, 21.27),
(6, 17, '2026-09-01', 3185.00, 38220.00, 21.78),
(6, 18, '2026-09-01', 3261.00, 39132.00, 22.30),
(6, 19, '2026-09-01', 3340.00, 40080.00, 22.84),
(6, 20, '2026-09-01', 3425.00, 41100.00, 23.42),
(6, 21, '2026-09-01', 3507.00, 42084.00, 23.98),
(6, 22, '2026-09-01', 3589.00, 43068.00, 24.55),
(6, 23, '2026-09-01', 3684.00, 44208.00, 25.19);

-- =============================================
-- 8. REFRESH MATERIALIZED VIEW
-- =============================================

REFRESH MATERIALIZED VIEW cao_salary_lookup_cache;

-- =============================================
-- 9. GRANT PERMISSIONS
-- =============================================

-- Grant access to authenticated users
GRANT SELECT ON cao_salary_scales TO authenticated;
GRANT SELECT ON cao_salary_rates TO authenticated;
GRANT SELECT ON cao_salary_lookup_cache TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_cao_salary TO authenticated;
GRANT EXECUTE ON FUNCTION find_trede_by_salary_advanced TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_tredes TO authenticated;

-- Admin users can modify CAO data
GRANT ALL ON cao_salary_scales TO service_role;
GRANT ALL ON cao_salary_rates TO service_role;

-- =============================================
-- 10. VALIDATION QUERIES
-- =============================================

-- Test basic lookup
-- SELECT get_cao_salary(6, 13, '2025-01-01'); -- Should return 2777.00

-- Test reverse lookup
-- SELECT * FROM find_trede_by_salary_advanced(2777, '2025-01-01');

-- Test available tredes
-- SELECT get_available_tredes(6, '2025-01-01');

-- Verify data migration
-- SELECT COUNT(*) FROM cao_salary_rates WHERE scale_number = 6; -- Should return 56 records

COMMENT ON TABLE cao_salary_scales IS 'CAO salary scale definitions with trede ranges';
COMMENT ON TABLE cao_salary_rates IS 'Temporal CAO salary rates with effective dates';
COMMENT ON FUNCTION get_cao_salary IS 'Get CAO salary for scale/trede/date';
COMMENT ON FUNCTION find_trede_by_salary_advanced IS 'Reverse lookup: find trede for salary amount';
COMMENT ON FUNCTION get_available_tredes IS 'Get available trede numbers for a scale';