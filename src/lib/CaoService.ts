import { supabase } from '@/integrations/supabase/client';
import { salaryTable } from './salaryTable';

// =============================================
// TYPES & INTERFACES
// =============================================

export interface ScaleDefinition {
  scale_number: number;
  scale_name: string;
  scale_category: string;
  min_trede: number;
  max_trede: number;
  description?: string;
  is_active: boolean;
}

export interface TredeDetectionResult {
  scale: number;
  exactTrede?: number;
  nearestTrede: number;
  salaryDifference: number;
  isExactMatch: boolean;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;
  alternativeMatches: AlternativeMatch[];
  scaleInfo: ScaleDefinition;
  effectiveDate: string;
  caoSalaryAmount: number;
  complianceStatus: 'compliant' | 'over_cao' | 'under_cao' | 'unknown';
  complianceNotes: string[];
}

export interface AlternativeMatch {
  scale: number;
  trede: number;
  salary: number;
  difference: number;
  confidenceScore: number;
}

export interface SalaryProgression {
  effectiveDate: string;
  salary: number;
  trede: number;
  increase?: number;
  increasePercentage?: number;
}

export interface SearchCriteria {
  preferredScales?: number[];
  tolerancePercentage?: number;
  includeHistoricalRates?: boolean;
  prioritizeExactMatches?: boolean;
}

export interface CaoSelection {
  scale: number;
  trede: number;
  calculatedSalary: number;
  effectiveDate: string;
}

// =============================================
// CAO SERVICE CLASS
// =============================================

export class CaoService {
  private static readonly CONFIDENCE_THRESHOLDS = {
    HIGH: 85,
    MEDIUM: 60,
    LOW: 30
  };

  private static readonly TOLERANCE_LEVELS = {
    EXACT: 0,
    STRICT: 2.5,
    NORMAL: 5.0,
    LOOSE: 10.0
  };

  // =============================================
  // PRIMARY LOOKUP FUNCTIONS
  // =============================================

  /**
   * Get CAO salary for specific scale/trede/date
   */
  static async getSalaryByDate(
    scale: number,
    trede: number,
    effectiveDate: string
  ): Promise<number> {
    try {
      // Try database first (when migration is complete)
      const { data, error } = await supabase.rpc('get_cao_salary', {
        p_scale: scale,
        p_trede: trede,
        p_effective_date: effectiveDate
      });

      if (!error && data) {
        return Number(data);
      }

      // Fallback to salaryTable.ts
      return this.getSalaryFromStaticTable(scale, trede, effectiveDate);
    } catch (error) {
      console.warn('Database lookup failed, using fallback:', error);
      return this.getSalaryFromStaticTable(scale, trede, effectiveDate);
    }
  }

  /**
   * Fallback to existing salaryTable.ts logic
   */
  private static getSalaryFromStaticTable(
    scale: number,
    trede: number,
    effectiveDate: string
  ): number {
    const mappedScaleKey = scale === 6 ? 'schaal6' : '';
    if (!mappedScaleKey) return 0;

    const scaleObj = (salaryTable as any)[mappedScaleKey] as Record<
      string,
      Record<number, number>
    >;
    if (!scaleObj) return 0;

    const applicableKey = Object.keys(scaleObj)
      .filter((d) => d <= effectiveDate)
      .sort((a, b) => (a > b ? -1 : 1))[0];

    if (!applicableKey) return 0;

    const value = scaleObj[applicableKey][trede];
    return typeof value === 'number' ? value : 0;
  }

  /**
   * Get available scales
   */
  static async getScaleDefinitions(): Promise<ScaleDefinition[]> {
    try {
      const { data, error } = await supabase
        .from('cao_salary_scales')
        .select('*')
        .eq('is_active', true)
        .order('scale_number');

      if (!error && data) {
        return data;
      }

      console.warn('Database table not found or error, using fallback scales:', error);
      // Fallback to hardcoded scales
      return CaoService.getFallbackScaleDefinitions();
    } catch (error) {
      console.warn('Scale definitions lookup failed, using fallback:', error);
      return CaoService.getFallbackScaleDefinitions();
    }
  }

  private static getFallbackScaleDefinitions(): ScaleDefinition[] {
    return [
      {
        scale_number: 6,
        scale_name: 'Schaal 6',
        scale_category: 'Vakspecialist niveau 4',
        min_trede: 10,
        max_trede: 23,
        description: 'Senior pedagogisch medewerker',
        is_active: true
      }
    ];
  }

