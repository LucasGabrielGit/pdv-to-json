import type { Metadata } from 'next'
import CronBuilder from '@/components/tools/CronBuilder'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'Cron Expression Generator & Parser Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online Cron Expression Generator and Parser. Build and validate 5-field crontab expressions with human-readable schedule explanations and next execution previews.',
  keywords: [
    'cron expression generator',
    'crontab builder online',
    'cron parser free',
    'cron schedule preview',
    'explain cron expression',
    'cron generator nextjs',
    'client-side cron tool',
    'private cron builder',
  ],
  openGraph: {
    title: 'Cron Expression Generator & Parser — Fast, 100% Client-Side & Private',
    description:
      'Build and validate 5-field crontab expressions with human-readable schedule explanations instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://dev-kit.tech/tools/cron-builder',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cron Expression Generator & Parser — Fast, 100% Client-Side & Private',
    description:
      'Build and validate 5-field crontab expressions with human-readable schedule explanations instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function CronBuilderPage() {
  return (
    <div className="py-8">
      <CronBuilder />
      <PixCoffee />
    </div>
  )
}
