"use client";

import React, { useState } from "react";
import { Zap, Key } from "lucide-react";
import { useAiCredits } from "@/hooks/useAiCredits";
import { GeminiApiKeyModal } from "@/components/ai/GeminiApiKeyModal";
import { Button } from "@/components/ui/button";

/**
 * Header badge: shows the BYOK status or the remaining daily credits.
 * Clicking it opens the GeminiApiKeyModal Dialog.
 */
export function AiCreditsBadge() {
  const { hasCustomApiKey, freeCreditsRemaining, dailyLimit } = useAiCredits();
  const [open, setOpen] = useState(false);

  const exhausted = !hasCustomApiKey && freeCreditsRemaining <= 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        title="Configurar chave própria do Google Gemini"
        className={`hidden sm:flex items-center h-8.5 gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all shadow-xs cursor-pointer ${
          hasCustomApiKey
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            : exhausted
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              : "border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
        }`}
      >
        {hasCustomApiKey ? (
          <>
            <Zap className="size-3 text-emerald-400" />
            <span>⚡ Chave própria ativa (Uso Ilimitado)</span>
          </>
        ) : (
          <>
            <Key className="size-3" />
            <span>
              Créditos restantes hoje: {freeCreditsRemaining} / {dailyLimit}
            </span>
          </>
        )}
      </Button>

      <GeminiApiKeyModal
        isOpen={open}
        onClose={() => setOpen(false)}
        variant="settings"
      />
    </>
  );
}
