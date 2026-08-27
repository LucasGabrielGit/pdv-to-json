'use client'

import { useEffect, useState, useMemo } from 'react'
import { getUserCredits, syncUserCreditsWithCloud } from '@/utils/creditsManager'
import { createClient } from '@/lib/supabase/client'
import { ADS_CONFIG } from '@/config/ads'

export function AdSenseScript() {
  const [isPro, setIsPro] = useState(false)
  const [shouldLoadScript, setShouldLoadScript] = useState(false)
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

  useEffect(() => {
    if (isPro || !ADS_CONFIG.enabled || !ADS_CONFIG.PUBLISHER_ID) return

    let loaded = false
    const triggerLoad = () => {
      if (loaded) return
      loaded = true
      setShouldLoadScript(true)
      cleanupEvents()
    }

    const events = ['scroll', 'mousemove', 'touchstart', 'keydown', 'click']
    const cleanupEvents = () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, triggerLoad, { capture: true })
      })
    }

    events.forEach((evt) => {
      window.addEventListener(evt, triggerLoad, { passive: true, capture: true, once: true })
    })

    // Fallback: Idle callback or 2.5s timer
    if ('requestIdleCallback' in window) {
      const idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(triggerLoad, { timeout: 2500 })
      return () => {
        cleanupEvents()
        if ('cancelIdleCallback' in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId)
        }
      }
    } else {
      const timer = setTimeout(triggerLoad, 2500)
      return () => {
        cleanupEvents()
        clearTimeout(timer)
      }
    }
  }, [isPro])

  // If user is Pro or ads are disabled, do NOT load AdSense
  if (isPro || !ADS_CONFIG.enabled || !ADS_CONFIG.PUBLISHER_ID || !shouldLoadScript) {
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
