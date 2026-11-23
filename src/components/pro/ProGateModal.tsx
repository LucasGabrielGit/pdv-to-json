'use client'

import React from 'react'
import { GeminiApiKeyModal } from '@/components/ai/GeminiApiKeyModal'

interface ProGateModalProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
  onUnlocked?: () => void
}

/**
 * Replaces the legacy paywall modal with the friendly community BYOK modal.
 * When daily limits are reached or deep reasoning is requested, users can
 * enter their free Google AI Studio key for unlimited access.
 */
export function ProGateModal({
  isOpen,
  onClose,
  featureName,
  onUnlocked,
}: ProGateModalProps) {
  return (
    <GeminiApiKeyModal
      isOpen={isOpen}
      onClose={onClose}
      variant={featureName ? 'settings' : 'limit'}
      featureName={featureName}
      onSaved={onUnlocked}
    />
  )
}
