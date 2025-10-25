/**
 * Application-wide constants and configuration
 * Centralized location for business logic values
 */

export const APP_CONSTANTS = {
  /**
   * Contract renewal assumptions
   */
  CONTRACT_RENEWAL_RATE: 0.7, // Assume 70% of expiring contracts will renew
  
  /**
   * Review scheduling
   */
  REVIEW_LOOKAHEAD_DAYS: 30, // Show reviews due in next 30 days
  REVIEW_OVERDUE_THRESHOLD_DAYS: 90, // Staff needing review after 90 days
  
  /**
   * Document compliance
   */
  REQUIRED_DOCUMENTS_COUNT: 7, // Total required documents for full compliance
  DOCUMENT_COMPLETION_THRESHOLD: 0.8, // 80% completion considered "ready"
  
  /**
   * Seasonal periods (month indexes, 0-based)
   */
  PEAK_HIRING_MONTHS: [8, 9, 10], // September - November
  VACATION_SEASON_MONTHS: [5, 6, 7], // June - August
  REVIEW_SEASON_MONTHS: [0, 11], // January, December
} as const;

