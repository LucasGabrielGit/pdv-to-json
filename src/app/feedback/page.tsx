'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Sparkles,
  Bug,
  Star,
  MessageCircle,
  RotateCcw,
  CheckCircle2,
  Send,
  ArrowLeft,
  Heart,
} from 'lucide-react'
import { GithubIcon } from '@/assets/github-icon'
import { ToolHeader } from '@/components/converter/ToolHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

type FeedbackType = 'suggestion' | 'bug' | 'praise' | 'general'

export default function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>('suggestion')
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email)
        setEmail(user.email)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast.error('Por favor, digite sua mensagem de feedback.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          rating,
          message: message.trim(),
          email: email.trim() || undefined,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '/feedback',
          deviceInfo: {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
          },
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Erro ao enviar feedback.')
      }

      setIsSuccess(true)
      toast.success('Feedback enviado com sucesso! Muito obrigado pela contribuição.')
      setMessage('')
    } catch (err) {
      toast.error((err as Error).message || 'Falha ao enviar feedback.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* ── Top Back Button ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent"
        >
          <ArrowLeft className="size-3.5" />
          <span>Voltar para Ferramentas</span>
        </Link>

        <a
          href="https://github.com/LucasGabrielGit/pdv-to-json"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
        >
          <GithubIcon />
          <span>GitHub Issues</span>
        </a>
      </div>

      {/* ── Header ── */}
      <ToolHeader
        title="Central de Feedback &amp; Sugestões"
        description="Ajude a construir o futuro do DevKit. Sugira novas ferramentas, relate bugs ou nos diga como podemos melhorar seu fluxo de desenvolvimento."
        badgeText="Comunidade DevKit"
      />

      {/* ── Form Card ── */}
      <Card className="border border-purple-500/30 bg-[#16213e]/90 backdrop-blur-xl shadow-2xl shadow-purple-950/40">
        <CardContent className="p-6 md:p-8 space-y-6">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="size-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Feedback Recebido com Sucesso!</h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Muito obrigado por nos ajudar a tornar o DevKit cada vez melhor. Cada sugestão é lida e considerada na nossa fila de desenvolvimento.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Button
                  onClick={() => setIsSuccess(false)}
                  variant="outline"
                  className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                >
                  Enviar outro feedback
                </Button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
                >
                  Ir para Ferramentas
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Qual é o objetivo do seu feedback?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(
                    [
                      { id: 'suggestion', label: 'Sugestão de Ferramenta', icon: Sparkles },
                      { id: 'bug', label: 'Relatar um Bug', icon: Bug },
                      { id: 'praise', label: 'Elogio', icon: Star },
                      { id: 'general', label: 'Opinião Geral', icon: MessageCircle },
                    ] as const
                  ).map((t) => {
                    const Icon = t.icon
                    const isSelected = type === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`p-3 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-2 border cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                            : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="text-center">{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Como você avalia sua experiência no DevKit?
                  </label>
                  <span className="text-xs text-amber-400 font-semibold">
                    {rating === 5 ? '⭐⭐⭐⭐⭐ Excelente' : `${rating} de 5 estrelas`}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 bg-black/30 p-3 rounded-xl border border-white/5 w-fit">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 transition-transform hover:scale-125 cursor-pointer"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        className={`size-6 transition-colors ${
                          (hoverRating !== null ? star <= hoverRating : star <= rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Sua Mensagem *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === 'suggestion'
                      ? 'Descreva a ferramenta ou recurso que facilitaria seu dia a dia...'
                      : type === 'bug'
                      ? 'Descreva o problema ocorrido, qual ferramenta usou e o comportamento esperado...'
                      : 'Conte-nos sua experiência, críticas ou elogios...'
                  }
                  rows={5}
                  required
                  className="w-full text-xs font-sans p-3.5 rounded-xl bg-black/40 border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500/50 resize-y leading-relaxed"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Seu E-mail
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {userEmail ? 'Conectado à sua conta' : 'Opcional (se desejar resposta da equipe)'}
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@dev.com"
                  className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500/50"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 gap-2"
                >
                  {isSubmitting ? (
                    <RotateCcw className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  <span>{isSubmitting ? 'Enviando feedback...' : 'Enviar Feedback'}</span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ── Community Callout ── */}
      <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <Heart className="size-4 text-rose-400 fill-rose-400" />
            <span>Desenvolvido para e pela comunidade</span>
          </h3>
          <p className="text-xs text-slate-400">
            O DevKit é um projeto vivo. Todas as sugestões são avaliadas para novas versões.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-colors shrink-0"
        >
          Explorar Ferramentas
        </Link>
      </div>
    </div>
  )
}
