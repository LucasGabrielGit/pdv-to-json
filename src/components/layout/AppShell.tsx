"use client";

import React, { useState } from "react";
import { I18nProvider } from "@/contexts/I18nContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CommandPalette } from "./CommandPalette";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { Analytics } from "@vercel/analytics/next";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <I18nProvider>
      <TooltipProvider>
        <div className="flex min-h-screen">
          <Sidebar
            isOpen={sidebarOpen}
            collapsed={collapsed}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex flex-1 flex-col min-w-0">
            <Header
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              onSearchClick={() => setCommandOpen(true)}
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed(!collapsed)}
            />

            <main
              className="flex-1 relative bg-gradient-to-b from-[#1a1040]/80 via-[#0f0f1a] to-[#0a0a14]"
            >
              <div
                className="pointer-events-none fixed -top-40 -left-40 size-96 rounded-full bg-purple-600/10 blur-3xl"
              />
              <div
                className="pointer-events-none fixed -bottom-40 -right-40 size-96 rounded-full bg-cyan-500/8 blur-3xl"
              />

              {children}
            </main>

            <Footer />
            <Analytics />
          </div>
        </div>
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        <FeedbackWidget />
        <Toaster position="top-center" />
      </TooltipProvider>
    </I18nProvider>
  );
}
