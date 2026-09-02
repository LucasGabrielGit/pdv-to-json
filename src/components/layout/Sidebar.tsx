"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  categories,
  getToolsByCategory,
  tools,
  type Tool,
} from "@/lib/tools-registry";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/I18nContext";
import { Logo, LogoIcon } from "./Logo";

interface SidebarProps {
  isOpen?: boolean;
  collapsed?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  isOpen = false,
  collapsed = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { favorites } = useFavorites();

  const favoriteTools = favorites
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((t): t is (typeof tools)[number] => Boolean(t));

  const categoryTranslationMap: Record<string, string> = {
    converters: t.sidebar.categories.converters,
    developer: t.sidebar.categories.developer,
    formatters: t.sidebar.categories.formatters,
    generators: t.sidebar.categories.generators,
    ai: t.sidebar.categories.ai,
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:sticky md:top-0 md:z-30 shrink-0",
          isOpen
            ? "translate-x-0 w-64 shadow-2xl"
            : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-16" : "md:w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between px-3 shrink-0">
          {(!collapsed || isOpen) && (
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <Logo variant="full" size="md" />
            </Link>
          )}
          {collapsed && !isOpen && (
            <Link
              href="/"
              className="mx-auto hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <LogoIcon size={32} />
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground md:hidden shrink-0"
            onClick={onClose}
          >
            <PanelLeftClose className="size-5" />
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {favoriteTools.length > 0 && (
            <div className="pb-3 border-b border-sidebar-border/50">
              {(!collapsed || isOpen) && (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <span>⭐</span> <span>Favorites</span>
                </p>
              )}
              <ul className="space-y-0.5">
                {favoriteTools.map((tool) => (
                  <SidebarItem
                    key={`fav-${tool.id}`}
                    tool={tool}
                    isActive={pathname === tool.href}
                    collapsed={collapsed && !isOpen}
                    onNavigate={onClose}
                  />
                ))}
              </ul>
            </div>
          )}

          {categories.map((cat) => {
            const catTools = getToolsByCategory(cat.id);
            if (catTools.length === 0) return null;

            return (
              <div key={cat.id}>
                {(!collapsed || isOpen) && (
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {cat.emoji} {categoryTranslationMap[cat.id] || cat.label}
                  </p>
                )}

                <ul className="space-y-0.5">
                  {catTools.map((tool) => (
                    <SidebarItem
                      key={tool.id}
                      tool={tool}
                      isActive={pathname === tool.href}
                      collapsed={collapsed && !isOpen}
                      onNavigate={onClose}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer Link */}
        <div className="p-3 border-t border-sidebar-border/50">
          <Link
            href="/feedback"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-purple-500/10 hover:text-purple-300 transition-colors",
              collapsed && !isOpen && "justify-center px-2"
            )}
            title="Enviar Feedback"
          >
            <MessageSquarePlus className="size-4 text-purple-400 shrink-0" />
            {(!collapsed || isOpen) && <span>Enviar Feedback</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}

interface SidebarItemProps {
  tool: Tool;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarItem({
  tool,
  isActive,
  collapsed,
  onNavigate,
}: SidebarItemProps) {
  const Icon = tool.icon;
  const isComingSoon = tool.status === "coming-soon";

  const content = (
    <div
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        isComingSoon && "opacity-50 cursor-not-allowed",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-primary/70",
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
  );

  if (isComingSoon) {
    return <li title={`${tool.name} — Coming soon`}>{content}</li>;
  }

  return (
    <li>
      <Link href={tool.href} onClick={onNavigate}>
        {content}
      </Link>
    </li>
  );
}
