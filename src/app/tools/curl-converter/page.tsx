import type { Metadata } from 'next'
import CurlConverter from '@/components/tools/CurlConverter'

export const metadata: Metadata = {
  title: 'cURL to Code Converter (Fetch, Axios, Python, Go, PHP, Rust)',
  description:
    'Convert cURL command lines into production-ready API client code in JavaScript (Fetch/Axios), Python (Requests), Go, PHP, and Rust instantly.',
  alternates: {
    canonical: 'https://dev-kit.tech/tools/curl-converter',
  },
}

export default function CurlConverterPage() {
  return <CurlConverter />
}
