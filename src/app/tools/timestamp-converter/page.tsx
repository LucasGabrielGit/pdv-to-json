import type { Metadata } from 'next'
import TimestampConverter from '@/components/tools/TimestampConverter'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'Unix Timestamp & Epoch Converter Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online Unix Timestamp and Epoch Converter. Convert timestamps in seconds or milliseconds to ISO 8601, UTC, local time, and human relative dates with a live ticking clock.',
  keywords: [
    'unix timestamp converter',
    'epoch converter online',
    'timestamp to iso 8601',
    'timestamp to date',
    'convert epoch seconds to ms',
    'live unix clock',
    'client-side timestamp converter',
    'private timestamp tool',
  ],
  openGraph: {
    title: 'Unix Timestamp & Epoch Converter — Fast, 100% Client-Side & Private',
    description:
      'Convert Unix timestamps to ISO 8601, UTC, and local date formats instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://dev-kit.tech/tools/timestamp-converter',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unix Timestamp & Epoch Converter — Fast, 100% Client-Side & Private',
    description:
      'Convert Unix timestamps to ISO 8601, UTC, and local date formats instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function TimestampConverterPage() {
  return (
    <div className="py-8">
      <TimestampConverter />
      <PixCoffee />
    </div>
  )
}
