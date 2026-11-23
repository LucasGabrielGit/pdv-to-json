'use client'

import { useEffect, useState } from 'react'
import { ADS_CONFIG } from '@/config/ads'

export function AdSenseScript() {
  const [shouldLoadScript, setShouldLoadScript] = useState(false)

  useEffect(() => {
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.PUBLISHER_ID) return

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
    }

    const timer = setTimeout(triggerLoad, 2500)
    return () => {
      cleanupEvents()
      clearTimeout(timer)
    }
  }, [])

  if (!ADS_CONFIG.enabled || !ADS_CONFIG.PUBLISHER_ID || !shouldLoadScript) {
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
