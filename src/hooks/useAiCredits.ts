'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  getUserCredits,
  syncUserCreditsWithCloud,
  consumeCredit,
  canConsumeCredit,
  hasCustomApiKey as hasKey,
  CREDITS_UPDATED_EVENT,
  type UserCredits,
} from '@/utils/creditsManager'
import { createClient } from '@/lib/supabase/client'
import { DAILY_FREE_CREDITS_LIMIT } from '@/lib/creditsConfig'

/**
 * Single source of truth for the AI access cascade:
 * BYOK (unlimited) -> daily free credits -> limit modal asking for a key.
 */
export function useAiCredits() {
  const [userCredits, setUserCredits] = useState<UserCredits>(() => ({
    freeCreditsRemaining: DAILY_FREE_CREDITS_LIMIT,
    lastDailyResetDate: '',
  }))
  const [limitModalOpen, setLimitModalOpen] = useState(false)
  const [keyModalOpen, setKeyModalOpen] = useState(false)
  const [modalFeature, setModalFeature] = useState('Deep Reasoning AI')

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const refreshFromLocal = () => setUserCredits(getUserCredits())

    refreshFromLocal()
    syncUserCreditsWithCloud(supabase).then(setUserCredits)

    window.addEventListener(CREDITS_UPDATED_EVENT, refreshFromLocal)
    return () => window.removeEventListener(CREDITS_UPDATED_EVENT, refreshFromLocal)
  }, [supabase])

  const hasCustomApiKey = hasKey(userCredits)
  const freeCreditsRemaining = userCredits.freeCreditsRemaining

  /**
   * Call before firing an AI request. Returns false (and opens the
   * "limit reached" modal) when the user has no key and no credits left.
   */
  const ensureCanGenerate = useCallback((): boolean => {
    if (canConsumeCredit().allowed) return true
    setLimitModalOpen(true)
    return false
  }, [])

  /** Call after a successful generation. No-op for BYOK users. */
  const registerGeneration = useCallback(() => {
    consumeCredit()
    // For logged in users, the server already deducted the cloud balance.
    syncUserCreditsWithCloud(supabase).then(setUserCredits)
  }, [supabase])

  /** Opens the "limit reached" modal, e.g. after a 403 from /api/ai/*. */
  const handleLimitReached = useCallback(() => {
    setLimitModalOpen(true)
  }, [])

  /**
   * Premium features (deep reasoning model) require the user's own key.
   * Runs `onAllowed` right away if a key is configured, otherwise opens the key modal.
   */
  const requireByok = useCallback(
    (featureName = 'Deep Reasoning AI', onAllowed?: () => void): boolean => {
      if (hasKey(getUserCredits())) {
        onAllowed?.()
        return true
      }
      setModalFeature(featureName)
      setKeyModalOpen(true)
      return false
    },
    []
  )

  return {
    userCredits,
    userCustomApiKey: userCredits.userCustomApiKey,
    hasCustomApiKey,
    freeCreditsRemaining,
    dailyLimit: DAILY_FREE_CREDITS_LIMIT,
    limitModalOpen,
    setLimitModalOpen,
    keyModalOpen,
    setKeyModalOpen,
    modalFeature,
    ensureCanGenerate,
    registerGeneration,
    handleLimitReached,
    requireByok,
  }
}
