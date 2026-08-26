'use client'

import { useState, useEffect, useMemo } from 'react'
import { getUserCredits, syncUserCreditsWithCloud } from '@/utils/creditsManager'
import { createClient } from '@/lib/supabase/client'

export function useProStatus() {
  const [isProSubscriber, setIsProSubscriber] = useState(false)
  const [hasCustomApiKey, setHasCustomApiKey] = useState(false)
  const [purchasedCredits, setPurchasedCredits] = useState(0)
  const [freeCreditsRemaining, setFreeCreditsRemaining] = useState(5)
  const [isProModalOpen, setIsProModalOpen] = useState(false)
  const [proModalFeature, setProModalFeature] = useState('Deep Reasoning AI')

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const creds = getUserCredits()
    setIsProSubscriber(creds.isProSubscriber)
    setHasCustomApiKey(Boolean(creds.userCustomApiKey && creds.userCustomApiKey.trim()))
    setPurchasedCredits(creds.purchasedCredits)
    setFreeCreditsRemaining(creds.freeCreditsRemaining)

    // Sync cloud state
    syncUserCreditsWithCloud(supabase).then((synced) => {
      setIsProSubscriber(synced.isProSubscriber)
      setHasCustomApiKey(Boolean(synced.userCustomApiKey && synced.userCustomApiKey.trim()))
      setPurchasedCredits(synced.purchasedCredits)
      setFreeCreditsRemaining(synced.freeCreditsRemaining)
    })
  }, [supabase])

  const isProOrByok = isProSubscriber || hasCustomApiKey || purchasedCredits > 0

  const requirePro = (featureName = 'Deep Reasoning AI', onAllowed?: () => void) => {
    if (isProOrByok) {
      if (onAllowed) onAllowed()
      return true
    }
    setProModalFeature(featureName)
    setIsProModalOpen(true)
    return false
  }

  return {
    isProSubscriber,
    hasCustomApiKey,
    purchasedCredits,
    freeCreditsRemaining,
    isProOrByok,
    isProModalOpen,
    setIsProModalOpen,
    proModalFeature,
    requirePro,
  }
}
