import type { Metadata } from 'next'
import UserAgentInspector from '@/components/tools/UserAgentInspector'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'User-Agent Parser & Device Inspector — Browser, OS & Hardware Info',
  description:
    'Free online User-Agent string parser and device hardware inspector. Detect browser engine, operating system version, CPU architecture, screen resolution, and bot signatures.',
  keywords: [
    'user agent parser',
    'user agent inspector',
    'detect browser version',
    'detect operating system',
    'bot crawler detector',
    'device hardware screen resolution',
    'sec-ch-ua parser',
  ],
  openGraph: {
    title: 'User-Agent Parser & Device Inspector — Free & Private',
    description:
      'Inspect browser engine, OS version, CPU architecture, and bot signatures from any User-Agent string.',
    url: 'https://pdv-to-json.vercel.app/tools/user-agent',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'User-Agent Parser & Device Inspector',
    description:
      'Inspect browser engine, OS version, CPU architecture, and bot signatures.',
    images: ['/og-image.svg'],
  },
}

export default function UserAgentPage() {
  return (
    <div className="py-8">
      <UserAgentInspector />
      <PixCoffee />
    </div>
  )
}