  /**
   * Get available tredes for a scale
   */
  static async getAvailableTredes(
    scale: number,
    effectiveDate?: string
  ): Promise<number[]> {
    try {
      const { data, error } = await supabase.rpc('get_available_tredes', {
        p_scale: scale,
        p_effective_date: effectiveDate || new Date().toISOString().split('T')[0]
      });

      if (!error && data) {
        return data;
      }

      // Fallback for scale 6
      if (scale === 6) {
        return Array.from({ length: 14 }, (_, i) => i + 10); // 10-23
      }

      return [];
    } catch (error) {
      console.warn('Tredes lookup failed, using fallback:', error);
      if (scale === 6) {
        return Array.from({ length: 14 }, (_, i) => i + 10);
      }
      return [];
    }
  }

  // =============================================
  // REVERSE LOOKUP (VLOOKUP FUNCTIONALITY)
  // =============================================

  /**
   * Find trede by salary amount (reverse lookup)
   */
  static async findTredeByUalary(
    salary: number,
    effectiveDate: string,
    criteria: SearchCriteria = {}
  ): Promise<TredeDetectionResult> {
    try {
      // Try database first
      const { data, error } = await supabase.rpc('find_trede_by_salary_advanced', {
        p_salary: salary,
        p_effective_date: effectiveDate,
        p_preferred_scales: criteria.preferredScales || null,
        p_tolerance_percentage: criteria.tolerancePercentage || 5.0
      });

      if (!error && data && data.length > 0) {
        return this.buildDetectionResultFromDatabase(data[0], salary, effectiveDate);
      }

      // Fallback to manual analysis
      return this.performManualReverseLookup(salary, effectiveDate, criteria);
    } catch (error) {
      console.warn('Database reverse lookup failed, using fallback:', error);
      return this.performManualReverseLookup(salary, effectiveDate, criteria);
    }
  }

  private static async buildDetectionResultFromDatabase(
    dbResult: any,
    inputSalary: number,
    effectiveDate: string
  ): Promise<TredeDetectionResult> {
    const scaleInfo = await this.getScaleInfo(dbResult.scale_number);

    return {
      scale: dbResult.scale_number,
      exactTrede: dbResult.exact_trede,
      nearestTrede: dbResult.nearest_trede,
      salaryDifference: Number(dbResult.salary_difference),
      isExactMatch: dbResult.is_exact_match,
      confidence: this.determineConfidenceLevel(dbResult.confidence_score),
      confidenceScore: dbResult.confidence_score,
      alternativeMatches: [], // TODO: Implement alternatives
      scaleInfo,
      effectiveDate,
      caoSalaryAmount: Number(dbResult.cao_salary),
      complianceStatus: this.analyzeCompliance(dbResult.salary_difference, dbResult.is_exact_match),
      complianceNotes: this.generateComplianceNotes(dbResult.salary_difference, dbResult.is_exact_match)
    };
  }

  private static async performManualReverseLookup(
    salary: number,
    effectiveDate: string,
    criteria: SearchCriteria
  ): Promise<TredeDetectionResult> {
    // Manual analysis for scale 6 using salaryTable.ts
    const scale = 6;
    const scaleData = (salaryTable as any).schaal6;

    if (!scaleData) {
      throw new Error('No salary data available for analysis');
    }

    // Find applicable date
    const applicableDate = Object.keys(scaleData)
      .filter(date => date <= effectiveDate)
      .sort()
      .pop();

    if (!applicableDate) {
      throw new Error('No applicable salary data for the given date');
    }

    const rates = scaleData[applicableDate];
    let bestMatch: { trede: number; salary: number; difference: number } | null = null;
    let exactMatch: number | null = null;

    // Find best match
    for (const [tredeStr, salaryAmount] of Object.entries(rates)) {
      const trede = parseInt(tredeStr);
      const salaryNum = Number(salaryAmount);
      const difference = Math.abs(salaryNum - salary);

      if (salaryNum === salary) {
        exactMatch = trede;
        bestMatch = { trede, salary: salaryNum, difference: 0 };
        break;
      }

      if (!bestMatch || difference < bestMatch.difference) {
        bestMatch = { trede, salary: salaryNum, difference };
      }
    }

    if (!bestMatch) {
      throw new Error('No salary match found');
    }

    const isExactMatch = exactMatch !== null;
    const salaryDifference = salary - bestMatch.salary;
    const scaleInfo = await this.getScaleInfo(scale);

    return {
      scale,
      exactTrede: exactMatch || undefined,
      nearestTrede: bestMatch.trede,
      salaryDifference,
      isExactMatch,
      confidence: this.calculateConfidence(bestMatch.difference, salary),
      confidenceScore: this.calculateConfidenceScore(bestMatch.difference, salary),
      alternativeMatches: [],
      scaleInfo,
      effectiveDate,
      caoSalaryAmount: bestMatch.salary,
      complianceStatus: this.analyzeCompliance(salaryDifference, isExactMatch),
      complianceNotes: this.generateComplianceNotes(salaryDifference, isExactMatch)
    };
  }

  // =============================================
  // HELPER FUNCTIONS
  // =============================================

