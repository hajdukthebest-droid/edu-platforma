'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import hrTranslations from '@/lib/i18n/translations/hr.json'
import enTranslations from '@/lib/i18n/translations/en.json'

type Locale = 'hr' | 'en'

type Translations = typeof hrTranslations

const translations: Record<Locale, Translations> = {
  hr: hrTranslations,
  en: enTranslations,
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const LOCALE_STORAGE_KEY = 'edu-platforma-locale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('hr')

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale
    if (savedLocale && (savedLocale === 'hr' || savedLocale === 'en')) {
      setLocaleState(savedLocale)
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0]
      if (browserLang === 'hr' || browserLang === 'en') {
        setLocaleState(browserLang)
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[locale]

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    if (typeof value === 'string') {
      return value
    }

    console.warn(`Translation value is not a string: ${key}`)
    return key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

// Helper hook for cleaner usage
export function useTranslation() {
  const { t } = useI18n()
  return { t }
}
