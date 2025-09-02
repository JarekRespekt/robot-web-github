import type { I18nStr } from '@/types/robot';

export type Locale = 'ua' | 'pl' | 'en' | 'by';

// Default locale for admin UI
export const DEFAULT_LOCALE: Locale = 'ua';

// Available locales for content
export const SUPPORTED_LOCALES: Locale[] = ['ua', 'pl', 'en'];

// Locale display names
export const LOCALE_NAMES: Record<Locale, string> = {
  ua: 'Українська',
  pl: 'Polski', 
  en: 'English',
};

// Locale flags/icons
export const LOCALE_FLAGS: Record<Locale, string> = {
  ua: '🇺🇦',
  pl: '🇵🇱',
  en: '🇺🇸',
};

/**
 * Get localized text from i18n object
 */
export function getLocalizedText(
  text: I18nStr | string, 
  locale: Locale = DEFAULT_LOCALE
): string {
  if (typeof text === 'string') {
    return text;
  }
  
  return text[locale] || text[DEFAULT_LOCALE] || text.ua || '';
}

/**
 * Create empty i18n object
 */
export function createEmptyI18nStr(): I18nStr {
  return {
    ua: '',
    pl: '',
    en: '',
  };
}

/**
 * Check if i18n object is valid (has at least one non-empty value)
 */
export function isValidI18nStr(text: I18nStr): boolean {
  return SUPPORTED_LOCALES.some(locale => text[locale]?.trim().length > 0);
}

/**
 * Get the primary locale that has content
 */
export function getPrimaryLocale(text: I18nStr): Locale {
  for (const locale of SUPPORTED_LOCALES) {
    if (text[locale]?.trim()) {
      return locale;
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * Format currency value
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'UAH',
  locale: Locale = DEFAULT_LOCALE
): string {
  const localeMap: Record<Locale, string> = {
    ua: 'uk-UA',
    pl: 'pl-PL', 
    en: 'en-US',
  };

  try {
    return new Intl.NumberFormat(localeMap[locale], {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Parse currency input to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d.,]/g, '');
  const normalized = cleaned.replace(',', '.');
  return parseFloat(normalized) || 0;
}

/**
 * Validate required i18n fields
 */
export function validateRequiredI18n(
  text: I18nStr, 
  requiredLocales: Locale[] = [DEFAULT_LOCALE]
): string[] {
  const errors: string[] = [];
  
  for (const locale of requiredLocales) {
    if (!text[locale]?.trim()) {
      errors.push(`${LOCALE_NAMES[locale]} переклад обов'язковий`);
    }
  }
  
  return errors;
}