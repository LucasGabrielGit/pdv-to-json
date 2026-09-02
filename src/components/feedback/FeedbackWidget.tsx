'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { FeedbackModal } from './FeedbackModal'

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-feedback-modal', handleOpen)
    return () => window.removeEventListener('open-feedback-modal', handleOpen)
  }, [])

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white shadow-xl shadow-purple-950/60 border border-purple-400/30 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:shadow-purple-600/40 cursor-pointer group"
        aria-label="Abrir formulário de feedback"
        title="Enviar sugestão ou feedback"
      >
        <MessageSquarePlus className="size-4 text-white group-hover:rotate-12 transition-transform duration-200" />
        <span className="text-xs font-semibold hidden sm:inline-block">Feedback</span>
      </button>

      {/* Modal */}
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

/** Helper function to open feedback modal from anywhere in the app */
export function openFeedbackModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('open-feedback-modal'))
  }
}
