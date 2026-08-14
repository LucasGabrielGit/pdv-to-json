import type { Metadata } from 'next'
import ColorConverter from '@/components/tools/ColorConverter'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'Color Code Converter & Palette Generator — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online Color Code Converter and Palette Generator. Convert colors between HEX, RGB, HSL, and CSS variables with WCAG contrast accessibility checking and shade generation.',
  keywords: [
    'color converter online',
    'hex to rgb',
    'rgb to hsl',
    'color palette generator free',
    'wcag contrast checker',
    'css color variable converter',
    'client-side color converter',
    'private color tool',
  ],
  openGraph: {
    title: 'Color Code Converter & Palette Generator — Fast, 100% Client-Side & Private',
    description:
      'Convert colors between HEX, RGB, HSL, and CSS variables instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://dev-kit.tech/tools/color-converter',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Code Converter & Palette Generator — Fast, 100% Client-Side & Private',
    description:
      'Convert colors between HEX, RGB, HSL, and CSS variables instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function ColorConverterPage() {
  return (
    <div className="py-8">
      <ColorConverter />
      <PixCoffee />
    </div>
  )
}
