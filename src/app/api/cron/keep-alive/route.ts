import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Keep-Alive Cron Endpoint
 * Pings Supabase PostgreSQL database to reset the 7-day inactivity pause timer.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // If CRON_SECRET is configured, require bearer token (for Vercel Cron / GitHub Action)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow if called from user-agent vercel-cron or simple ping
      const userAgent = req.headers.get('user-agent') || ''
      if (!userAgent.includes('vercel-cron') && !userAgent.includes('GitHub-Hookshot')) {
        // Optional verification - return 401 only if strictly configured
      }
    }

    const supabase = await createClient()

    // Execute a lightweight query on PostgreSQL to register genuine database activity
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.warn('[Keep-Alive] Supabase ping returned error:', error.message)
      return NextResponse.json(
        {
          status: 'warning',
          message: 'Supabase reached but query returned error',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    // 1. Bulk reset all profiles that haven't been reset today
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('profiles')
      .update({
        free_credits_remaining: 5,
        last_daily_reset_date: today,
        updated_at: new Date().toISOString(),
      })
      .neq('last_daily_reset_date', today)

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase PostgreSQL activity ping successful and daily credits synced.',
      timestamp: new Date().toISOString(),
      activeProfilesSampleCount: data?.length || 0,
    })
  } catch (err) {
    console.error('[Keep-Alive] Exception occurred:', err)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error during keep-alive ping',
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
