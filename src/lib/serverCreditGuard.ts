import { SupabaseClient } from '@supabase/supabase-js'

export interface CreditCheckResult {
  allowed: boolean
  errorResponse?: { error: string; status: number }
  user?: { id: string }
  profile?: {
    is_pro: boolean
    free_credits_remaining: number
    purchased_credits: number
  }
}

/**
 * Validates whether the user has sufficient credits before calling Gemini API.
 * Does NOT deduct any credits yet.
 */
export async function verifyServerCredits(
  supabase: SupabaseClient,
  customApiKey?: string
): Promise<CreditCheckResult> {
  // If user provided their own custom Gemini key (BYOK), allow unlimited access
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
    .select('free_credits_remaining, purchased_credits, is_pro, last_daily_reset_date')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { allowed: true, user }
  }

  if (profile.is_pro) {
    return { allowed: true, user, profile }
  }

  // Automatic daily reset on the server if date has changed
  const today = new Date().toISOString().split('T')[0]
  if (profile.last_daily_reset_date !== today) {
    profile.free_credits_remaining = 5
    profile.last_daily_reset_date = today

    await supabase
      .from('profiles')
      .update({
        free_credits_remaining: 5,
        last_daily_reset_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
  }

  const totalCredits =
    (profile.free_credits_remaining || 0) + (profile.purchased_credits || 0)

  if (totalCredits <= 0) {
    return {
      allowed: false,
      errorResponse: {
        error:
          'You have reached your daily credit limit. Please enter a custom Gemini API Key or upgrade.',
        status: 403,
      },
      user,
      profile,
    }
  }

  return { allowed: true, user, profile }
}

/**
 * Deducts credit ONLY after the AI generation has succeeded.
 * Prevents credit loss if the Gemini model throws an error or times out.
 */
export async function deductServerCreditPostSuccess(
  supabase: SupabaseClient,
  check: CreditCheckResult,
  description = 'AI Generation'
): Promise<void> {
  if (!check.user || !check.profile || check.profile.is_pro) {
    return
  }

  const { user, profile } = check

  try {
    if (profile.free_credits_remaining > 0) {
      await supabase
        .from('profiles')
        .update({ free_credits_remaining: profile.free_credits_remaining - 1 })
        .eq('id', user.id)
    } else if (profile.purchased_credits > 0) {
      await supabase
        .from('profiles')
        .update({ purchased_credits: profile.purchased_credits - 1 })
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
