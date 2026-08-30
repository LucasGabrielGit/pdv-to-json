import type { Metadata } from 'next'
import EnvFormatter from '@/components/tools/EnvFormatter'

export const metadata: Metadata = {
  title: '.env Formatter, Linter & .env.example Generator — 100% Client-Side',
  description:
    'Format, validate, and align .env files. Generate clean, sanitized .env.example templates for GitHub repositories with zero server data storage.',
  alternates: {
    canonical: 'https://dev-kit.tech/tools/env-formatter',
  },
}

export default function EnvFormatterPage() {
  return <EnvFormatter />
}
