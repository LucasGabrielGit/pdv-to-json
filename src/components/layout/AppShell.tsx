'use client'

import React, { useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { CommandPalette } from './CommandPalette'
import { Analytics } from '@vercel/analytics/next'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <div className="flex flex-1 flex-col min-w-0">
          <Header
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onSearchClick={() => setCommandOpen(true)}
          />

          {/* Page content */}
          <main
            className="flex-1 relative"
            style={{
              background:
                'radial-gradient(ellipse at top, #1a1040 0%, #0f0f1a 60%)',
            }}
          >
            {/* Ambient glow orbs */}
            <div
              className="fixed -top-50 -left-50 w-150 h-150 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />
            <div
              className="fixed -bottom-50 -right-50 w-150 h-150 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />

            {children}
          </main>

          <Footer />
          <Analytics />
        </div>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <Toaster position="top-right" />
    </TooltipProvider>
  )
}

