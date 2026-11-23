'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Zap,
  Key,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Gift,
  Heart,
  Code2,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { GeminiApiKeyModal } from '@/components/ai/GeminiApiKeyModal'
import { AI_STUDIO_KEY_URL } from '@/lib/creditsConfig'
import { useAiCredits } from '@/hooks/useAiCredits'

export default function PricingPage() {
  const [keyModalOpen, setKeyModalOpen] = useState(false)
  const { hasCustomApiKey, freeCreditsRemaining, dailyLimit } = useAiCredits()

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* ── Hero Banner ── */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1.5 px-3 py-1 text-xs">
          <Gift className="size-3.5 text-emerald-400" />
          100% Gratuito &amp; Comunitário
        </Badge>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Sem assinaturas. Sem paywalls.{' '}
          <span className="bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Feito para desenvolvedores.
          </span>
        </h1>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed">
          O dev-kit.tech realizou um pivot completo: removemos todos os planos pagos e taxas de assinatura.
          Você tem cotas diárias gratuitas de IA renovadas todo dia ou uso ilimitado trazendo sua própria chave do Google AI Studio.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Button
            size="lg"
            onClick={() => setKeyModalOpen(true)}
            className="bg-linear-to-r from-purple-600 via-purple-500 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs md:text-sm h-11 px-6 shadow-xl shadow-purple-600/25 gap-2 cursor-pointer"
          >
            <Key className="size-4" />
            <span>Configurar Chave Gemini (BYOK)</span>
            <ArrowRight className="size-4 ml-1" />
          </Button>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-purple-500/30 bg-transparent text-slate-200 hover:bg-purple-500/10 text-xs md:text-sm h-11 px-6 font-semibold transition-colors"
          >
            <Code2 className="size-4 mr-1.5 text-purple-400" />
            Explorar 35+ Ferramentas
          </Link>
        </div>
      </div>

      {/* ── Two Pillars Comparison ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Free Daily Quota */}
        <Card className="border border-purple-500/30 bg-[#16213e]/80 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 size-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                Incluso Automaticamente
              </Badge>
              <Zap className="size-5 text-amber-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Cota Diária Gratuita</h3>
              <p className="text-xs text-slate-400">
                Ideal para consultas rápidas, testes e geração casual de código.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{dailyLimit} gerações por dia</strong> com o modelo rápido (<code className="text-purple-300">gemini-2.5-flash</code>).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Renovação automática</strong> todo dia à meia-noite (UTC).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>35+ conversores e formatadores offline-first</strong> sem limite algum e sem tracking.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero cadastro obrigatório:</strong> funciona diretamente no navegador.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Status atual neste dispositivo:</span>
              <strong className="text-purple-300 font-mono">
                {hasCustomApiKey
                  ? 'Ilimitado (BYOK ativo)'
                  : `${freeCreditsRemaining} / ${dailyLimit} restantes hoje`}
              </strong>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: BYOK (Bring Your Own Key) */}
        <Card className="border-2 border-emerald-500/40 bg-[#16213e]/90 backdrop-blur-md relative overflow-hidden shadow-xl shadow-emerald-950/40">
          <div className="absolute top-0 right-0 size-32 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-bold">
                ⚡ Recomendado para Desenvolvedores
              </Badge>
              <Key className="size-5 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Bring Your Own Key (BYOK)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Uso 100% ilimitado e gratuito conectando sua própria chave do Google AI Studio.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Uso ilimitado:</strong> sem consumo de créditos diários.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Acesso ao modelo avançado:</strong> raciocínio profundo (<code className="text-emerald-300">gemini-2.5-pro</code>).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>100% Gratuito no Google:</strong> o Google AI Studio oferece limites generosos sem exigir cartão.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacidade total:</strong> sua chave fica salva no <code className="text-slate-300">localStorage</code> do seu navegador.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => setKeyModalOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 gap-2 cursor-pointer"
              >
                <Key className="size-3.5" />
                {hasCustomApiKey ? 'Gerenciar Chave de API' : 'Inserir Chave do Google Gemini'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── How to get an API key ── */}
      <Card className="border border-purple-500/20 bg-black/40 backdrop-blur-md">
        <CardContent className="p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="size-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Como obter sua chave gratuita em 30 segundos</h3>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm text-slate-300">
            <li>
              Acesse o{' '}
              <a
                href={AI_STUDIO_KEY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 hover:text-cyan-200 underline font-semibold inline-flex items-center gap-0.5"
              >
                Google AI Studio (aistudio.google.com)
                <ExternalLink className="size-3" />
              </a>{' '}
              com sua conta Google.
            </li>
            <li>Clique em &quot;Get API key&quot; (Criar chave de API) e copie o código iniciado por <code className="text-emerald-400 font-mono">AIzaSy...</code>.</li>
            <li>Abra o modal de chave no dev-kit.tech, cole e clique em &quot;Salvar&quot;. Pronto!</li>
          </ol>
        </CardContent>
      </Card>

      {/* ── Privacy Guarantee ── */}
      <div className="p-6 rounded-2xl bg-[#16213e]/60 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-8 text-emerald-400 shrink-0" />
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-white">Compromisso com Privacidade</h4>
            <p className="text-xs text-slate-400">
              Seus dados nunca são vendidos ou usados para treinar modelos. Ferramentas padrão rodam 100% no cliente.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
          Feito com <Heart className="size-3 text-rose-500 fill-rose-500" /> para a comunidade.
        </div>
      </div>

      <GeminiApiKeyModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        variant="settings"
      />
    </div>
  )
}
