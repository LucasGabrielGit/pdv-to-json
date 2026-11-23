'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  getUserCredits,
  syncUserCreditsWithCloud,
  CREDITS_UPDATED_EVENT,
  type UserCredits,
} from '@/utils/creditsManager'
import { createClient } from '@/lib/supabase/client'
import { DAILY_FREE_CREDITS_LIMIT } from '@/lib/creditsConfig'

/**
 * Backward compatibility hook for existing tool pages.
 * Replaced internal Pro logic with BYOK and daily community quotas.
 */
export function useProStatus() {
  const [credits, setCredits] = useState<UserCredits>(() => getUserCredits())
  const [isProModalOpen, setIsProModalOpen] = useState(false)
  const [proModalFeature, setProModalFeature] = useState('Deep Reasoning AI')

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const handleUpdate = () => {
      setCredits(getUserCredits())
    }

    handleUpdate()
    syncUserCreditsWithCloud(supabase).then(setCredits)

    window.addEventListener(CREDITS_UPDATED_EVENT, handleUpdate)
    return () => window.removeEventListener(CREDITS_UPDATED_EVENT, handleUpdate)
  }, [supabase])

  const hasCustomApiKey = Boolean(
    credits.userCustomApiKey && credits.userCustomApiKey.trim()
  )
  const isProOrByok = hasCustomApiKey
  const freeCreditsRemaining = credits.freeCreditsRemaining ?? DAILY_FREE_CREDITS_LIMIT

  const requirePro = useCallback(
    (featureName = 'Deep Reasoning AI', onAllowed?: () => void) => {
      if (hasCustomApiKey) {
        if (onAllowed) onAllowed()
        return true
      }
      setProModalFeature(featureName)
      setIsProModalOpen(true)
      return false
    },
    [hasCustomApiKey]
  )

  return {
    isProSubscriber: false,
    hasCustomApiKey,
    purchasedCredits: 0,
    freeCreditsRemaining,
    dailyLimit: DAILY_FREE_CREDITS_LIMIT,
    userCustomApiKey: credits.userCustomApiKey,
    userCredits: credits,
    isProOrByok,
    isProModalOpen,
    setIsProModalOpen,
    proModalFeature,
    requirePro,
  }
}
