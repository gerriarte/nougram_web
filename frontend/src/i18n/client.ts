/**
 * Client-side i18n utilities
 * For use in Client Components
 */
'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { defaultLocale } from './config';

/**
 * Hook to use translations in client components
 * Currently defaults to Spanish (es) but ready for multi-language
 * 
 * Usage:
 *   const t = useTranslations('organizations');
 *   <h1>{t('title')}</h1>
 */
export function useTranslations(namespace?: string) {
  try {
    return useNextIntlTranslations(namespace);
  } catch (error) {
    // Fallback if next-intl is not configured in the app
    // This allows gradual migration
    return (key: string, params?: Record<string, any>) => {
      // Try to load Spanish translations as fallback
      try {
        // This is a simple fallback - in production, load from messages/es.json
        // For now, return the key to avoid breaking the app
        if (params) {
          let message = key;
          Object.entries(params).forEach(([paramKey, paramValue]) => {
            message = message.replace(`{${paramKey}}`, String(paramValue));
          });
          return message;
        }
        return key;
      } catch {
        return key;
      }
    };
  }
}

/**
 * Get current locale (defaults to 'es' for now)
 * TODO: Implement locale detection from URL/user preferences
 */
export function useLocale(): string {
  return defaultLocale;
}
