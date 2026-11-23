'use client'

import React, { useState } from 'react'
import { Zap, Key } from 'lucide-react'
import { GeminiApiKeyModal } from '@/components/ai/GeminiApiKeyModal'
import { useAiCredits } from '@/hooks/useAiCredits'

interface AiQuotaIndicatorProps {
  className?: string
}

/**
 * Visual badge displayed on AI tool interfaces showing either:
 * - "⚡ Chave própria ativa (Uso Ilimitado)" (when BYOK is active)
 * - "Créditos restantes hoje: X / 10" (when using free community quota)
 * Clicking opens the BYOK modal to set or manage the Gemini key.
 */
export function AiQuotaIndicator({ className = '' }: AiQuotaIndicatorProps) {
  const { hasCustomApiKey, freeCreditsRemaining, dailyLimit } = useAiCredits()
  const [open, setOpen] = useState(false)

  const isExhausted = !hasCustomApiKey && freeCreditsRemaining <= 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
          hasCustomApiKey
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
            : isExhausted
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
              : 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25'
        } ${className}`}
        title="Gerenciar chave própria do Google Gemini"
      >
        {hasCustomApiKey ? (
          <>
            <Zap className="size-3 text-emerald-400 shrink-0" />
            <span>⚡ Chave própria ativa (Uso Ilimitado)</span>
          </>
        ) : (
          <>
            <Key className="size-3 text-purple-400 shrink-0" />
            <span>
              Créditos restantes hoje: {freeCreditsRemaining} / {dailyLimit}
            </span>
            <span className="text-[10px] text-purple-400 underline ml-1">
              (BYOK para ilimitado)
            </span>
          </>
        )}
      </button>

      <GeminiApiKeyModal
        isOpen={open}
        onClose={() => setOpen(false)}
        variant={isExhausted ? 'limit' : 'settings'}
      />
    </>
  )
}
