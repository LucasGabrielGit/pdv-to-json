'use client'

import { useEffect } from 'react'

interface KeyboardShortcutOptions {
  onExecute?: () => void
  onCopy?: () => void
  onClear?: () => void
  enabled?: boolean
}

/**
 * Hook to bind standard power-user keyboard shortcuts across dev tools:
 * - Ctrl + Enter (or Cmd + Enter): Execute tool action / Generate / Convert
 * - Ctrl + Shift + C (or Cmd + Shift + C): Copy primary output
 * - Ctrl + Shift + K (or Cmd + Shift + K): Clear inputs
 */
export function useKeyboardShortcut({
  onExecute,
  onCopy,
  onClear,
  enabled = true,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey

      // Ctrl + Enter (or Cmd + Enter) -> Run primary action
      if (isCmdOrCtrl && e.key === 'Enter') {
        if (onExecute) {
          e.preventDefault()
          onExecute()
        }
      }

      // Ctrl + Shift + C (or Cmd + Shift + C) -> Copy output
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        if (onCopy) {
          e.preventDefault()
          onCopy()
        }
      }

      // Ctrl + Shift + K (or Cmd + Shift + K) -> Clear tool
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        if (onClear) {
          e.preventDefault()
          onClear()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onExecute, onCopy, onClear, enabled])
}
