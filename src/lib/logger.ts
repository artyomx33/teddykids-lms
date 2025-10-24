/**
 * 🔧 STUBBED Logging Utility
 * 
 * CRITICAL: This module is completely stubbed to prevent initialization errors
 * The logger was causing production crashes, so it's been replaced with no-ops
 */

// Completely stubbed - does nothing
export const LOG_CONFIG = {};

// All methods are no-ops that do nothing
const noop = () => {};

export const logger = {
  debug: noop,
  dev: noop,
  info: noop,
  warn: noop,
  error: noop,
  success: noop,
  feature: noop,
  production: noop,
  time: noop,
  timeEnd: noop,
  group: noop,
  groupEnd: noop,
  queryError: noop,
};

// Quick helpers - all no-ops
export const log = {
  querySuccess: noop,
  queryError: noop,
  usingMockData: noop,
  supabaseInit: noop,
  supabaseQuery: noop,
};

export default logger;