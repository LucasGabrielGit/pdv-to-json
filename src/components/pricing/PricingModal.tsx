'use client'

import React from 'react'
import { GeminiApiKeyModal } from '@/components/ai/GeminiApiKeyModal'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  defaultPlan?: string
}

/**
 * REPLACED: Paid pricing has been sunset.
 * Renders the BYOK setup modal so users can unlock unlimited free AI.
 */
export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  return (
    <GeminiApiKeyModal
      isOpen={isOpen}
      onClose={onClose}
      variant="settings"
      featureName="Uso Ilimitado Gratuito (BYOK)"
    />
  )
}
