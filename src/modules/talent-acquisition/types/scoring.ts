/**
 * Scoring-related type definitions
 */

export interface ScoringWeights {
  color_balance: number;
  red_flag_penalty: number;
  competency_bonus: number;
  age_fit_bonus: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
