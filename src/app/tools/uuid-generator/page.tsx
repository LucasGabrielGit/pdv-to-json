import type { Metadata } from 'next'
import UuidGenerator from '@/components/tools/UuidGenerator'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'UUID & ULID Generator Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online UUID & ULID Generator. Generate UUID v4 (random), UUID v7 (time-ordered), and ULID (Base32) unique identifiers in bulk with JSON, CSV, and SQL export options.',
  keywords: [
    'uuid generator',
    'uuid v4 generator',
    'uuid v7 generator',
    'ulid generator',
    'guid generator online',
    'generate uuid bulk',
    'client-side uuid generator',
    'private uuid generator',
  ],
  openGraph: {
    title: 'UUID & ULID Generator — Fast, 100% Client-Side & Private',
    description:
      'Generate UUID v4, UUID v7, and ULID identifiers in bulk instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://dev-kit.tech/tools/uuid-generator',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UUID & ULID Generator — Fast, 100% Client-Side & Private',
    description:
      'Generate UUID v4, UUID v7, and ULID identifiers in bulk instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function UuidGeneratorPage() {
  return (
    <div className="py-8">
      <UuidGenerator />
      <PixCoffee />
    </div>
  )
}
