# CAO Reverse Lookup System (VLookup Functionality)

## Overview

The reverse lookup system enables intelligent salary analysis by determining the appropriate CAO scale and trede based on a given salary amount. This "VLookup" functionality provides instant feedback on salary compliance and positioning within Dutch labor agreements.

## Core Algorithm Design

### 1. Multi-Dimensional Lookup Strategy

```typescript
interface ReverseLookupEngine {
  // Primary reverse lookup function
  findTredeByUalary(
    salary: number,
    effectiveDate: string,
    searchCriteria?: SearchCriteria
  ): Promise<TredeDetectionResult>;

  // Bulk analysis for multiple salaries
  analyzeSalaryBatch(
    salaries: SalaryAnalysisRequest[]
  ): Promise<BatchAnalysisResult>;

  // Confidence scoring system
  calculateConfidenceScore(
    salary: number,
    detectedScale: number,
    detectedTrede: number,
    effectiveDate: string
  ): Promise<ConfidenceScore>;
}

interface SearchCriteria {
  preferredScales?: number[];        // Limit search to specific scales
  tolerancePercentage?: number;      // Acceptable variance (default: 5%)
  includeHistoricalRates?: boolean;  // Search older CAO periods
  prioritizeExactMatches?: boolean;  // Weight exact matches higher
}

interface TredeDetectionResult {
  // Primary match information
  scale: number;
  exactTrede?: number;               // Only if perfect match
  nearestTrede: number;
  salaryDifference: number;          // Positive = over CAO, negative = under CAO
  isExactMatch: boolean;

  // Confidence and alternatives
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;           // 0-100
  alternativeMatches: AlternativeMatch[];

  // Additional context
  scaleInfo: ScaleDefinition;
  effectiveDate: string;
  caoSalaryAmount: number;           // The CAO amount for detected trede

  // Compliance analysis
  complianceStatus: 'compliant' | 'over_cao' | 'under_cao' | 'unknown';
  complianceNotes: string[];
}

interface AlternativeMatch {
  scale: number;
  trede: number;
  salary: number;
  difference: number;
  confidenceScore: number;
}
```

### 2. Database Optimization for Reverse Lookup

```sql
-- Optimized reverse lookup function with performance tuning
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

-- Performance index for reverse lookup
CREATE INDEX CONCURRENTLY idx_cao_rates_salary_reverse_lookup
ON cao_salary_rates USING btree (bruto_36h_monthly, scale_number, effective_date DESC);

-- Partial index for active rates only
CREATE INDEX CONCURRENTLY idx_cao_rates_active_salary_lookup
ON cao_salary_rates (bruto_36h_monthly, scale_number)
WHERE expiry_date IS NULL OR expiry_date > CURRENT_DATE;
```

### 3. Advanced Matching Algorithm

