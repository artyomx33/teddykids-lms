/**
 * CAO (Collective Labor Agreement) Configuration
 * 
 * This file contains business logic constants for the Dutch Kinderopvang CAO system.
 * Modify these values to change default behavior across the application.
 */

export const CAO_DEFAULTS = {
  /**
   * Default CAO salary scale (Schaal)
   * Range: 2-12 (based on Kinderopvang CAO 2025-2026)
   */
  scale: 6,

  /**
   * Default CAO salary step (Trede)
   * Range: 0-20 (varies by scale)
   */
  trede: 10,

  /**
   * Default working hours per week
   * Standard full-time position in the Netherlands
   */
  hoursPerWeek: 36,
} as const;

/**
 * CAO Scale Ranges
 * Defines valid trede ranges for each scale
 */
export const CAO_SCALE_RANGES = {
  2: { min: 0, max: 16 },
  3: { min: 0, max: 16 },
  4: { min: 0, max: 16 },
  5: { min: 0, max: 16 },
  6: { min: 0, max: 20 },
  7: { min: 0, max: 20 },
  8: { min: 0, max: 20 },
  9: { min: 0, max: 20 },
  10: { min: 0, max: 20 },
  11: { min: 0, max: 20 },
  12: { min: 0, max: 20 },
} as const;

/**
 * Business Rules
 */
export const CAO_BUSINESS_RULES = {
  /**
   * Minimum monthly salary (in euros)
   * Used for validation and fallback calculations
   */
  minimumMonthlySalary: 1500,

  /**
   * Maximum monthly salary (in euros)
   * Used for validation and sanity checks
   */
  maximumMonthlySalary: 10000,

  /**
   * Effective date for current CAO rates
   */
  currentCaoEffectiveDate: '2025-01-01',
} as const;

