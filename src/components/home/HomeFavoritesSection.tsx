'use client'

import React from 'react'
import Link from 'next/link'
import { Star, Clock, Sparkles } from 'lucide-react'
import { tools, type Tool } from '@/lib/tools-registry'
import { useFavorites } from '@/hooks/useFavorites'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function HomeFavoritesSection() {
  const { favorites, recents, isLoaded } = useFavorites()

  if (!isLoaded) return null

  const favoriteTools = tools.filter((t) => favorites.includes(t.id))
  const recentTools = tools.filter(
    (t) => recents.includes(t.id) && !favorites.includes(t.id)
  )

  if (favoriteTools.length === 0 && recentTools.length === 0) {
    return null
  }

  return (
    <div className="mb-14 space-y-8 animate-in fade-in duration-300">
      {/* ── Favorite Tools Section ── */}
      {favoriteTools.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                ⭐
              </span>
              <span>Pinned Favorites</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({favoriteTools.length})
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteTools.map((tool) => (
              <QuickToolCard key={`home-fav-${tool.id}`} tool={tool} isFavorite />
            ))}
          </div>
        </div>
      )}

      {/* ── Recently Used Tools Section ── */}
      {recentTools.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs">
                <Clock className="size-3.5" />
              </span>
              <span>Recently Used</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({recentTools.length})
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTools.slice(0, 3).map((tool) => (
              <QuickToolCard key={`home-rec-${tool.id}`} tool={tool} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function QuickToolCard({ tool, isFavorite }: { tool: Tool; isFavorite?: boolean }) {
  const Icon = tool.icon

  return (
    <Link href={tool.href}>
      <Card className="group relative overflow-hidden border border-purple-500/30 bg-[#16213e]/70 hover:bg-[#16213e] hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-950/30 transition-all duration-200 cursor-pointer">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-105 transition-all shrink-0">
            <Icon className="size-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-purple-300 transition-colors truncate">
                {tool.name}
              </h3>
              {isFavorite && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 border-amber-400/40 text-amber-300 bg-amber-500/10 font-mono gap-0.5"
                >
                  <Star className="size-2.5 fill-amber-300" /> Fav
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {tool.description}
            </p>
          </div>

          <div className="text-purple-400/0 group-hover:text-purple-400 transition-colors">
            <Sparkles className="size-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