```typescript
class CaoReverseLookupEngine {
  private readonly CONFIDENCE_THRESHOLDS = {
    HIGH: 85,
    MEDIUM: 60,
    LOW: 30
  };

  private readonly TOLERANCE_LEVELS = {
    EXACT: 0,
    STRICT: 2.5,   // 2.5% tolerance
    NORMAL: 5.0,   // 5% tolerance
    LOOSE: 10.0    // 10% tolerance
  };

  async findTredeByUalary(
    salary: number,
    effectiveDate: string,
    criteria: SearchCriteria = {}
  ): Promise<TredeDetectionResult> {
    // Step 1: Database reverse lookup
    const matches = await this.performDatabaseLookup(salary, effectiveDate, criteria);

    // Step 2: Apply business logic scoring
    const scoredMatches = await this.applyBusinessLogicScoring(matches, salary, criteria);

    // Step 3: Select best match
    const bestMatch = this.selectBestMatch(scoredMatches);

    // Step 4: Generate alternatives
    const alternatives = this.generateAlternatives(scoredMatches, bestMatch);

    // Step 5: Compile comprehensive result
    return this.compileDetectionResult(bestMatch, alternatives, salary, effectiveDate);
  }

  private async performDatabaseLookup(
    salary: number,
    effectiveDate: string,
    criteria: SearchCriteria
  ): Promise<DatabaseMatch[]> {
    const tolerance = criteria.tolerancePercentage || this.TOLERANCE_LEVELS.NORMAL;

    const { data, error } = await supabase.rpc('find_trede_by_salary_advanced', {
      p_salary: salary,
      p_effective_date: effectiveDate,
      p_preferred_scales: criteria.preferredScales || null,
      p_tolerance_percentage: tolerance
    });

    if (error) throw new Error(`Database lookup failed: ${error.message}`);
    return data;
  }

  private applyBusinessLogicScoring(
    matches: DatabaseMatch[],
    salary: number,
    criteria: SearchCriteria
  ): ScoredMatch[] {
    return matches.map(match => {
      let adjustedScore = match.confidence_score;

      // Boost exact matches
      if (match.is_exact_match && criteria.prioritizeExactMatches) {
        adjustedScore = Math.min(100, adjustedScore + 10);
      }

      // Penalize extreme over/under CAO
      const overagePercent = Math.abs(match.difference_percentage);
      if (overagePercent > 15) {
        adjustedScore = Math.max(10, adjustedScore - 20);
      } else if (overagePercent > 10) {
        adjustedScore = Math.max(20, adjustedScore - 10);
      }

      // Boost common scales (6, 7, 8 are most common in kinderopvang)
      if ([6, 7, 8].includes(match.scale_number)) {
        adjustedScore = Math.min(100, adjustedScore + 5);
      }

      return {
        ...match,
        adjusted_confidence: adjustedScore,
        business_logic_applied: true
      };
    });
  }

  private selectBestMatch(scoredMatches: ScoredMatch[]): ScoredMatch {
    // Prioritize exact matches first
    const exactMatches = scoredMatches.filter(m => m.is_exact_match);
    if (exactMatches.length > 0) {
      return exactMatches.sort((a, b) => b.adjusted_confidence - a.adjusted_confidence)[0];
    }

    // Otherwise select highest scoring match
    return scoredMatches.sort((a, b) => b.adjusted_confidence - a.adjusted_confidence)[0];
  }

  private generateAlternatives(
    scoredMatches: ScoredMatch[],
    bestMatch: ScoredMatch
  ): AlternativeMatch[] {
    return scoredMatches
      .filter(m => m.scale_number !== bestMatch.scale_number || m.nearest_trede !== bestMatch.nearest_trede)
      .slice(0, 3)  // Top 3 alternatives
      .map(m => ({
        scale: m.scale_number,
        trede: m.nearest_trede,
        salary: m.cao_salary,
        difference: m.salary_difference,
        confidenceScore: m.adjusted_confidence
      }));
  }

  private async compileDetectionResult(
    bestMatch: ScoredMatch,
    alternatives: AlternativeMatch[],
    inputSalary: number,
    effectiveDate: string
  ): Promise<TredeDetectionResult> {
    // Get scale information
    const scaleInfo = await this.getScaleInfo(bestMatch.scale_number);

    // Determine confidence level
    const confidence = this.determineConfidenceLevel(bestMatch.adjusted_confidence);

    // Analyze compliance
    const complianceAnalysis = this.analyzeCompliance(bestMatch, inputSalary);

    return {
      scale: bestMatch.scale_number,
      exactTrede: bestMatch.is_exact_match ? bestMatch.nearest_trede : undefined,
      nearestTrede: bestMatch.nearest_trede,
      salaryDifference: bestMatch.salary_difference,
      isExactMatch: bestMatch.is_exact_match,
      confidence,
      confidenceScore: bestMatch.adjusted_confidence,
      alternativeMatches: alternatives,
      scaleInfo,
      effectiveDate,
      caoSalaryAmount: bestMatch.cao_salary,
      complianceStatus: complianceAnalysis.status,
      complianceNotes: complianceAnalysis.notes
    };
  }

  private determineConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= this.CONFIDENCE_THRESHOLDS.HIGH) return 'high';
    if (score >= this.CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  }

  private analyzeCompliance(match: ScoredMatch, inputSalary: number): ComplianceAnalysis {
    const difference = match.salary_difference;
    const percentDiff = Math.abs(match.difference_percentage);

    if (match.is_exact_match) {
      return {
        status: 'compliant',
        notes: ['Salary exactly matches CAO rate']
      };
    }

    if (difference > 0) {
      // Salary is above CAO
      if (percentDiff <= 5) {
        return {
          status: 'compliant',
          notes: ['Salary slightly above CAO (within acceptable range)']
        };
      } else if (percentDiff <= 15) {
        return {
          status: 'over_cao',
          notes: [
            'Salary significantly above CAO rate',
            'Verify if premium is justified (experience, qualifications, market conditions)'
          ]
        };
      } else {
        return {
          status: 'over_cao',
          notes: [
            'Salary substantially above CAO rate',
            'Review required for compliance',
            'Document justification for premium'
          ]
        };
      }
    } else {
      // Salary is below CAO
      if (percentDiff <= 2) {
        return {
          status: 'compliant',
          notes: ['Salary slightly below CAO (likely rounding difference)']
        };
      } else {
        return {
          status: 'under_cao',
          notes: [
            'Salary below minimum CAO rate',
            'May violate labor agreement',
            'Consider salary adjustment'
          ]
        };
      }
    }
  }
}
```

