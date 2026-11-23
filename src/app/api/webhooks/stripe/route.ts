import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * DECOMMISSIONED: Webhook handler acknowledges events but takes no action
 * because paid plans, credits purchasing, and subscriptions are sunset.
 */
export async function POST() {
  return NextResponse.json(
    {
      received: true,
      decommissioned: true,
      message: 'dev-kit.tech no longer processes payments.',
    },
    { status: 200 }
  )
}
