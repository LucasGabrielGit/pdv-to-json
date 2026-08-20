'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'full' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]', className)}
    >
      <defs>
        <linearGradient id="devkit-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="devkit-grad-symbol" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="devkit-grad-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Rounded Squircle Background */}
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="10"
        fill="#121226"
        stroke="url(#devkit-grad-bg)"
        strokeWidth="2"
      />

      {/* Subtle Inner Glow */}
      <rect
        x="3"
        y="3"
        width="34"
        height="34"
        rx="8.5"
        fill="url(#devkit-grad-bg)"
        fillOpacity="0.12"
      />

      {/* Left Bracket < */}
      <path
        d="M16 13L10.5 19.5L16 26"
        stroke="url(#devkit-grad-symbol)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Slash / Terminal Prompt */}
      <path
        d="M23 13L17.5 27"
        stroke="url(#devkit-grad-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Right Bracket > */}
      <path
        d="M24 13L29.5 19.5L24 26"
        stroke="url(#devkit-grad-symbol)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tech Sparkle Dot */}
      <circle cx="30.5" cy="11.5" r="1.5" fill="#38BDF8" />
    </svg>
  )
}

export function Logo({ variant = 'full', size = 'md', className }: LogoProps) {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <LogoIcon size={iconSizes[size]} />
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-black tracking-tight text-white flex items-center', textSizes[size])}>
            dev-kit
            <span className="bg-linear-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              .tech
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