### 4. Batch Analysis for Employes.nl Integration

```typescript
class BatchSalaryAnalyzer {
  async analyzeEmployesSalaries(
    employeeData: EmployesEmployeeData[]
  ): Promise<BatchAnalysisResult> {
    const analyses = await Promise.all(
      employeeData.map(async (employee) => {
        const detection = await this.reverseLookupEngine.findTredeByUalary(
          employee.current_salary,
          employee.contract_start_date
        );

        return {
          employeeId: employee.id,
          employeeName: `${employee.first_name} ${employee.surname}`,
          currentSalary: employee.current_salary,
          detection,
          recommendations: this.generateRecommendations(detection, employee)
        };
      })
    );

    return this.compileBatchResults(analyses);
  }

  private generateRecommendations(
    detection: TredeDetectionResult,
    employee: EmployesEmployeeData
  ): SalaryRecommendation[] {
    const recommendations: SalaryRecommendation[] = [];

    // Compliance recommendations
    if (detection.complianceStatus === 'under_cao') {
      recommendations.push({
        type: 'compliance_issue',
        priority: 'high',
        title: 'Salary below CAO minimum',
        description: `Current salary of €${employee.current_salary} is below CAO rate of €${detection.caoSalaryAmount} for Scale ${detection.scale}, Trede ${detection.nearestTrede}`,
        action: 'salary_increase',
        suggestedAmount: detection.caoSalaryAmount
      });
    }

    // Progression recommendations
    const nextTredeSalary = this.calculateNextTredeSalary(detection);
    if (nextTredeSalary && detection.confidence === 'high') {
      recommendations.push({
        type: 'progression_opportunity',
        priority: 'medium',
        title: 'Potential trede progression',
        description: `Consider promotion to Trede ${detection.nearestTrede + 1} (€${nextTredeSalary})`,
        action: 'trede_progression',
        suggestedAmount: nextTredeSalary
      });
    }

    return recommendations;
  }

  private compileBatchResults(analyses: EmployeeAnalysis[]): BatchAnalysisResult {
    const complianceIssues = analyses.filter(a => a.detection.complianceStatus !== 'compliant');
    const exactMatches = analyses.filter(a => a.detection.isExactMatch);

    return {
      totalAnalyzed: analyses.length,
      exactMatches: exactMatches.length,
      complianceIssues: complianceIssues.length,
      averageConfidence: this.calculateAverageConfidence(analyses),
      analyses,
      summary: {
        compliant: analyses.filter(a => a.detection.complianceStatus === 'compliant').length,
        overCao: analyses.filter(a => a.detection.complianceStatus === 'over_cao').length,
        underCao: analyses.filter(a => a.detection.complianceStatus === 'under_cao').length,
        unknown: analyses.filter(a => a.detection.complianceStatus === 'unknown').length
      }
    };
  }
}
```

### 5. Performance Optimization & Caching

