'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/lib/i18n';
import type { I18nStr } from '@/types/robot';

interface I18nInputProps {
  label: string;
  value: I18nStr;
  onChange: (value: I18nStr) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
}

export function I18nInput({
  label,
  value,
  onChange,
  placeholder = '',
  multiline = false,
  rows = 3,
  required = false,
  disabled = false,
  error,
  description,
}: I18nInputProps) {
  const [activeTab, setActiveTab] = useState<Locale>('ua');

  const handleLocaleChange = (locale: Locale, text: string) => {
    onChange({
      ...value,
      [locale]: text,
    });
  };

  const getValidationStatus = (locale: Locale) => {
    const hasContent = value[locale]?.trim().length > 0;
    const isRequired = required && locale === 'ua'; // Ukrainian is required
    
    if (isRequired && !hasContent) return 'error';
    if (hasContent) return 'success';
    return 'default';
  };

  const renderTabTrigger = (locale: Locale) => {
    const status = getValidationStatus(locale);
    const hasContent = value[locale]?.trim().length > 0;

    return (
      <TabsTrigger key={locale} value={locale} className="relative">
        <div className="flex items-center space-x-2">
          <span>{LOCALE_FLAGS[locale]}</span>
          <span className="text-xs">{LOCALE_NAMES[locale]}</span>
          
          {/* Status indicator */}
          {hasContent && (
            <div className={`w-2 h-2 rounded-full ${
              status === 'error' ? 'bg-destructive' :
              status === 'success' ? 'bg-green-500' :
              'bg-muted'
            }`} />
          )}
        </div>
        
        {/* Required indicator for Ukrainian */}
        {locale === 'ua' && required && (
          <span className="text-destructive text-xs absolute -top-1 -right-1">*</span>
        )}
      </TabsTrigger>
    );
  };

  const renderInput = (locale: Locale) => {
    const inputProps = {
      value: value[locale] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleLocaleChange(locale, e.target.value),
      placeholder: placeholder,
      disabled: disabled,
      className: getValidationStatus(locale) === 'error' ? 'border-destructive' : '',
    };

    return multiline ? (
      <Textarea {...inputProps} rows={rows} />
    ) : (
      <Input {...inputProps} />
    );
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Tabs for different locales */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Locale)}>
        <TabsList className="grid w-full grid-cols-3">
          {SUPPORTED_LOCALES.map(renderTabTrigger)}
        </TabsList>

        {SUPPORTED_LOCALES.map((locale) => (
          <TabsContent key={locale} value={locale} className="mt-2">
            {renderInput(locale)}
            
            {/* Character count for active tab */}
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-muted-foreground">
                {multiline && (
                  <span>
                    {value[locale]?.length || 0} символів
                  </span>
                )}
              </div>
              
              {/* Status badges */}
              <div className="flex space-x-1">
                {required && locale === 'ua' && !value[locale]?.trim() && (
                  <Badge variant="destructive" className="text-xs">
                    Обов'язково
                  </Badge>
                )}
                {value[locale]?.trim() && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Заповнено
                  </Badge>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Global status summary */}
      <div className="flex space-x-1">
        {SUPPORTED_LOCALES.map((locale) => {
          const hasContent = value[locale]?.trim().length > 0;
          if (!hasContent) return null;
          
          return (
            <Badge key={locale} variant="outline" className="text-xs">
              {LOCALE_FLAGS[locale]} {LOCALE_NAMES[locale]}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}