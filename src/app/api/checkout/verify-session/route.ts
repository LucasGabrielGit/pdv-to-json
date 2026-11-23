import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * DECOMMISSIONED: Paid checkouts are discontinued.
 */
export async function GET() {
  return NextResponse.json(
    {
      error:
        'Checkout verification is retired. dev-kit.tech is now 100% free with BYOK.',
      decommissioned: true,
    },
    { status: 410 }
  )
}
