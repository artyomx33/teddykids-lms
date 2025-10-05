# CAO Salary Scale Database Design & Implementation Plan

## Current Structure Analysis

### Existing Implementation
The current system uses a hardcoded `salaryTable.ts` with the following structure:

```typescript
export const salaryTable = {
  schaal6: {
    '2025-01-01': { 10: 2577, 11: 2642, 12: 2709, 13: 2777, ... },
    '2025-07-01': { 10: 2641, 11: 2708, 12: 2777, 13: 2846, ... },
    '2026-01-01': { 10: 2641, 11: 2708, 12: 2777, 13: 2846, ... },
    '2026-09-01': { 10: 2681, 11: 2749, 12: 2819, 13: 2889, ... }
  }
};
```

**Key Insights:**
- **Scale 6 Only**: Currently only "schaal6" (Scale 6) is implemented
- **Date Periods**: 4 effective periods (2025-01-01, 2025-07-01, 2026-01-01, 2026-09-01)
- **Trede Range**: 10-23 for Scale 6
- **Salary Progression**: Regular increases across periods
- **Example**: Trede 13 = €2,777 (2025-01-01) → €2,889 (2026-09-01)

## Database Schema Design

### Primary Table: `cao_salary_scales`

```sql
CREATE TABLE public.cao_salary_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_number INTEGER NOT NULL,                    -- 1, 2, 3, 4, 5, 6, 7, 8, etc.
  scale_name TEXT NOT NULL,                         -- "Schaal 1", "Schaal 2", etc.
  scale_category TEXT,                              -- "onderwijsondersteuning", "vakspecialist", etc.
  min_trede INTEGER NOT NULL,                       -- Minimum trede for this scale
  max_trede INTEGER NOT NULL,                       -- Maximum trede for this scale
  description TEXT,                                 -- Scale description/requirements
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_scale_range CHECK (scale_number > 0 AND scale_number <= 20),
  CONSTRAINT valid_trede_range CHECK (min_trede <= max_trede)
);
```

### Core Table: `cao_salary_rates`

```sql
CREATE TABLE public.cao_salary_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_number INTEGER NOT NULL,                    -- References scale
  trede INTEGER NOT NULL,                           -- Step number within scale
  effective_date DATE NOT NULL,                     -- When this rate becomes effective
  expiry_date DATE,                                 -- When this rate expires (NULL = current)
  bruto_36h_monthly DECIMAL(10,2) NOT NULL,        -- Gross monthly salary for 36h/week
  bruto_40h_monthly DECIMAL(10,2),                 -- Optional: Gross monthly for 40h/week
  hourly_rate DECIMAL(8,4),                        -- Calculated hourly rate
  annual_salary DECIMAL(12,2),                     -- Annual salary (bruto_36h * 12)

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,                                  -- Who entered this data
  source TEXT DEFAULT 'manual',                    -- 'manual', 'cao_import', 'government_update'

  -- Constraints
  CONSTRAINT positive_salary CHECK (bruto_36h_monthly > 0),
  CONSTRAINT valid_date_range CHECK (expiry_date IS NULL OR expiry_date > effective_date),
  CONSTRAINT valid_trede CHECK (trede > 0),

  -- Unique constraint: one rate per scale/trede/effective_date
  UNIQUE(scale_number, trede, effective_date)
);
```

### Optimization Table: `cao_salary_lookup_cache`

```sql
-- Materialized view for fast lookups
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

-- Refresh trigger
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
```

### Indexes for Performance

```sql
-- Primary lookup indexes
CREATE INDEX idx_cao_rates_scale_trede_date ON cao_salary_rates(scale_number, trede, effective_date DESC);
CREATE INDEX idx_cao_rates_effective_date ON cao_salary_rates(effective_date DESC);
CREATE INDEX idx_cao_rates_salary_reverse ON cao_salary_rates(bruto_36h_monthly, scale_number, effective_date DESC);

-- Reverse lookup optimization
CREATE INDEX idx_cao_cache_salary_lookup ON cao_salary_lookup_cache(bruto_36h_monthly, scale_number, effective_date);
```

