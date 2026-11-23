'use client'

import React from 'react'
import { Key } from 'lucide-react'

interface ByokBadgeProps {
  className?: string
  text?: string
}

/** Small marker for features that require the user's own Gemini key. */
export function ByokBadge({ className = '', text = 'BYOK' }: ByokBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 ${className}`}
    >
      <Key className="size-2.5 text-emerald-400 shrink-0" />
      <span>{text}</span>
    </span>
  )
}
