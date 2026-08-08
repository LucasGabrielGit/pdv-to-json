import React from 'react'
import { Badge } from '@/components/ui/badge'

const FEATURES = [
  '🔄 Bidirectional',
  '🗂️ Nested objects',
  '🔢 Type casting',
  '📁 File & text',
  '🔧 Custom delimiter',
  '⬇️ One-click download',
  '🔒 100% client-side',
]

export const FeatureBadges: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-8">
      {FEATURES.map((f) => (
        <Badge
          key={f}
          variant="outline"
          className="text-xs bg-white/3 text-slate-400 border-white/8 font-medium py-1 px-2.5"
        >
          {f}
        </Badge>
      ))}
    </div>
  )
}
