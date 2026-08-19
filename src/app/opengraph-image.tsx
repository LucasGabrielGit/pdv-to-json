import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'dev-kit.tech — Free & Private Developer Tools'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f0f1a',
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, #2d1065 0%, #0f0f1a 75%)',
          color: '#ffffff',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: 200,
            width: 800,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 20px',
            borderRadius: 9999,
            backgroundColor: 'rgba(124, 58, 237, 0.2)',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            color: '#c084fc',
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 28,
          }}
        >
          <span>⚡ 100% Client-Side &amp; Private</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span>dev-kit</span>
          <span style={{ color: '#a855f7' }}>.tech</span>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Free, fast, and private developer tools. JSON, CSV, YAML, Base64, JWT,
          Regex, Hashes, Images &amp; AI — right in your browser.
        </div>

        {/* Bottom tags */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {[
            'JSON ↔ CSV',
            'JWT Decoder',
            'Regex Tester',
            'Hash Generator',
            'UUID / ULID',
            'AI Code Review',
          ].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: 15,
                color: '#e2e8f0',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
