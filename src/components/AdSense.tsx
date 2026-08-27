'use client'

import { useEffect, useRef, useState } from 'react'
import { ADS_CONFIG } from '@/config/ads'
import { getUserCredits } from '@/utils/creditsManager'

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

export function AdSense({ slot, format = 'auto', className = '' }: AdSenseProps) {
  const initialized = useRef(false)
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    const creds = getUserCredits()
    if (creds.isProSubscriber) {
      setIsPro(true)
      return
    }

    if (!ADS_CONFIG.enabled || slot === 'XXXXXXXXXX') return
    if (initialized.current) return
    initialized.current = true

    // Push ad init
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {
      // Silently ignore in dev or adblockers
    }
  }, [slot])

  if (!ADS_CONFIG.enabled || isPro || slot === 'XXXXXXXXXX') return null

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
