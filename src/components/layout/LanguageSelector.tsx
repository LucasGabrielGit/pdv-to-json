'use client'

import React, { useState, useRef, useEffect } from 'react'

import { Check, ChevronDown } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { SUPPORTED_LOCALES } from '@/locales/types'



export function LanguageSelector() {
  const { locale, setLocale, localeInfo } = useTranslation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const localesList = Object.values(SUPPORTED_LOCALES)

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center h-8.5 gap-1.5 rounded-full border border-purple-500/20 bg-muted/40 hover:bg-muted/70 hover:border-purple-500/40 px-2.5 text-xs text-muted-foreground hover:text-white transition-all cursor-pointer shadow-xs"
        title="Change Language / Mudar Idioma / Cambiar Idioma"
        aria-label="Language Selector"
      >
        <span className="text-sm leading-none">{localeInfo.flag}</span>
        <span className="font-semibold uppercase tracking-wider text-[11px]">
          {localeInfo.code}
        </span>
        <ChevronDown className="size-3 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-purple-500/30 bg-[#16213e] p-1.5 shadow-2xl shadow-purple-950/70 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Language / Idioma
          </div>
          <div className="space-y-0.5">
            {localesList.map((loc) => {
              const isActive = loc.code === locale
              return (
                <button
                  key={loc.code}
                  onClick={() => {
                    setLocale(loc.code)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{loc.flag}</span>
                    <span>{loc.nativeName}</span>
                  </div>
                  {isActive && <Check className="size-3 text-purple-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
