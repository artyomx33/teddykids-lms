/**
 * 📊 PRODUCTION-SAFE LOGGER
 * Guards console.log statements with environment checks
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Development-only logging
   * Stripped from production builds
   */
  dev: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Always log errors (production + development)
   */
  error: (...args: any[]) => {
    console.error(...args);
    // TODO: Send to error tracking service in production
  },

  /**
   * Warning logs (production + development)
   */
  warn: (...args: any[]) => {
    console.warn(...args);
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

// Alias for backward compatibility
export const log = logger;

export default logger;
