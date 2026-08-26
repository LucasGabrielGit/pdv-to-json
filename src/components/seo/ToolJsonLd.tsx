import React from 'react'

export interface ToolJsonLdProps {
  name: string
  description: string
  url: string
  applicationCategory?: string
  operatingSystem?: string
}

export function ToolJsonLd({
  name,
  description,
  url,
  applicationCategory = 'DeveloperApplication',
  operatingSystem = 'All',
}: ToolJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0',
    creator: {
      '@type': 'Organization',
      name: 'dev-kit.tech',
      url: 'https://dev-kit.tech',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
