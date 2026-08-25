import { Metadata } from 'next'
import TokenGenerator from '@/components/tools/TokenGenerator'

export const metadata: Metadata = {
  title: 'Secure Password & API Key Generator | DevKit',
  description:
    'Generate cryptographically secure passwords, high-entropy secrets, API keys, and webhook tokens with client-side Web Crypto.',
  keywords: [
    'password generator',
    'api key generator',
    'token generator',
    'secret generator',
    'random hex generator',
    'secure password',
    'entropy calculator',
  ],
  openGraph: {
    title: 'Secure Password & API Key Generator | DevKit',
    description:
      'Generate cryptographically secure passwords, high-entropy secrets, API keys, and webhook tokens with client-side Web Crypto.',
    type: 'website',
  },
}

export default function TokenGeneratorPage() {
  return <TokenGenerator />
}
