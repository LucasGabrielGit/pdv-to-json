import type { Metadata } from 'next'
import AiDocGenerator from '@/components/tools/AiDocGenerator'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'AI API Documentation & OpenAPI Generator — Swagger YAML & JSON',
  description:
    'Free AI API Documentation generator. Convert Next.js route handlers, Express endpoints, or TypeScript interfaces into OpenAPI 3.0 (Swagger YAML/JSON), Markdown developer guides, and typed JSDoc comments.',
  keywords: [
    'ai api documentation generator',
    'openapi 3.0 yaml generator',
    'swagger json generator',
    'generate api docs from code',
    'jsdoc generator ai',
    'markdown api docs generator',
  ],
  openGraph: {
    title: 'AI API Documentation & OpenAPI Generator — Swagger YAML & JSON',
    description:
      'Generate OpenAPI 3.0 specifications, Markdown developer portal guides, and typed JSDoc from API code in seconds.',
    url: 'https://pdv-to-json.vercel.app/tools/ai-docs',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI API Documentation & OpenAPI Generator',
    description:
      'Generate OpenAPI 3.0 specs and Markdown documentation from API routes.',
    images: ['/og-image.svg'],
  },
}

export default function AiDocsPage() {
  return (
    <div className="py-8">
      <AiDocGenerator />
      <PixCoffee />
    </div>
  )
}