## Data Migration Strategy

### Step 1: Populate Scales Table

```sql
INSERT INTO cao_salary_scales (scale_number, scale_name, scale_category, min_trede, max_trede, description) VALUES
(1, 'Schaal 1', 'Onderwijsondersteunend personeel', 1, 8, 'Basis ondersteunende functies'),
(2, 'Schaal 2', 'Onderwijsondersteunend personeel', 1, 10, 'Ervaren ondersteunende functies'),
(3, 'Schaal 3', 'Vakspecialist niveau 1', 1, 12, 'Gespecialiseerde ondersteunende functies'),
(4, 'Schaal 4', 'Vakspecialist niveau 2', 1, 15, 'Pedagogisch medewerker basis'),
(5, 'Schaal 5', 'Vakspecialist niveau 3', 1, 18, 'Pedagogisch medewerker ervaren'),
(6, 'Schaal 6', 'Vakspecialist niveau 4', 10, 23, 'Senior pedagogisch medewerker'),
(7, 'Schaal 7', 'Leidinggevend niveau 1', 15, 25, 'Groepsleiding/teamleider'),
(8, 'Schaal 8', 'Leidinggevend niveau 2', 18, 28, 'Locatiemanager/coordinator');
```

### Step 2: Migrate Existing Data

```sql
-- Migrate current salaryTable.ts data
INSERT INTO cao_salary_rates (scale_number, trede, effective_date, bruto_36h_monthly) VALUES
-- Scale 6, 2025-01-01
(6, 10, '2025-01-01', 2577.00),
(6, 11, '2025-01-01', 2642.00),
(6, 12, '2025-01-01', 2709.00),
(6, 13, '2025-01-01', 2777.00),
(6, 14, '2025-01-01', 2844.00),
(6, 15, '2025-01-01', 2917.00),
(6, 16, '2025-01-01', 2990.00),
(6, 17, '2025-01-01', 3061.00),
(6, 18, '2025-01-01', 3135.00),
(6, 19, '2025-01-01', 3211.00),
(6, 20, '2025-01-01', 3292.00),
(6, 21, '2025-01-01', 3371.00),
(6, 22, '2025-01-01', 3450.00),
(6, 23, '2025-01-01', 3541.00),

-- Scale 6, 2025-07-01 (salary increase)
(6, 10, '2025-07-01', 2641.00),
(6, 11, '2025-07-01', 2708.00),
(6, 12, '2025-07-01', 2777.00),
(6, 13, '2025-07-01', 2846.00),
(6, 14, '2025-07-01', 2915.00),
(6, 15, '2025-07-01', 2990.00),
(6, 16, '2025-07-01', 3065.00),
(6, 17, '2025-07-01', 3138.00),
(6, 18, '2025-07-01', 3213.00),
(6, 19, '2025-07-01', 3291.00),
(6, 20, '2025-07-01', 3374.00),
(6, 21, '2025-07-01', 3455.00),
(6, 22, '2025-07-01', 3536.00),
(6, 23, '2025-07-01', 3630.00),

-- Scale 6, 2026-01-01 (same as 2025-07-01)
(6, 10, '2026-01-01', 2641.00),
(6, 11, '2026-01-01', 2708.00),
(6, 12, '2026-01-01', 2777.00),
(6, 13, '2026-01-01', 2846.00),
(6, 14, '2026-01-01', 2915.00),
(6, 15, '2026-01-01', 2990.00),
(6, 16, '2026-01-01', 3065.00),
(6, 17, '2026-01-01', 3138.00),
(6, 18, '2026-01-01', 3213.00),
(6, 19, '2026-01-01', 3291.00),
(6, 20, '2026-01-01', 3374.00),
(6, 21, '2026-01-01', 3455.00),
(6, 22, '2026-01-01', 3536.00),
(6, 23, '2026-01-01', 3630.00),

-- Scale 6, 2026-09-01 (final increase)
(6, 10, '2026-09-01', 2681.00),
(6, 11, '2026-09-01', 2749.00),
(6, 12, '2026-09-01', 2819.00),
(6, 13, '2026-09-01', 2889.00),
(6, 14, '2026-09-01', 2959.00),
(6, 15, '2026-09-01', 3035.00),
(6, 16, '2026-09-01', 3111.00),
(6, 17, '2026-09-01', 3185.00),
(6, 18, '2026-09-01', 3261.00),
(6, 19, '2026-09-01', 3340.00),
(6, 20, '2026-09-01', 3425.00),
(6, 21, '2026-09-01', 3507.00),
(6, 22, '2026-09-01', 3589.00),
(6, 23, '2026-09-01', 3684.00);
```

