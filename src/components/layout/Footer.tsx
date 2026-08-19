import React from 'react'
import Link from 'next/link'
import { ShieldCheck, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/30 bg-black/20 backdrop-blur-sm py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        {/* Brand & Privacy */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <Link
            href="/"
            className="font-bold text-foreground hover:text-primary transition-colors text-sm"
          >
            dev-kit<span className="text-primary">.tech</span>
          </Link>
          <span className="hidden sm:inline text-muted-foreground/30">•</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="size-3.5" /> 100% Client-Side &amp; Private
          </span>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-medium">
          <Link href="/search" className="hover:text-foreground transition-colors">
            Search
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
          <Link href="/tools/hash-generator" className="hover:text-foreground transition-colors">
            Hashes
          </Link>
          <Link href="/tools/code-analyzer" className="hover:text-foreground transition-colors">
            AI Review
          </Link>
        </div>

        {/* Credits */}
        <div className="text-muted-foreground/60 text-center sm:text-right">
          Built with <Heart className="inline size-3 text-rose-500 fill-rose-500 mx-0.5" /> for developers.
        </div>
      </div>
    </footer>
  )
}

