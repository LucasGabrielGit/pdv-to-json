'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  SupportedLocale,
  SUPPORTED_LOCALES,
  LocaleInfo,
  Translations,
} from '@/locales/types'
import { en } from '@/locales/en'
import { pt } from '@/locales/pt'
import { es } from '@/locales/es'

const dictionaries: Record<SupportedLocale, Translations> = {
  en,
  pt,
  es,
}

interface I18nContextType {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: Translations
  localeInfo: LocaleInfo
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'devkit_locale'

function detectBrowserLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en'

  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null
  if (saved && (saved === 'en' || saved === 'pt' || saved === 'es')) {
    return saved
  }

  const navLang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase()

  if (navLang.startsWith('pt')) return 'pt'
  if (navLang.startsWith('es')) return 'es'

  return 'en'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const detected = detectBrowserLocale()
    setLocaleState(detected)
    setMounted(true)
    document.documentElement.lang = detected
  }, [])

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale)
      document.documentElement.lang = newLocale
    }
  }

  const t = dictionaries[locale] || en
  const localeInfo = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES.en

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, localeInfo }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    // Fallback if rendered outside provider
    return {
      locale: 'en' as SupportedLocale,
      setLocale: () => {},
      t: en,
      localeInfo: SUPPORTED_LOCALES.en,
    }
  }
  return context
}
