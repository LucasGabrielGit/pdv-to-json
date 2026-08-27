"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Sparkles, PanelLeft, PanelLeftClose } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { tools } from "@/lib/tools-registry";
import { UserMenu } from "@/components/auth/UserMenu";
import { LanguageSelector } from "./LanguageSelector";
import { LogoIcon } from "./Logo";

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Header({
  onMenuClick,
  onSearchClick,
  collapsed = false,
  onToggleCollapse,
}: HeaderProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const currentTool = tools.find((t) => t.href === pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-foreground md:hidden shrink-0"
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex size-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeft className="size-4 text-purple-400" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
      </Button>

      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1.5"
        >
          <LogoIcon size={20} />
          <span>dev-kit.tech</span>
        </Link>

        {currentTool && (
          <>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-medium text-foreground truncate max-w-40 sm:max-w-none">
              {currentTool.name}
            </span>
          </>
        )}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={onSearchClick}
          aria-label="Search developer tools"
          className="hidden sm:flex items-center h-8.5 gap-2 rounded-full border border-purple-500/20 bg-muted/40 hover:bg-muted/70 hover:border-purple-500/40 px-3 text-xs text-muted-foreground transition-all cursor-pointer shadow-sm"
          title={`Search tools (${t.common.searchKbd})`}
        >
          <Search className="size-3.5 text-purple-400" />
          <span>{t.common.search}</span>
          <kbd className="ml-2 text-[10px] rounded border border-border/60 bg-black/40 px-1.5 py-0.5 font-mono text-muted-foreground">
            {t.common.searchKbd}
          </kbd>
        </button>

        <Link
          href="/pricing"
          className="hidden sm:flex items-center h-8.5 gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-3 text-xs font-semibold text-purple-300 hover:text-white transition-all shadow-xs"
        >
          <Sparkles className="size-3 text-purple-400" />
          <span>{t.common.pricing}</span>
        </Link>

        <LanguageSelector />

        <UserMenu />
      </div>
    </header>
  );
}
