import type { Metadata } from 'next'
import AiCodeRefactor from '@/components/tools/AiCodeRefactor'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'AI Code Refactor & Optimizer — Modernize, Type & Clean Architecture',
  description:
    'Free AI Code Refactoring tool. Modernize legacy code to React 19/ES2024, optimize Big-O algorithms, convert JavaScript to TypeScript, and apply Clean Architecture / SOLID principles.',
  keywords: [
    'ai code refactor',
    'code optimizer ai',
    'convert javascript to typescript',
    'react 19 modernizer',
    'big o complexity optimizer',
    'clean code refactoring',
    'ai developer assistant',
  ],
  openGraph: {
    title: 'AI Code Refactor & Optimizer — Fast & Automated',
    description:
      'Modernize legacy code, optimize Big-O performance, and convert JavaScript to strict TypeScript with AI.',
    url: 'https://pdv-to-json.vercel.app/tools/ai-refactor',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Code Refactor & Optimizer',
    description:
      'Modernize code, optimize Big-O performance, and convert JS to TypeScript.',
    images: ['/og-image.svg'],
  },
}

export default function AiRefactorPage() {
  return (
    <div className="py-8">
      <AiCodeRefactor />
      <PixCoffee />
    </div>
  )
}
