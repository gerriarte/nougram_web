/**
 * Translation utilities for client components
 * This provides a simple way to use translations without next-intl provider setup
 * 
 * IMPORTANT: This is a temporary solution for gradual migration.
 * Eventually, the app should use next-intl properly with [locale] routing.
 */

import messagesEs from '@/messages/es.json';
import messagesEn from '@/messages/en.json';
import { defaultLocale, type Locale } from '@/i18n/config';

type Messages = typeof messagesEs;

/**
 * Get nested value from object by dot-notation path
 */
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current: any, key: string) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

/**
 * Simple translation function that works without next-intl provider
 * Currently defaults to Spanish, but ready for locale switching
 */
export function translate(key: string, params?: Record<string, any>, locale: Locale = defaultLocale): string {
  const messages = locale === 'es' ? messagesEs : messagesEn;
  
  let message = getNestedValue(messages, key) || key;
  
  // Simple parameter interpolation
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      message = message.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    });
  }
  
  return message;
}

/**
 * Get translation with pluralization support
 */
export function translatePlural(
  key: string,
  count: number,
  params?: Record<string, any>,
  locale: Locale = defaultLocale
): string {
  const pluralKey = count === 1 ? key : `${key}_plural`;
  const message = translate(pluralKey, { ...params, count }, locale);
  
  // If plural key doesn't exist, fall back to singular
  if (message === pluralKey) {
    return translate(key, { ...params, count }, locale);
  }
  
  return message;
}

/**
 * Hook-like function for client components
 * Returns a translation function
 * 
 * Usage in components:
 *   const t = useTranslate('organizations.detail');
 *   <h1>{t('title')}</h1>
 */
export function useTranslate(namespace?: string, locale: Locale = defaultLocale) {
  return (key: string, params?: Record<string, any>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return translate(fullKey, params, locale);
  };
}
