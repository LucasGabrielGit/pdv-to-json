'use client'

import { useEffect, useState, useMemo } from 'react'
import { getUserCredits, syncUserCreditsWithCloud } from '@/utils/creditsManager'
import { createClient } from '@/lib/supabase/client'
import { ADS_CONFIG } from '@/config/ads'

export function AdSenseScript() {
  const [isPro, setIsPro] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Check local state
    const creds = getUserCredits()
    if (creds.isProSubscriber) {
      setIsPro(true)
      document.body.classList.add('is-pro-member')
      return
    }

    // Sync cloud state
    syncUserCreditsWithCloud(supabase).then((synced) => {
      if (synced.isProSubscriber) {
        setIsPro(true)
        document.body.classList.add('is-pro-member')
      }
    })
  }, [supabase])

  // If user is Pro or ads are disabled, do NOT load AdSense
  if (isPro || !ADS_CONFIG.enabled || !ADS_CONFIG.PUBLISHER_ID) {
    return null
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.PUBLISHER_ID}`}
      crossOrigin="anonymous"
    />
  )
}
