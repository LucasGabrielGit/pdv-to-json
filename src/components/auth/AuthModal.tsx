'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { ShieldCheck, Mail, Sparkles, X, ArrowRight, Loader2 } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClient()
  const configured = isSupabaseConfigured()

  if (!open) return null

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    if (!configured) {
      toast.info('Supabase Configuration Needed', {
        description:
          'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.',
      })
      return
    }

    setIsLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      })
      if (error) throw error
    } catch (err) {
      toast.error('Sign in failed', {
        description: (err as Error).message || 'Could not authenticate.',
      })
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!configured) {
      toast.info('Supabase Configuration Needed', {
        description:
          'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.',
      })
      return
    }

    if (!email.trim()) {
      toast.error('Please enter your email address.')
      return
    }


    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error

      setEmailSent(true)
      toast.success('Magic link sent!', {
        description: 'Check your email inbox to sign in instantly.',
      })
    } catch (err) {
      toast.error('Failed to send magic link', {
        description: (err as Error).message || 'Please check your email address.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      {/* Background click to dismiss */}
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-purple-500/40 bg-[#16213e] shadow-2xl shadow-purple-950/60 p-6 md:p-8 space-y-6 z-10"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="size-3" />
              <span>dev-kit.tech Account</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Sign In or Create Account
            </h2>
            <p className="text-xs text-slate-400">
              Sync your AI generation credits and unlock Pro capabilities.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {emailSent ? (
          <div className="py-6 text-center space-y-4">
            <div className="size-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto">
              <Mail className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Check your email</h3>
              <p className="text-xs text-slate-300">
                We sent a secure login link to <span className="font-semibold text-purple-300">{email}</span>.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmailSent(false)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs"
            >
              Use a different email or provider
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* OAuth Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <svg className="size-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-white/10" />
              <span className="bg-[#16213e] px-3 text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                or with email
              </span>
            </div>

            {/* Email Magic Link Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="text-xs text-slate-400">
                  Email Address
                </Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="bg-black/40 border-purple-500/30 text-white placeholder:text-slate-500 text-xs rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md gap-2"
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="size-3.5" />
                )}
                {isLoading ? 'Sending Link...' : 'Send Magic Login Link'}
              </Button>
            </form>
          </div>
        )}

        {/* Privacy Note */}
        <div className="pt-2 border-t border-purple-500/20 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
          <span>100% Client-Side Privacy: Your code and files are never stored.</span>
        </div>
      </div>
    </div>
  )
}
