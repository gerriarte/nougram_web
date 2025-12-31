/**
 * Conditional logger for frontend
 * Only logs in development mode, except for errors which are always logged
 */
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
};















