'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  PanelLeftClose,
  PanelLeft,
  Wrench,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  categories,
  getToolsByCategory,
  type Tool,
} from '@/lib/tools-registry'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden',
          collapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
        )}
        onClick={() => setCollapsed(true)}
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:sticky md:top-0 md:z-30 shrink-0',
          collapsed
            ? '-translate-x-full md:translate-x-0 md:w-16'
            : 'w-64 translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between px-4 shrink-0">
          {!collapsed && (
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
                dk
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                dev-kit<span className="text-primary">.tech</span>
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
                dk
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-8 text-muted-foreground hover:text-foreground md:flex shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeft className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Tool navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {categories.map((cat) => {
            const catTools = getToolsByCategory(cat.id)
            if (catTools.length === 0) return null

            return (
              <div key={cat.id}>
                {!collapsed && (
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {cat.emoji} {cat.label}
                  </p>
                )}

                <ul className="space-y-0.5">
                  {catTools.map((tool) => (
                    <SidebarItem
                      key={tool.id}
                      tool={tool}
                      isActive={pathname === tool.href}
                      collapsed={collapsed}
                    />
                  ))}
                </ul>
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

/* ── Sidebar Item ── */
interface SidebarItemProps {
  tool: Tool
  isActive: boolean
  collapsed: boolean
}

function SidebarItem({ tool, isActive, collapsed }: SidebarItemProps) {
  const Icon = tool.icon
  const isComingSoon = tool.status === 'coming-soon'

  const content = (
    <div
      className={cn(
        'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm'
          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        isComingSoon && 'opacity-50 cursor-not-allowed',
        collapsed && 'justify-center px-0'
      )}
    >
      <Icon
        className={cn(
          'size-4 shrink-0',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{tool.name}</span>
          {isComingSoon && (
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 border-muted-foreground/30 text-muted-foreground/60 font-normal"
            >
              Soon
            </Badge>
          )}
        </>
      )}
    </div>
  )

  if (isComingSoon) {
    return <li title={`${tool.name} — Coming soon`}>{content}</li>
  }

  return (
    <li>
      <Link href={tool.href}>{content}</Link>
    </li>
  )
}

/* ── Mobile trigger button (exported for Header) ── */
export function SidebarMobileTrigger({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 text-muted-foreground hover:text-foreground md:hidden"
      onClick={onClick}
    >
      <Wrench className="size-5" />
    </Button>
  )
}