## API Functions Design

### Core Lookup Functions

```typescript
// Enhanced CAO service
interface CaoLookupService {
  // Primary lookup: Get salary for scale/trede/date
  getSalaryByDate(scale: number, trede: number, effectiveDate: string): Promise<number>;

  // Reverse lookup: Find trede for given salary
  findTredeByUalary(salary: number, scale: number, effectiveDate: string): Promise<{
    exactTrede?: number;
    nearestTrede: number;
    difference: number;
    isExactMatch: boolean;
  }>;

  // Get all available tredes for a scale
  getAvailableTredes(scale: number, effectiveDate?: string): Promise<number[]>;

  // Get all scales with their ranges
  getScaleDefinitions(): Promise<ScaleDefinition[]>;

  // Calculate gross monthly for different hour contracts
  calculateGrossMonthly(scale: number, trede: number, hoursPerWeek: number, effectiveDate: string): Promise<number>;

  // Get salary progression timeline
  getSalaryProgression(scale: number, trede: number): Promise<SalaryProgression[]>;
}
```

### Database Functions

```sql
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

-- Reverse lookup function
CREATE OR REPLACE FUNCTION find_trede_by_salary(
  p_salary DECIMAL(10,2),
  p_scale INTEGER,
  p_effective_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE(
  exact_trede INTEGER,
  nearest_trede INTEGER,
  salary_difference DECIMAL(10,2),
  is_exact_match BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH salary_matches AS (
    SELECT
      csr.trede,
      csr.bruto_36h_monthly,
      ABS(csr.bruto_36h_monthly - p_salary) as diff,
      (csr.bruto_36h_monthly = p_salary) as exact_match
    FROM cao_salary_rates csr
    WHERE csr.scale_number = p_scale
      AND csr.effective_date <= p_effective_date
      AND (csr.expiry_date IS NULL OR csr.expiry_date > p_effective_date)
  ),
  ranked_matches AS (
    SELECT *,
      ROW_NUMBER() OVER (ORDER BY diff ASC) as rank
    FROM salary_matches
  )
  SELECT
    CASE WHEN exact_match THEN trede ELSE NULL END as exact_trede,
    trede as nearest_trede,
    diff as salary_difference,
    exact_match as is_exact_match
  FROM ranked_matches
  WHERE rank = 1;
END;
$$ LANGUAGE plpgsql;
```

## UI/UX Implementation Plan

### Salary Creation Interface

```typescript
interface SalaryCreationForm {
  // Current fields
  amount: number;
  effectiveDate: string;

  // New CAO integration fields
  caoAssisted: boolean;
  selectedScale?: number;
  selectedTrede?: number;
  caoCalculatedAmount?: number;
  manualOverride?: boolean;

  // Display fields
  tredeDetection?: {
    detectedTrede: number;
    isExactMatch: boolean;
    difference: number;
    confidence: 'high' | 'medium' | 'low';
  };
}
```

### Component Design

