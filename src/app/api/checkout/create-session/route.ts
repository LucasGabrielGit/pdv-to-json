import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PLANS, type PlanKey } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { planId, currency = 'usd' } = body as {
      planId: PlanKey
      currency?: 'usd' | 'brl'
    }

    const plan = STRIPE_PLANS[planId]
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in with Google, GitHub, or Email to proceed.' },
        { status: 401 }
      )
    }

    // Get origin URL for redirection
    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://dev-kit.tech'

    // Check if user already has a Stripe Customer ID in profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID in profiles
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const selectedPrice = currency === 'brl' ? plan.brl : plan.usd

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPrice.priceId,
          quantity: 1,
        },
      ],
      mode: plan.type === 'recurring' ? 'subscription' : 'payment',
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        planId: plan.id,
        creditAmount: String(plan.credits),
      },
      subscription_data:
        plan.type === 'recurring'
          ? {
              metadata: {
                userId: user.id,
                planId: plan.id,
              },
            }
          : undefined,
      success_url: `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    })

    return NextResponse.json({
      success: true,
      url: session.url,
    })
  } catch (err) {
    console.error('Stripe Checkout Session Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to create Stripe checkout session.' },
      { status: 500 }
    )
  }
}