  private static async getScaleInfo(scaleNumber: number): Promise<ScaleDefinition> {
    const scales = await this.getScaleDefinitions();
    return scales.find(s => s.scale_number === scaleNumber) || {
      scale_number: scaleNumber,
      scale_name: `Schaal ${scaleNumber}`,
      scale_category: 'Unknown',
      min_trede: 1,
      max_trede: 25,
      is_active: true
    };
  }

  private static determineConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= this.CONFIDENCE_THRESHOLDS.HIGH) return 'high';
    if (score >= this.CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  }

  private static calculateConfidence(difference: number, salary: number): 'high' | 'medium' | 'low' {
    const percentage = (difference / salary) * 100;
    if (percentage <= 2) return 'high';
    if (percentage <= 10) return 'medium';
    return 'low';
  }

  private static calculateConfidenceScore(difference: number, salary: number): number {
    const percentage = (difference / salary) * 100;
    return Math.max(0, Math.min(100, 100 - (percentage * 10)));
  }

  private static analyzeCompliance(difference: number, isExactMatch: boolean): 'compliant' | 'over_cao' | 'under_cao' | 'unknown' {
    if (isExactMatch) return 'compliant';
    if (difference > 0) return 'over_cao';
    if (difference < 0) return 'under_cao';
    return 'unknown';
  }

  private static generateComplianceNotes(difference: number, isExactMatch: boolean): string[] {
    const notes: string[] = [];

    if (isExactMatch) {
      notes.push('Salary exactly matches CAO rate');
    } else if (difference > 0) {
      notes.push('Salary above CAO rate');
      if (Math.abs(difference) > 500) {
        notes.push('Significant premium - verify justification');
      }
    } else {
      notes.push('Salary below CAO rate');
      notes.push('May require adjustment for compliance');
    }

    return notes;
  }

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  /**
   * Calculate gross monthly for different hour contracts
   */
  static calculateGrossMonthly(bruto36h: number, hoursPerWeek: number): number {
    if (!bruto36h || !hoursPerWeek) return 0;
    const result = bruto36h * (hoursPerWeek / 36);
    return Number(result.toFixed(2));
  }

  /**
   * Calculate travel allowance
   */
  static calculateReiskosten(km: number, hoursPerWeek: number): number {
    if (!km || km <= 0 || !hoursPerWeek) return 0;

    const daysPerWeek = Math.min(5, Math.ceil(hoursPerWeek / 8));
    const yearly = km * 0.23 * 2 * daysPerWeek * 46.5;
    return Number((yearly / 12).toFixed(2));
  }

  /**
   * Get salary progression timeline
   */
  static async getSalaryProgression(scale: number, trede: number): Promise<SalaryProgression[]> {
    const progression: SalaryProgression[] = [];

    // For scale 6, get all effective dates
    if (scale === 6) {
      const dates = ['2025-01-01', '2025-07-01', '2026-01-01', '2026-09-01'];

      for (const date of dates) {
        const salary = await this.getSalaryByDate(scale, trede, date);
        if (salary > 0) {
          const previousSalary = progression.length > 0 ? progression[progression.length - 1].salary : 0;
          const increase = previousSalary > 0 ? salary - previousSalary : 0;
          const increasePercentage = previousSalary > 0 ? ((increase / previousSalary) * 100) : 0;

          progression.push({
            effectiveDate: date,
            salary,
            trede,
            increase: increase > 0 ? increase : undefined,
            increasePercentage: increasePercentage > 0 ? Number(increasePercentage.toFixed(2)) : undefined
          });
        }
      }
    }

    return progression;
  }
}

// =============================================
// LEGACY COMPATIBILITY
// =============================================

// Maintain backward compatibility with existing cao.ts functions
export function getBruto36hByDate(
  scale: string,
  tredeStr: string,
  startDate: string
): number {
  const trede = parseInt(tredeStr, 10);
  const scaleNum = parseInt(scale, 10);
  if (Number.isNaN(trede) || Number.isNaN(scaleNum)) return 0;

  // Use Promise but return 0 for now - this will be updated when components are ready
  CaoService.getSalaryByDate(scaleNum, trede, startDate).then(result => result).catch(() => 0);

  // Fallback to existing implementation for immediate compatibility
  return CaoService['getSalaryFromStaticTable'](scaleNum, trede, startDate);
}

export function getBruto36h(scale: string, trede: string): number {
  const today = new Date().toISOString().split('T')[0];
  return getBruto36hByDate(scale, trede, today);
}

export function calculateGrossMonthly(bruto36h: number, hoursPerWeek: number): number {
  return CaoService.calculateGrossMonthly(bruto36h, hoursPerWeek);
}

export function calculateReiskosten(km: number, hoursPerWeek: number): number {
  return CaoService.calculateReiskosten(km, hoursPerWeek);
}