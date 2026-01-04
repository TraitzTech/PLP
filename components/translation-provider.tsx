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
    return (key: string, fallback?: string) => fallback ?? key;
  }

  return (key: string, fallback?: string) => {
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
    return typeof curr === 'string' ? curr : (fallback ?? key);
  };
}

