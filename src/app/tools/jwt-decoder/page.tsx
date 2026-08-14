import type { Metadata } from 'next'
import JwtDecoder from '@/components/tools/JwtDecoder'
import PixCoffee from '@/components/PixCoffee'

export const metadata: Metadata = {
  title: 'JWT Decoder & Inspector Online — Fast, 100% Client-Side & Private',
  description:
    'Free & 100% private online JWT Decoder and Inspector. Decode JSON Web Tokens (JWT) instantly in your browser. Inspect headers, payloads, signatures, and expiration timestamps with zero server calls.',
  keywords: [
    'jwt decoder',
    'decode jwt online',
    'json web token decoder',
    'jwt inspector',
    'jwt expiration check',
    'jwt header payload',
    'client-side jwt decoder',
    'private jwt decoder',
  ],
  openGraph: {
    title: 'JWT Decoder & Inspector — Fast, 100% Client-Side & Private',
    description:
      'Decode JSON Web Tokens (JWT) instantly in your browser. 100% private — your data never leaves your device.',
    url: 'https://dev-kit.tech/tools/jwt-decoder',
    siteName: 'dev-kit.tech',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JWT Decoder & Inspector — Fast, 100% Client-Side & Private',
    description:
      'Decode JSON Web Tokens (JWT) instantly in your browser. 100% private — your data never leaves your device.',
    images: ['/og-image.svg'],
  },
}

export default function JwtDecoderPage() {
  return (
    <div className="py-8">
      <JwtDecoder />
      <PixCoffee />
    </div>
  )
}
