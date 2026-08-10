import React from 'react'
import { Zap, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface ToolHeaderProps {
  title: string
  description: string
  badgeText?: string
  privacyText?: string
}

export function ToolHeader({
  title,
  description,
  badgeText = 'Instant & Free Online Tool',
  privacyText = '100% Client-Side Privacy',
}: ToolHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <Badge
          variant="outline"
          className="gap-1.5 border-purple-500/40 bg-purple-500/10 text-purple-400 font-medium py-1 px-3"
        >
          <Zap className="size-3.5" />
          {badgeText}
        </Badge>
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-medium py-1 px-3"
        >
          <ShieldCheck className="size-3.5" />
          {privacyText}
        </Badge>
      </div>

      <h1
        className="text-4xl md:text-6xl font-black mb-3 tracking-tight"
        style={{
          background: 'linear-gradient(135deg, #f1f5f9 0%, #7c3aed 50%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {title}
      </h1>
      <p className="text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  )
}
