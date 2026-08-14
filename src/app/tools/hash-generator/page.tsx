import type { Metadata } from 'next'
import HashGenerator from '@/components/tools/HashGenerator'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'Hash Generator & Checksum Verifier Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online Hash Generator and Checksum Verifier. Generate SHA-256, SHA-512, SHA-384, SHA-1, and MD5 cryptographic hashes for text and binary files instantly in your browser.',
  keywords: [
    'hash generator',
    'sha256 generator',
    'md5 generator',
    'sha512 generator',
    'file checksum verifier',
    'checksum calculator',
    'client-side hash generator',
    'private hash generator',
  ],
  openGraph: {
    title: 'Hash Generator & Checksum Verifier — Fast, 100% Client-Side & Private',
    description:
      'Generate SHA-256, SHA-512, SHA-384, SHA-1, and MD5 hashes for text and files instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://dev-kit.tech/tools/hash-generator',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hash Generator & Checksum Verifier — Fast, 100% Client-Side & Private',
    description:
      'Generate SHA-256, SHA-512, SHA-384, SHA-1, and MD5 hashes for text and files instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function HashGeneratorPage() {
  return (
    <div className="py-8">
      <HashGenerator />
      <PixCoffee />
    </div>
  )
}
