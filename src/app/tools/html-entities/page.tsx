import type { Metadata } from 'next'
import HtmlEntityConverter from '@/components/tools/HtmlEntityConverter'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'HTML Entities & String Escaper — Encode & Decode Special Characters',
  description:
    'Free & private online HTML Entities encoder, decoder, and string escaper. Convert special characters to named, decimal, and hex entities or escape JSON/JS strings.',
  keywords: [
    'html entity encoder',
    'html entity decoder',
    'escape html',
    'unescape html',
    'json string escape',
    'unicode code points',
    'html entities list',
    'special characters encoder',
  ],
  openGraph: {
    title: 'HTML Entities & String Escaper — Free & Private',
    description:
      'Encode & decode HTML entities and escape JSON/JavaScript strings in real-time with zero server uploads.',
    url: 'https://pdv-to-json.vercel.app/tools/html-entities',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HTML Entities & String Escaper',
    description:
      'Encode & decode HTML entities and escape JSON/JavaScript strings in real-time.',
    images: ['/og-image.svg'],
  },
}

export default function HtmlEntitiesPage() {
  return (
    <div className="py-8">
      <HtmlEntityConverter />
      <PixCoffee />
    </div>
  )
}
