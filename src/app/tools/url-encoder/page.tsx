import type { Metadata } from 'next'
import UrlEncoder from '@/components/tools/UrlEncoder'

export const metadata: Metadata = {
  title: 'URL Encoder / Decoder & Query Parameter Parser',
  description:
    'Encode, decode, parse, and edit URL query string parameters in real-time with an interactive parameter table and instant copy.',
  alternates: {
    canonical: 'https://dev-kit.tech/tools/url-encoder',
  },
}

export default function UrlEncoderPage() {
  return <UrlEncoder />
}
