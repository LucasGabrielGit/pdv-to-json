'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Key,
  ExternalLink,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AI_STUDIO_KEY_URL,
  DAILY_FREE_CREDITS_LIMIT,
  DAILY_LIMIT_ERROR_MESSAGE,
  isValidGeminiKeyFormat,
} from '@/lib/creditsConfig'
import {
  clearCustomApiKey,
  getUserCredits,
  saveCustomApiKeyToCloud,
  setCustomApiKey,
} from '@/utils/creditsManager'
import { createClient } from '@/lib/supabase/client'

export type GeminiApiKeyModalVariant = 'settings' | 'limit'

export interface GeminiApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  /** `limit` shows the "daily quota reached" copy, `settings` the regular BYOK panel. */
  variant?: GeminiApiKeyModalVariant
  /** Name of the feature that triggered the modal (settings variant). */
  featureName?: string
  onSaved?: () => void
}

type TestState = 'idle' | 'testing' | 'valid' | 'invalid'

/** Lightweight call against the public Gemini API to confirm the key works. */
async function testGeminiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1',
      { headers: { 'x-goog-api-key': key.trim() } }
    )
    return res.ok
  } catch {
    return false
  }
}

export function GeminiApiKeyModal({
  isOpen,
  onClose,
  variant = 'settings',
  featureName,
  onSaved,
}: GeminiApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState('')
  const [testState, setTestState] = useState<TestState>('idle')
  const [hasSavedKey, setHasSavedKey] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!isOpen) return
    setKeyInput('')
    setTestState('idle')
    setHasSavedKey(Boolean(getUserCredits().userCustomApiKey))
  }, [isOpen])

  const trimmed = keyInput.trim()
  const formatOk = isValidGeminiKeyFormat(trimmed)

  const handleTest = async () => {
    if (!formatOk) {
      setTestState('invalid')
      toast.error('Formato inválido. Chaves do Google AI Studio começam com "AIza".')
      return
    }
    setTestState('testing')
    const ok = await testGeminiKey(trimmed)
    setTestState(ok ? 'valid' : 'invalid')
    if (ok) toast.success('Chave válida!')
    else toast.error('Não foi possível validar a chave. Verifique se ela está correta.')
  }

  const handleSave = async () => {
    if (!formatOk) {
      setTestState('invalid')
      toast.error('Insira uma chave válida do Google AI Studio (AIza...).')
      return
    }
    setCustomApiKey(trimmed)
    // Best effort: also keep it on the user's profile if signed in.
    void saveCustomApiKeyToCloud(supabase, trimmed)
    toast.success('Chave própria ativa! Uso ilimitado e 100% gratuito.')
    onSaved?.()
    onClose()
  }

  const handleRemove = async () => {
    clearCustomApiKey()
    void saveCustomApiKeyToCloud(supabase, null)
    setHasSavedKey(false)
    toast.success('Chave removida deste navegador.')
  }

  const isLimit = variant === 'limit'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="border border-purple-500/40 bg-[#0f172a] p-6 md:p-8 space-y-4 max-w-lg w-full text-slate-100 shadow-2xl overflow-hidden rounded-3xl">
        {/* Ambient glow backgrounds */}
        <div className="absolute -top-24 -right-24 size-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <DialogHeader className="space-y-2 relative">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold w-fit ${
              isLimit
                ? 'border-amber-500/30 bg-amber-500/15 text-amber-300'
                : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
            }`}
          >
            {isLimit ? <AlertTriangle className="size-3.5" /> : <Zap className="size-3.5" />}
            {isLimit
              ? `Cota diária gratuita esgotada (0/${DAILY_FREE_CREDITS_LIMIT})`
              : 'Bring Your Own Key • 100% grátis'}
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            {isLimit
              ? 'Continue sem limites'
              : featureName
                ? `Use sua chave para liberar: ${featureName}`
                : 'Configurar chave própria do Gemini'}
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-300 leading-relaxed">
            {isLimit
              ? DAILY_LIMIT_ERROR_MESSAGE
              : 'Cole sua chave gratuita do Google AI Studio para usar a IA sem limite diário e com acesso ao modelo de raciocínio profundo.'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative space-y-2">
          <Label
            htmlFor="gemini-api-key-input"
            className="text-xs text-purple-200 font-semibold flex items-center gap-1.5"
          >
            <Key className="size-3.5 text-purple-400" /> Chave de API do Google Gemini
          </Label>
          <Input
            id="gemini-api-key-input"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={keyInput}
            onChange={(e) => {
              setKeyInput(e.target.value)
              setTestState('idle')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleSave()
            }}
            placeholder="AIzaSy..."
            className="bg-black/50 border-purple-500/30 text-xs font-mono text-white"
          />
          {testState === 'valid' && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Chave validada com o Google.
            </p>
          )}
          {testState === 'invalid' && (
            <p className="text-[11px] text-rose-400">
              Chave inválida ou sem acesso à API Gemini.
            </p>
          )}
          <a
            href={AI_STUDIO_KEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 underline-offset-2 hover:underline"
          >
            Obtenha sua chave gratuita em aistudio.google.com
            <ExternalLink className="size-3" />
          </a>
        </div>

        <div className="relative flex items-start gap-2 rounded-xl bg-black/40 border border-white/10 p-3 text-[11px] text-slate-400">
          <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Sua chave fica salva apenas no seu navegador (e no seu perfil, se estiver logado) e é usada somente para chamar o Google Gemini. Ela nunca é compartilhada.
          </span>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-2 pt-1">
          {hasSavedKey ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleRemove}
              className="text-rose-300 hover:text-white hover:bg-rose-500/10 text-xs gap-1"
            >
              <Trash2 className="size-3" /> Remover chave atual
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={handleTest}
              disabled={!trimmed || testState === 'testing'}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs gap-1"
            >
              {testState === 'testing' ? <Loader2 className="size-3 animate-spin" /> : null}
              Testar chave
            </Button>
            <Button
              size="xs"
              onClick={handleSave}
              disabled={!trimmed}
              className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs"
            >
              Salvar e continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
