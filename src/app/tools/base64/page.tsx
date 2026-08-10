import type { Metadata } from 'next'
import Base64Converter from '@/components/tools/Base64Converter'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'Base64 Encoder / Decoder Online — Real-time & 100% Private',
  description:
    'Free & 100% private online Base64 encoder and decoder. Convert text to Base64 or decode Base64 strings in real-time. Supports URL-safe Base64 and UTF-8 characters with zero server uploads.',
  keywords: [
    'base64 encode',
    'base64 decode',
    'base64 encoder online',
    'base64 decoder online',
    'url safe base64',
    'convert text to base64',
    'decode base64 string free',
    'client-side base64 converter',
  ],
  openGraph: {
    title: 'Base64 Encoder / Decoder — Real-time & 100% Private',
    description:
      'Encode text to Base64 or decode Base64 strings in real-time. 100% private — your data never leaves your device.',
    url: 'https://pdv-to-json.vercel.app/tools/base64',
    siteName: 'devkit.io',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base64 Encoder / Decoder — Real-time & 100% Private',
    description:
      'Encode text to Base64 or decode Base64 strings in real-time. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function Base64Page() {
  return (
    <div className="py-8">
      <Base64Converter />
      <PixCoffee />
    </div>
  )
}
