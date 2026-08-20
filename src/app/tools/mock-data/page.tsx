import type { Metadata } from 'next'
import MockDataGenerator from '@/components/tools/MockDataGenerator'

export const metadata: Metadata = {
  title: 'Mock Data & Schema Generator (JSON, CSV, SQL)',
  description:
    'Generate realistic fake testing data with custom schema fields and export instantly to JSON arrays, CSV spreadsheets, or SQL INSERT statements.',
  alternates: {
    canonical: 'https://dev-kit.tech/tools/mock-data',
  },
}

export default function MockDataPage() {
  return <MockDataGenerator />
}
