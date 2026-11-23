import { SupabaseClient } from '@supabase/supabase-js'
import {
  DAILY_FREE_CREDITS_LIMIT,
  DAILY_LIMIT_ERROR_MESSAGE,
} from '@/lib/creditsConfig'

export { resolveGeminiModel } from '@/lib/creditsConfig'

export interface CreditCheckResult {
  allowed: boolean
  errorResponse?: { error: string; status: number }
  user?: { id: string }
  profile?: {
    free_credits_remaining: number
  }
}

/**
 * Cascade validation before calling Gemini:
 *  1. BYOK key  -> unlimited, nothing is consumed.
 *  2. Daily free credits (authenticated users) -> allowed while > 0.
 *  3. Otherwise -> 403 asking the user to bring their own key.
 * Does NOT deduct any credits yet.
 */
export async function verifyServerCredits(
  supabase: SupabaseClient,
  customApiKey?: string
): Promise<CreditCheckResult> {
  if (customApiKey && typeof customApiKey === 'string' && customApiKey.trim().length > 0) {
    return { allowed: true }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Unauthenticated guest requests: client manages credits in localStorage
    return { allowed: true }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('free_credits_remaining, last_daily_reset_date')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { allowed: true, user }
  }

  // Automatic daily reset on the server if date has changed
  const today = new Date().toISOString().split('T')[0]
  if (profile.last_daily_reset_date !== today) {
    profile.free_credits_remaining = DAILY_FREE_CREDITS_LIMIT
    profile.last_daily_reset_date = today

    await supabase
      .from('profiles')
      .update({
        free_credits_remaining: DAILY_FREE_CREDITS_LIMIT,
        last_daily_reset_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
  }

  if ((profile.free_credits_remaining || 0) <= 0) {
    return {
      allowed: false,
      errorResponse: { error: DAILY_LIMIT_ERROR_MESSAGE, status: 403 },
      user,
      profile,
    }
  }

  return { allowed: true, user, profile }
}

/**
 * Deducts a daily credit ONLY after the AI generation has succeeded.
 * Prevents credit loss if the Gemini model throws an error or times out.
 * BYOK requests never reach a profile here, so nothing is deducted for them.
 */
export async function deductServerCreditPostSuccess(
  supabase: SupabaseClient,
  check: CreditCheckResult,
  description = 'AI Generation'
): Promise<void> {
  if (!check.user || !check.profile) {
    return
  }

  const { user, profile } = check

  try {
    if (profile.free_credits_remaining > 0) {
      await supabase
        .from('profiles')
        .update({ free_credits_remaining: profile.free_credits_remaining - 1 })
        .eq('id', user.id)
    }

    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -1,
      type: 'USAGE',
      description,
    })
  } catch {
    // Non-blocking transaction logging
  }
}