```typescript
// CAO Scale Selector Component
const CaoScaleSelector = () => {
  const [selectedScale, setSelectedScale] = useState<number>();
  const [selectedTrede, setSelectedTrede] = useState<number>();
  const [calculatedSalary, setCalculatedSalary] = useState<number>();

  // When scale/trede changes, calculate salary
  useEffect(() => {
    if (selectedScale && selectedTrede) {
      calculateCaoSalary(selectedScale, selectedTrede, effectiveDate)
        .then(setCalculatedSalary);
    }
  }, [selectedScale, selectedTrede, effectiveDate]);

  return (
    <div className="cao-selector">
      <ScaleDropdown value={selectedScale} onChange={setSelectedScale} />
      <TredeDropdown scale={selectedScale} value={selectedTrede} onChange={setSelectedTrede} />
      <SalaryDisplay amount={calculatedSalary} />
      <OverrideToggle />
    </div>
  );
};

// Reverse Lookup Component (vlookup equivalent)
const SalaryTredeDetector = ({ salary, effectiveDate }: { salary: number, effectiveDate: string }) => {
  const { data: detection } = useQuery({
    queryKey: ['trede-detection', salary, effectiveDate],
    queryFn: () => detectTredeFromSalary(salary, effectiveDate),
    enabled: !!salary && salary > 0
  });

  if (!detection) return null;

  return (
    <div className="trede-detection">
      <h4>CAO Analysis</h4>
      {detection.isExactMatch ? (
        <div className="exact-match">
          ✅ Exact match: Scale {detection.scale}, Trede {detection.exactTrede}
        </div>
      ) : (
        <div className="nearest-match">
          🔍 Closest match: Scale {detection.scale}, Trede {detection.nearestTrede}
          <span className="difference">({detection.difference > 0 ? '+' : ''}€{detection.difference})</span>
        </div>
      )}
    </div>
  );
};
```

## Implementation Roadmap

### Phase 1: Database Foundation (Week 1)
1. **Create database tables** (`cao_salary_scales`, `cao_salary_rates`)
2. **Migrate existing data** from `salaryTable.ts`
3. **Create database functions** (lookup, reverse lookup)
4. **Add indexes** for performance
5. **Create materialized view** for caching

### Phase 2: API Layer (Week 1-2)
1. **Create CaoService** class with all lookup functions
2. **Add reverse lookup** functionality
3. **Create React hooks** for CAO operations
4. **Test integration** with existing cao.ts functions
5. **Add TypeScript types** for all CAO operations

### Phase 3: UI Integration (Week 2-3)
1. **Create CAO selector components**
2. **Add salary detection/vlookup component**
3. **Integrate with salary creation forms**
4. **Add override functionality**
5. **Create scale/trede visualization**

### Phase 4: Advanced Features (Week 3-4)
1. **Salary progression charts**
2. **CAO compliance validation**
3. **Bulk salary updates** based on CAO changes
4. **Historical salary comparison**
5. **Export/import CAO data**

### Phase 5: Integration & Testing (Week 4)
1. **Integration with Employes.nl data**
2. **Comprehensive testing**
3. **Performance optimization**
4. **Documentation and training**

## Expected Outcomes

### User Experience Improvements
- **Guided Salary Creation**: Select scale → trede → auto-calculate salary
- **Intelligent Detection**: Enter salary → see detected trede/scale
- **Override Flexibility**: Manual override capability when needed
- **Compliance Assurance**: Built-in CAO compliance validation

### Technical Benefits
- **Centralized CAO Data**: Single source of truth in database
- **Temporal Accuracy**: Correct salaries for different effective dates
- **Performance Optimized**: Fast lookups with materialized views
- **Audit Trail**: Complete history of CAO changes and usage

### Business Value
- **Legal Compliance**: Automatic Dutch labor law compliance
- **Consistency**: Standardized salary determination
- **Efficiency**: Reduced manual salary calculation errors
- **Transparency**: Clear salary progression paths for staff

This comprehensive CAO system will transform salary management from manual calculation to intelligent, compliant, and user-friendly automation while maintaining full override capabilities for special cases.