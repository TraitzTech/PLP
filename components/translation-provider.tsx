"use client";

import React, { createContext, useContext, ReactNode } from 'react';

type Messages = Record<string, any>;

const TranslationContext = createContext<Messages | null>(null);

export function TranslationProvider({ messages, children }: { messages: Messages; children: ReactNode }) {
  return <TranslationContext.Provider value={messages}>{children}</TranslationContext.Provider>;
}

export function useTranslations() {
  const messages = useContext(TranslationContext);
  if (!messages) {
    return (key: string, valuesOrFallback?: Record<string, any> | string, maybeFallback?: string) => {
      const fallback = typeof valuesOrFallback === 'string' ? valuesOrFallback : maybeFallback;
      return fallback ?? key;
    };
  }

  const interpolate = (template: string, values?: Record<string, any>) => {
    if (!values) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        const value = values[key];
        return value === null || value === undefined ? '' : String(value);
      }
      return match;
    });
  };

  return (key: string, valuesOrFallback?: Record<string, any> | string, maybeFallback?: string) => {
    const values = typeof valuesOrFallback === 'object' && valuesOrFallback !== null ? valuesOrFallback : undefined;
    const fallback = typeof valuesOrFallback === 'string' ? valuesOrFallback : maybeFallback;

    // simple dot-path resolver
    const parts = key.split('.');
    let curr: any = messages;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = curr[part];
      } else {
        return fallback ?? key;
      }
    }
    if (typeof curr === 'string') {
      return interpolate(curr, values);
    }
    return fallback ?? key;
  };
}
