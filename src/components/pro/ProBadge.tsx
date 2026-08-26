'use client'

import React from 'react'
import { Crown } from 'lucide-react'

interface ProBadgeProps {
  className?: string
  text?: string
}

export function ProBadge({ className = '', text = 'PRO' }: ProBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-linear-to-r from-amber-400/20 to-purple-500/20 text-amber-300 border border-amber-400/40 shadow-xs shadow-amber-500/10 ${className}`}
    >
      <Crown className="size-2.5 text-amber-400 shrink-0" />
      <span>{text}</span>
    </span>
  )
}
