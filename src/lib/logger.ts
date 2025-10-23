/**
 * 🔧 Centralized Logging Utility
 * 
 * Purpose: Clean console output by consolidating logs
 * - Only logs in development mode (except errors/warnings)
 * - Configurable log levels per feature
 * - Production-safe
 */

const isDev = import.meta.env.DEV;

// Configure which features should log (dev only)
export const LOG_CONFIG = {
  supabaseClient: false,      // Disable Supabase init logs
  staffQueries: false,         // Disable staff query success logs
  activityFeed: false,         // Disable activity feed logs
  mockData: false,             // Disable "using mock data" warnings
  contractCompliance: false,   // Disable contract logs
  emotionalIntel: false,       // Disable emotional intelligence logs
  reviewSystem: false,         // Disable review logs
  dashboardWidgets: false,     // Disable dashboard widget logs
  talentAcquisition: true,     // Enable talent acquisition logs (NEW)
  
  // Always enabled
  errors: true,
  warnings: true,
};

export const logger = {
  /**
   * Debug logs - only in dev, can be toggled per feature
   */
  debug: (feature: string, message: string, ...args: any[]) => {
    if (!isDev) return;
    
    const featureConfig = LOG_CONFIG[feature as keyof typeof LOG_CONFIG];
    if (featureConfig === false) return;
    
    console.log(`🔍 [${feature}] ${message}`, ...args);
  },
  
  /**
   * Development-only logging (NEW - for talent acquisition)
   */
  dev: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  /**
   * Info logs - general information (dev only)
   */
  info: (message: string, ...args: any[]) => {
    if (isDev) console.log(`ℹ️ [INFO] ${message}`, ...args);
  },
  
  /**
   * Warning logs - always shown
   */
  warn: (message: string, ...args: any[]) => {
    if (!LOG_CONFIG.warnings) return;
    console.warn(`⚠️ [WARN] ${message}`, ...args);
  },
  
  /**
   * Error logs - always shown
   */
  error: (message: string, ...args: any[]) => {
    if (!LOG_CONFIG.errors) return;
    console.error(`❌ [ERROR] ${message}`, ...args);
  },
  
  /**
   * Success logs - only in dev
   */
  success: (message: string, ...args: any[]) => {
    if (isDev) console.log(`✅ [SUCCESS] ${message}`, ...args);
  },
  
  /**
   * Feature-specific logs - controlled by LOG_CONFIG
   */
  feature: (feature: string, message: string, ...args: any[]) => {
    if (!isDev) return;
    
    const featureConfig = LOG_CONFIG[feature as keyof typeof LOG_CONFIG];
    if (featureConfig === false) return;
    
    console.log(`🎯 [${feature}] ${message}`, ...args);
  },
  
  /**
   * Production logs - shown in all environments (use sparingly!)
   */
  production: (message: string, ...args: any[]) => {
    console.log(`📢 [PROD] ${message}`, ...args);
  },
  
  /**
   * Performance timing (development only)
   */
  time: (label: string) => {
    if (isDev) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDev) {
      console.timeEnd(label);
    }
  },

  /**
   * Grouped logs (development only)
   */
  group: (label: string) => {
    if (isDev) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  }
};

/**
 * Quick helpers for common patterns
 */
export const log = {
  // Database queries
  querySuccess: (table: string, count: number) => {
    logger.debug('staffQueries', `Loaded ${count} records from ${table}`);
  },
  
  queryError: (table: string, error: any) => {
    logger.error(`Query failed for table: ${table}`, error);
  },
  
  // Mock data warnings
  usingMockData: (component: string, reason?: string) => {
    if (LOG_CONFIG.mockData && isDev) {
      console.warn(`📦 [${component}] Using mock data${reason ? `: ${reason}` : ''}`);
    }
  },
  
  // Supabase operations
  supabaseInit: () => {
    logger.debug('supabaseClient', 'Initializing Supabase client');
  },
  
  supabaseQuery: (table: string, operation: string) => {
    logger.debug('staffQueries', `${operation} on ${table}`);
  }
};

export default logger;
