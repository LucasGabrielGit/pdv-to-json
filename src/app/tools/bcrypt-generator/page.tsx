import type { Metadata } from 'next'
import BcryptGenerator from '@/components/tools/BcryptGenerator'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'Bcrypt Hash Generator & Verifier — Password Hash Sandbox',
  description:
    'Free online Bcrypt hash generator and password verifier. Hash passwords with customizable salt rounds and test hash matches 100% locally in your browser.',
  keywords: [
    'bcrypt generator',
    'bcrypt hash generator',
    'bcrypt password verifier',
    'bcrypt salt rounds',
    'test bcrypt hash',
    'online password hasher',
    'security developer tools',
  ],
  openGraph: {
    title: 'Bcrypt Hash Generator & Verifier — Free & Private',
    description:
      'Generate secure Bcrypt password hashes and verify password matches locally in your browser.',
    url: 'https://pdv-to-json.vercel.app/tools/bcrypt-generator',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bcrypt Hash Generator & Verifier',
    description:
      'Generate secure Bcrypt password hashes and verify password matches locally in your browser.',
    images: ['/og-image.svg'],
  },
}

export default function BcryptGeneratorPage() {
  return (
    <div className="py-8">
      <BcryptGenerator />
      <PixCoffee />
    </div>
  )
}
