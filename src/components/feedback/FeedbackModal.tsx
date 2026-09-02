'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  X,
  MessageSquarePlus,
  Sparkles,
  Bug,
  Star,
  MessageCircle,
  RotateCcw,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { tools } from '@/lib/tools-registry'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  initialToolId?: string
}

type FeedbackType = 'suggestion' | 'bug' | 'praise' | 'general'

export function FeedbackModal({ isOpen, onClose, initialToolId }: FeedbackModalProps) {
  const pathname = usePathname()
  const [type, setType] = useState<FeedbackType>('suggestion')
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Auto-detect current tool from pathname
  const currentTool = tools.find((t) => t.id === initialToolId || t.href === pathname)

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false)
      return
    }

    // Check if user is logged in to prefill email
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email)
        setEmail(user.email)
      }
    })
  }, [isOpen])

  if (!isOpen) return null

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
          toolId: currentTool?.id || initialToolId || undefined,
          pageUrl: typeof window !== 'undefined' ? window.location.href : pathname,
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
      toast.success('Feedback recebido com sucesso! Obrigado pela colaboração.')

      setTimeout(() => {
        onClose()
        setMessage('')
        setIsSuccess(false)
      }, 2000)
    } catch (err) {
      toast.error((err as Error).message || 'Falha ao enviar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-purple-500/30 bg-[#16213e]/95 p-6 shadow-2xl shadow-purple-950/50 backdrop-blur-xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 shrink-0">
            <MessageSquarePlus className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Enviar Feedback</span>
              {currentTool && (
                <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-300 border-purple-500/20 font-normal">
                  {currentTool.name}
                </Badge>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Sugira ferramentas, relate problemas ou nos conte o que achou da plataforma.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="size-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-6" />
            </div>
            <h3 className="text-base font-bold text-white">Muito obrigado!</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Seu feedback foi registrado e ajudará a guiar as próximas ferramentas do DevKit.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tipo de Feedback</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'suggestion', label: 'Sugestão', icon: Sparkles, color: 'purple' },
                    { id: 'bug', label: 'Bug / Erro', icon: Bug, color: 'rose' },
                    { id: 'praise', label: 'Elogio', icon: Star, color: 'amber' },
                    { id: 'general', label: 'Geral', icon: MessageCircle, color: 'cyan' },
                  ] as const
                ).map((t) => {
                  const Icon = t.icon
                  const isSelected = type === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                          : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10'
                      }`}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Sua Avaliação</label>
                <span className="text-[11px] text-amber-400 font-medium">
                  {rating === 5 ? '⭐⭐⭐⭐⭐ Excelente' : `${rating} / 5 estrelas`}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/5 w-fit">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`size-5 transition-colors ${
                        (hoverRating !== null ? star <= hoverRating : star <= rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Mensagem *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  type === 'suggestion'
                    ? 'Qual ferramenta ou recurso você gostaria de ver no DevKit?'
                    : type === 'bug'
                    ? 'O que aconteceu de errado? Se puder, descreva como reproduzir o erro...'
                    : 'Escreva seus comentários, críticas ou sugestões...'
                }
                rows={4}
                required
                className="w-full text-xs font-sans p-3 rounded-xl bg-black/40 border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500/50 resize-y leading-relaxed"
              />
            </div>

            {/* Email Input (Optional for guests, prefilled if logged in) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">E-mail para Contato</label>
                <span className="text-[10px] text-slate-500">
                  {userEmail ? 'Conectado à sua conta' : 'Opcional (se desejar resposta)'}
                </span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full text-xs p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500/50"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-lg shadow-purple-600/25 gap-2"
              >
                {isSubmitting ? (
                  <RotateCcw className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Feedback'}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