```typescript
class CaoLookupCache {
  private memoryCache = new Map<string, TredeDetectionResult>();
  private readonly CACHE_TTL = 1000 * 60 * 15; // 15 minutes

  async getCachedLookup(
    salary: number,
    effectiveDate: string,
    criteria: SearchCriteria = {}
  ): Promise<TredeDetectionResult | null> {
    const cacheKey = this.generateCacheKey(salary, effectiveDate, criteria);

    const cached = this.memoryCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    return null;
  }

  async setCachedLookup(
    salary: number,
    effectiveDate: string,
    criteria: SearchCriteria,
    result: TredeDetectionResult
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(salary, effectiveDate, criteria);

    const cachedResult = {
      ...result,
      _cached: true,
      _cacheTimestamp: Date.now()
    };

    this.memoryCache.set(cacheKey, cachedResult);

    // Prevent memory leaks - limit cache size
    if (this.memoryCache.size > 1000) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
  }

  private generateCacheKey(
    salary: number,
    effectiveDate: string,
    criteria: SearchCriteria
  ): string {
    return `${salary}-${effectiveDate}-${JSON.stringify(criteria)}`;
  }

  private isCacheValid(result: any): boolean {
    if (!result._cacheTimestamp) return false;
    return (Date.now() - result._cacheTimestamp) < this.CACHE_TTL;
  }
}
```

### 6. Real-time Lookup Hooks

```typescript
// React hook for real-time salary detection
export const useSalaryDetection = (
  salary: number,
  effectiveDate: string,
  options: {
    enabled?: boolean;
    preferredScales?: number[];
    tolerance?: number;
    debounceMs?: number;
  } = {}
) => {
  const {
    enabled = true,
    preferredScales,
    tolerance,
    debounceMs = 500
  } = options;

  const debouncedSalary = useDebounce(salary, debounceMs);

  return useQuery({
    queryKey: ['salary-detection', debouncedSalary, effectiveDate, preferredScales, tolerance],
    queryFn: async () => {
      if (!debouncedSalary || debouncedSalary <= 0) return null;

      const engine = new CaoReverseLookupEngine();
      return engine.findTredeByUalary(debouncedSalary, effectiveDate, {
        preferredScales,
        tolerancePercentage: tolerance
      });
    },
    enabled: enabled && !!debouncedSalary && debouncedSalary > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Hook for batch analysis
export const useBatchSalaryAnalysis = (employeeIds: string[]) => {
  return useQuery({
    queryKey: ['batch-salary-analysis', employeeIds],
    queryFn: async () => {
      const analyzer = new BatchSalaryAnalyzer();
      const employeeData = await fetchEmployeesBatch(employeeIds);
      return analyzer.analyzeEmployesSalaries(employeeData);
    },
    enabled: employeeIds.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
```

### 7. API Integration Points

```typescript
// REST API endpoints for reverse lookup
export const caoApiRoutes = {
  // Single salary lookup
  '/api/cao/reverse-lookup': {
    method: 'POST',
    body: {
      salary: number;
      effectiveDate: string;
      criteria?: SearchCriteria;
    },
    response: TredeDetectionResult
  },

  // Batch analysis
  '/api/cao/batch-analysis': {
    method: 'POST',
    body: {
      salaries: Array<{
        salary: number;
        effectiveDate: string;
        employeeId?: string;
      }>;
      criteria?: SearchCriteria;
    },
    response: BatchAnalysisResult
  },

  // Confidence validation
  '/api/cao/validate-detection': {
    method: 'POST',
    body: {
      salary: number;
      proposedScale: number;
      proposedTrede: number;
      effectiveDate: string;
    },
    response: {
      isValid: boolean;
      confidence: number;
      suggestions: string[];
    }
  }
};
```

This comprehensive reverse lookup system provides:

1. **Intelligent Multi-Dimensional Search** across scales, tredes, and time periods
2. **Advanced Confidence Scoring** with business logic application
3. **Performance Optimization** with caching and indexed database queries
4. **Batch Analysis Capabilities** for Employes.nl integration
5. **Real-time Detection Hooks** for responsive UI updates
6. **Compliance Analysis** with actionable recommendations
7. **Alternative Matching** for comprehensive salary positioning

The system transforms salary analysis from manual calculation to intelligent, automated compliance checking with detailed insights and recommendations.