import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qywieqckqmsgsqftkusl.supabase.co'
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  return createSupabaseAdmin(url, serviceKey)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id parameter.' }, { status: 400 })
    }

    // Retrieve session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'subscription'],
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found in Stripe.' }, { status: 404 })
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json(
        { error: 'Payment has not been completed yet.', paymentStatus: session.payment_status },
        { status: 400 }
      )
    }

    const userId = session.client_reference_id || session.metadata?.userId
    if (!userId) {
      return NextResponse.json({ error: 'No user ID associated with session.' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Fetch user's current profile with strictly supported schema columns
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, purchased_credits, is_pro, free_credits_remaining')
      .eq('id', userId)
      .single()

    if (profileErr || !profile) {
      console.error('User profile lookup failed for userId:', userId, profileErr)
      return NextResponse.json({ error: 'User profile not found in database.' }, { status: 404 })
    }

    const mode = session.mode

    if (mode === 'subscription') {
      const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update({
          is_pro: true,
        })
        .eq('id', userId)

      if (updateErr) {
        console.error('Failed to update is_pro for user:', userId, updateErr)
        return NextResponse.json({ error: 'Database update failed.' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        isPro: true,
        message: 'Subscription successfully activated!',
      })
    } else {
      // One-time credit pack purchase
      const creditAmount = parseInt(session.metadata?.creditAmount || '0', 10)

      if (creditAmount > 0) {
        const currentCredits = profile.purchased_credits || 0
        const newCredits = currentCredits + creditAmount

        const { error: updateErr } = await supabaseAdmin
          .from('profiles')
          .update({
            purchased_credits: newCredits,
          })
          .eq('id', userId)

        if (updateErr) {
          console.error('Failed to update purchased_credits for user:', userId, updateErr)
          return NextResponse.json({ error: 'Database update failed.' }, { status: 500 })
        }

        console.log(`[VerifySession] User ${userId} credited +${creditAmount}. New balance: ${newCredits}`)

        return NextResponse.json({
          success: true,
          creditedAmount: creditAmount,
          totalPurchasedCredits: newCredits,
          message: `Successfully credited ${creditAmount} AI credits!`,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Session verified.',
      })
    }
  } catch (err) {
    console.error('Session verification error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to verify checkout session.' },
      { status: 500 }
    )
  }
}
