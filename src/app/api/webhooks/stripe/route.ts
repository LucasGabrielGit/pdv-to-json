import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Use Supabase Admin (service role) to bypass RLS for webhook updates
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qywieqckqmsgsqftkusl.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createSupabaseAdmin(url, serviceKey)
}

export async function POST(req: Request) {
  const body = await req.text()
  const headerList = await headers()
  const sig = headerList.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      // Fallback in local/dev if signature checking is disabled
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 }
    )
  }

  const supabaseAdmin = getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id || session.metadata?.userId
        const mode = session.mode

        if (!userId) {
          console.warn('Checkout completed without user ID in reference/metadata:', session.id)
          break
        }

        if (mode === 'subscription') {
          await supabaseAdmin
            .from('profiles')
            .update({
              is_pro: true,
            })
            .eq('id', userId)

          console.log(`User ${userId} upgraded to Pro Subscription via session ${session.id}`)
        } else if (mode === 'payment') {
          const creditAmount = parseInt(session.metadata?.creditAmount || '0', 10)

          if (creditAmount > 0) {
            // Fetch current credits
            const { data: currentProfile } = await supabaseAdmin
              .from('profiles')
              .select('purchased_credits')
              .eq('id', userId)
              .single()

            const newPurchased = (currentProfile?.purchased_credits || 0) + creditAmount

            await supabaseAdmin
              .from('profiles')
              .update({
                purchased_credits: newPurchased,
              })
              .eq('id', userId)

            console.log(`Credited ${creditAmount} credits to user ${userId} (New Total: ${newPurchased})`)
          }
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status
        const isPro = status === 'active' || status === 'trialing'

        await supabaseAdmin
          .from('profiles')
          .update({
            is_pro: isPro,
            subscription_status: status,
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log(`Subscription ${subscription.id} status updated to ${status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabaseAdmin
          .from('profiles')
          .update({
            is_pro: false,
            subscription_status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log(`Subscription ${subscription.id} canceled. Pro disabled.`)
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Error processing Stripe webhook:', err)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
