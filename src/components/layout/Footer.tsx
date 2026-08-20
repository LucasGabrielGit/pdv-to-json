'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldCheck, Heart } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { LogoIcon } from './Logo'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="mt-auto border-t border-border/30 bg-black/20 backdrop-blur-sm py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        {/* Brand & Privacy */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <Link
            href="/"
            className="font-bold text-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
          >
            <LogoIcon size={18} />
            <span>
              dev-kit<span className="text-primary">.tech</span>
            </span>
          </Link>

          <span className="hidden sm:inline text-muted-foreground/30">•</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="size-3.5" /> {t.common.privacyGuaranteeTitle}
          </span>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-medium">
          <Link href="/pricing" className="text-purple-400 hover:text-purple-300 transition-colors font-bold">
            {t.common.pricing}
          </Link>
          <Link href="/search" className="hover:text-foreground transition-colors">
            {t.sidebar.searchTools}
          </Link>
          <Link href="/tools/json-csv" className="hover:text-foreground transition-colors">
            JSON ↔ CSV
          </Link>
          <Link href="/tools/jwt-decoder" className="hover:text-foreground transition-colors">
            JWT Decoder
          </Link>
          <Link href="/tools/regex-tester" className="hover:text-foreground transition-colors">
            Regex
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors text-slate-400">
            {t.footer.privacyPolicy}
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors text-slate-400">
            {t.footer.termsOfService}
          </Link>
        </div>

        {/* Credits */}
        <div className="text-muted-foreground/60 text-center sm:text-right">
          {t.footer.builtWithLove} <Heart className="inline size-3 text-rose-500 fill-rose-500 mx-0.5" /> {t.footer.forDevelopers}
        </div>
      </div>
    </footer>
  )
}



