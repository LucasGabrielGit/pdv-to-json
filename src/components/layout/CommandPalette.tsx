'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, X, CornerDownLeft, Star, Clock } from 'lucide-react'
import { tools, searchTools, type Tool } from '@/lib/tools-registry'
import { Badge } from '@/components/ui/badge'
import { useFavorites } from '@/hooks/useFavorites'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { favorites, recents, isFavorite, toggleFavorite } = useFavorites()

  const displayedTools = useMemo(() => {
    if (query.trim()) {
      return searchTools(query)
    }
    // When empty, show favorites, recents, then the rest
    const favs = tools.filter((t) => favorites.includes(t.id))
    const recent = tools.filter(
      (t) => recents.includes(t.id) && !favorites.includes(t.id)
    )
    const others = tools.filter(
      (t) => !favorites.includes(t.id) && !recents.includes(t.id)
    )

    return [...favs, ...recent, ...others]
  }, [query, favorites, recents])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      } else if (e.key === 'Escape' && open) {
        e.preventDefault()
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = (tool: Tool) => {
    if (tool.status === 'coming-soon') return
    onOpenChange(false)
    router.push(tool.href)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % displayedTools.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev <= 0 ? displayedTools.length - 1 : prev - 1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = displayedTools[selectedIndex]
      if (selected) handleSelect(selected)
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('[data-command-item]')
    const activeItem = items[selectedIndex] as HTMLElement | undefined
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      {/* Background click to dismiss */}
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-purple-500/30 bg-[#16213e] shadow-2xl shadow-purple-950/50 flex flex-col z-10"
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-purple-500/20 px-4 py-3.5 bg-black/30">
          <Search className="size-4 text-purple-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search tools..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground text-xs p-1"
            >
              <X className="size-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/50 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Tools List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 space-y-1 divide-y divide-white/5"
        >
          {displayedTools.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No developer tools found matching &quot;{query}&quot;.
            </div>
          ) : (
            displayedTools.map((tool, index) => {
              const Icon = tool.icon
              const isSelected = index === selectedIndex
              const isComingSoon = tool.status === 'coming-soon'
              const isFav = isFavorite(tool.id)
              const isRec = !isFav && recents.includes(tool.id) && !query.trim()

              return (
                <div
                  key={tool.id}
                  data-command-item
                  onClick={() => handleSelect(tool)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/20 text-white border border-purple-500/30'
                      : 'text-slate-300 hover:bg-white/5 border border-transparent'
                  } ${isComingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-500/10 text-purple-400'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">
                          {tool.name}
                        </span>
                        {isFav && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 border-amber-400/40 text-amber-300 bg-amber-500/10 font-mono gap-0.5"
                          >
                            <Star className="size-2.5 fill-amber-300" /> Fav
                          </Badge>
                        )}
                        {isRec && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 border-cyan-400/40 text-cyan-300 bg-cyan-500/10 font-mono gap-0.5"
                          >
                            <Clock className="size-2.5" /> Recent
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 uppercase tracking-wider font-mono border-white/10 text-muted-foreground"
                        >
                          {tool.category}
                        </Badge>
                        {isComingSoon && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 border-muted-foreground/30 text-muted-foreground"
                          >
                            Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(tool.id)
                      }}
                      className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`size-3.5 ${
                          isFav ? 'fill-amber-400 text-amber-400' : 'opacity-40 group-hover:opacity-100'
                        }`}
                      />
                    </button>
                    {!isComingSoon && (
                      <div className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <CornerDownLeft className="size-3 text-purple-400" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-purple-500/20 px-4 py-2 text-[11px] text-muted-foreground bg-black/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border/50 bg-black/40 px-1 py-0.5 font-mono text-[9px]">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border/50 bg-black/40 px-1 py-0.5 font-mono text-[9px]">
                ↵
              </kbd>{' '}
              Open
            </span>
          </div>
          <span className="flex items-center gap-1 text-purple-400 font-medium">
            <Sparkles className="size-3" /> dev-kit.tech
          </span>
        </div>
      </div>
    </div>
  )
}
