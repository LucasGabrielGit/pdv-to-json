import type { Metadata } from 'next'
import CodeAnalyzer from '@/components/tools/CodeAnalyzer'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'AI Code Reviewer & Architect — Security, Performance & Refactoring',
  description:
    'Free online AI Code Reviewer and Architect. Audit code for OWASP security vulnerabilities, performance optimizations, clean code refactoring, and automated unit test generation.',
  keywords: [
    'ai code reviewer',
    'ai code analyzer',
    'code security audit online',
    'owasp code scanner',
    'ai refactoring tool',
    'unit test generator ai',
    'gemini code reviewer',
  ],
  openGraph: {
    title: 'AI Code Reviewer & Architect — Security, Performance & Refactoring',
    description:
      'Audit code for security vulnerabilities, performance optimizations, and clean refactoring using AI.',
    url: 'https://dev-kit.tech/tools/code-analyzer',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Code Reviewer & Architect — Security, Performance & Refactoring',
    description:
      'Audit code for security vulnerabilities, performance optimizations, and clean refactoring using AI.',
    images: ['/og-image.svg'],
  },
}

export default function CodeAnalyzerPage() {
  return (
    <div className="py-8">
      <CodeAnalyzer />
      <PixCoffee />
    </div>
  )
}
