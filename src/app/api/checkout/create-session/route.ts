import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * DECOMMISSIONED: dev-kit.tech pivoted to a 100% free model with BYOK.
 * Paid checkouts are disabled.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Checkout is disabled. dev-kit.tech is now 100% free with daily quotas and Bring Your Own Key (BYOK) support.',
      decommissioned: true,
    },
    { status: 410 }
  )
}
