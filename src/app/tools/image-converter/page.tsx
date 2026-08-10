import type { Metadata } from 'next'
import ImageConverter from '@/components/tools/ImageConverter'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'Image Converter Online (PNG, JPEG, WebP) — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online Image Converter. Convert PNG to WebP, JPEG to PNG, or WebP to JPEG instantly in your browser. Features quality compression & resolution scaling with zero server uploads.',
  keywords: [
    'image converter',
    'png to webp',
    'jpg to webp converter',
    'png to jpeg',
    'webp converter online',
    'compress image online free',
    'client-side image converter',
    'private image converter',
  ],
  openGraph: {
    title: 'Image Converter (PNG, JPEG, WebP) — Fast, 100% Client-Side & Private',
    description:
      'Convert images between PNG, JPEG, and WebP formats instantly in your browser. 100% private — your images never leave your device.',
    url: 'https://pdv-to-json.vercel.app/tools/image-converter',
    siteName: 'devkit.io',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Converter (PNG, JPEG, WebP) — Fast, 100% Client-Side & Private',
    description:
      'Convert images between PNG, JPEG, and WebP formats instantly in your browser. 100% private — your images never leave your device.',
    images: ['/og-image.svg'],
  },
}

export default function ImageConverterPage() {
  return (
    <div className="py-8">
      <ImageConverter />
      <PixCoffee />
    </div>
  )
}
