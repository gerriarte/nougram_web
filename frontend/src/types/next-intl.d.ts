declare module 'next-intl' {
  export function useTranslations(namespace?: string): (key: string, params?: Record<string, any>) => string
}

declare module 'next-intl/server' {
  export function getRequestConfig(config: (options: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: any }>): any
}
