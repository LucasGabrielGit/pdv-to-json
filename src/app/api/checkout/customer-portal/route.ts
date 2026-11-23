import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * DECOMMISSIONED: Billing portal is disabled as paid plans have been sunset.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Billing portal is disabled. All tools are now 100% free with community daily quotas and BYOK.',
      decommissioned: true,
    },
    { status: 410 }
  )
}
