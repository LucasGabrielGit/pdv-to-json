'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { tools } from '@/lib/tools-registry'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
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
      >
        <Menu className="size-5" />
      </Button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          devkit
        </Link>
        {currentTool && (
          <>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-medium text-foreground">
              {currentTool.name}
            </span>
          </>
        )}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Future: search / login button placeholder */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground/60">
          <Search className="size-3.5" />
          <span className="text-xs">Search tools...</span>
          <kbd className="ml-3 text-[10px] rounded border border-border/50 px-1.5 py-0.5 font-mono text-muted-foreground/40">
            ⌘K
          </kbd>
        </div>
      </div>
    </header>
  )
}
