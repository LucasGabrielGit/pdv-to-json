import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DevKit - Free & Private Developer Tools Suite',
    short_name: 'DevKit',
    description: 'A suite of 25+ fast, free, and 100% private developer tools running in your browser memory.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f1a',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
