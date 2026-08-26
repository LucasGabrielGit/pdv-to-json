import type { Metadata } from 'next'
import AiUnitTestGenerator from '@/components/tools/AiUnitTestGenerator'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'AI Unit Test Generator — Vitest, Jest, Pytest & Go Test Suites',
  description:
    'Free AI Unit Test Generator. Paste your TypeScript, JavaScript, Python, or Go code and generate comprehensive unit test suites with mocks, edge cases, and assertions.',
  keywords: [
    'ai unit test generator',
    'vitest test generator',
    'jest test generator',
    'pytest generator',
    'ai qa tools',
    'generate tests from code',
    'unit test assistant',
  ],
  openGraph: {
    title: 'AI Unit Test Generator — Vitest, Jest, Pytest',
    description:
      'Generate comprehensive unit test suites with mocks and assertions in Vitest, Jest, and Pytest.',
    url: 'https://pdv-to-json.vercel.app/tools/ai-unit-tests',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Unit Test Generator',
    description:
      'Generate comprehensive unit test suites in Vitest, Jest, and Pytest.',
    images: ['/og-image.svg'],
  },
}

export default function AiUnitTestPage() {
  return (
    <div className="py-8">
      <AiUnitTestGenerator />
      <PixCoffee />
    </div>
  )
}
