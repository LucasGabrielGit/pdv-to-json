'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { tools } from '@/lib/tools-registry'

interface HeaderProps {
  onMenuClick: () => void
  onSearchClick?: () => void
}

export function Header({ onMenuClick, onSearchClick }: HeaderProps) {
  const pathname = usePathname()

  const currentTool = tools.find((t) => t.href === pathname)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 md:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-foreground md:hidden shrink-0"
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          dev-kit.tech
        </Link>
        {currentTool && (
          <>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-medium text-foreground truncate max-w-[160px] sm:max-w-none">
              {currentTool.name}
            </span>
          </>
        )}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search button trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-purple-500/20 bg-muted/40 hover:bg-muted/70 hover:border-purple-500/40 px-3 py-1.5 text-sm text-muted-foreground transition-all cursor-pointer shadow-sm"
          title="Search tools (⌘K / Ctrl+K)"
        >
          <Search className="size-3.5 text-purple-400" />
          <span className="text-xs">Search tools...</span>
          <kbd className="ml-3 text-[10px] rounded border border-border/60 bg-black/40 px-1.5 py-0.5 font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground sm:hidden"
          onClick={onSearchClick}
          aria-label="Search tools"
        >
          <Search className="size-4" />
        </Button>
      </div>
    </header>
  )
}

