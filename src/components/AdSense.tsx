'use client'

import { useEffect, useRef } from 'react'
import { ADS_CONFIG } from '@/config/ads'

interface AdSenseProps {
  /** The ad unit slot ID from your AdSense dashboard */
  slot: string
  /** Ad layout format. 'auto' works for most responsive placements */
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  /** Extra CSS classes to apply to the outer wrapper */
  className?: string
}

// Extend Window to include the adsbygoogle push method
declare global {
  interface Window {
    adsbygoogle: { push: (config: object) => void }[]
  }
}

/**
 * Google AdSense ad unit component.
 *
 * Usage:
 *   <AdSense slot="1234567890" />
 *
 * The AdSense script is injected once into <head> on first mount.
 * Each instance pushes its own init to the adsbygoogle queue.
 */
export function AdSense({ slot, format = 'auto', className = '' }: AdSenseProps) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!ADS_CONFIG.enabled) return
    if (initialized.current) return
    initialized.current = true

    // Inject the AdSense script into <head> if it hasn't been added yet
    const scriptId = 'google-adsense-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.PUBLISHER_ID}`
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
    }

    // Push ad init
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (_) {
      // AdSense may throw in dev or adblocker environments — silently ignore
    }
  }, [])

  if (!ADS_CONFIG.enabled) return null

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      aria-label="Advertisement"
      role="complementary"
    >
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={ADS_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

export default AdSense
