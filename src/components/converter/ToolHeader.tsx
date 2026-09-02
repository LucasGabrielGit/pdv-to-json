'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Zap, ShieldCheck, Star, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/useFavorites'
import { tools } from '@/lib/tools-registry'
import { ToolJsonLd } from '@/components/seo/ToolJsonLd'

export interface ToolHeaderProps {
  title: string
  description: string
  badgeText?: string
  privacyText?: string
  category?: string
  toolId?: string
}


export function ToolHeader({
  title,
  description,
  badgeText = 'Instant & Free Online Tool',
  privacyText = '100% Client-Side Privacy',
  toolId,
}: ToolHeaderProps) {
  const pathname = usePathname()
  const { isFavorite, toggleFavorite, addRecent } = useFavorites()

  const isHome = pathname === '/'

  // Find tool slug from prop or current pathname (ignoring home page)
  const currentTool = isHome
    ? null
    : tools.find((t) => t.id === toolId || t.href === pathname)
  const currentId = currentTool?.id || (isHome ? '' : toolId || pathname.replace(/^\/tools\//, ''))

  useEffect(() => {
    if (currentId && !isHome) {
      addRecent(currentId)
    }
  }, [currentId, isHome, addRecent])

  const isFav = isFavorite(currentId)

  const handleToggleFavorite = () => {
    toggleFavorite(currentId)
    if (!isFav) {
      toast.success(`Added ${title} to Favorites! ⭐`, {
        description: 'Pinned to the top of your sidebar & command palette.',
      })
    } else {
      toast.info(`Removed ${title} from Favorites.`)
    }
  }

  return (
    <div className="text-center mb-8">
      <ToolJsonLd
        name={title}
        description={description}
        url={`https://dev-kit.tech${currentTool?.href || pathname}`}
      />
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
        {currentId && (
          <>
            <Button
              size="xs"
              variant="outline"
              onClick={handleToggleFavorite}
              className={`h-7 px-2.5 rounded-full border transition-all text-xs gap-1.5 cursor-pointer ${
                isFav
                  ? 'border-amber-400/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 shadow-xs shadow-amber-500/20'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-amber-300 hover:border-amber-400/30'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`size-3.5 transition-transform duration-200 ${
                  isFav ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-400 hover:scale-110'
                }`}
              />
              <span>{isFav ? 'Favorited' : 'Favorite'}</span>
            </Button>

            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Tool link copied to clipboard! 🔗')
                }
              }}
              className="h-7 px-2.5 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-purple-400/30 transition-all text-xs gap-1.5 cursor-pointer"
              title="Share tool link"
            >
              <Share2 className="size-3.5" />
              <span>Share</span>
            </Button>
          </>
        )}
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
