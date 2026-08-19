export interface UserCredits {
  freeCreditsRemaining: number
  purchasedCredits: number
  isProSubscriber: boolean
  lastDailyResetDate: string // YYYY-MM-DD
  userCustomApiKey?: string
}

const STORAGE_KEY = 'devkit_user_credits_v1'
const DAILY_FREE_CREDITS_LIMIT = 5

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Retrieves the current user's credits and BYOK state
 */
export function getUserCredits(): UserCredits {
  if (typeof window === 'undefined') {
    return {
      freeCreditsRemaining: DAILY_FREE_CREDITS_LIMIT,
      purchasedCredits: 0,
      isProSubscriber: false,
      lastDailyResetDate: getTodayString(),
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial: UserCredits = {
        freeCreditsRemaining: DAILY_FREE_CREDITS_LIMIT,
        purchasedCredits: 0,
        isProSubscriber: false,
        lastDailyResetDate: getTodayString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }

    const parsed: UserCredits = JSON.parse(raw)
    const today = getTodayString()

    // Reset daily free credits if date changed
    if (parsed.lastDailyResetDate !== today) {
      parsed.freeCreditsRemaining = DAILY_FREE_CREDITS_LIMIT
      parsed.lastDailyResetDate = today
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    }

    return parsed
  } catch {
    return {
      freeCreditsRemaining: DAILY_FREE_CREDITS_LIMIT,
      purchasedCredits: 0,
      isProSubscriber: false,
      lastDailyResetDate: getTodayString(),
    }
  }
}

/**
 * Save user custom BYOK API key
 */
export function setCustomApiKey(key: string): void {
  if (typeof window === 'undefined') return
  const current = getUserCredits()
  current.userCustomApiKey = key.trim()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
}

/**
 * Checks if user has enough credits or BYOK key or Pro subscription
 */
export function canConsumeCredit(): { allowed: boolean; reason?: string } {
  const credits = getUserCredits()
  if (credits.userCustomApiKey) return { allowed: true }
  if (credits.isProSubscriber) return { allowed: true }

  const total = credits.freeCreditsRemaining + credits.purchasedCredits
  if (total > 0) return { allowed: true }

  return {
    allowed: false,
    reason: 'Daily free credits limit reached (5/5). Add your own Gemini API key or top up credits.',
  }
}

/**
 * Deducts 1 credit from free or purchased balance
 */
export function consumeCredit(): UserCredits {
  const credits = getUserCredits()

  // If BYOK or Pro, no deduction
  if (credits.userCustomApiKey || credits.isProSubscriber) {
    return credits
  }

  if (credits.freeCreditsRemaining > 0) {
    credits.freeCreditsRemaining -= 1
  } else if (credits.purchasedCredits > 0) {
    credits.purchasedCredits -= 1
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credits))
  }

  return credits
}

/**
 * Adds purchased credits to balance
 */
export function addPurchasedCredits(amount: number): UserCredits {
  const credits = getUserCredits()
  credits.purchasedCredits += amount
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credits))
  }
  return credits
}

/**
 * Cloud sync with Supabase profile if available
 */
export async function syncUserCreditsWithCloud(supabaseClient: {
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> }
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        single: () => Promise<{
          data: {
            free_credits_remaining: number
            purchased_credits: number
            is_pro: boolean
            user_custom_api_key?: string
          } | null
        }>
      }
    }
    update: (data: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: unknown }>
    }
  }
}): Promise<UserCredits> {
  const local = getUserCredits()
  if (typeof window === 'undefined') return local

  try {
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) return local

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('free_credits_remaining, purchased_credits, is_pro, user_custom_api_key')
      .eq('id', user.id)
      .single()

    if (profile) {
      const synced: UserCredits = {
        freeCreditsRemaining: profile.free_credits_remaining,
        purchasedCredits: profile.purchased_credits,
        isProSubscriber: profile.is_pro,
        lastDailyResetDate: local.lastDailyResetDate,
        userCustomApiKey: profile.user_custom_api_key || local.userCustomApiKey,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(synced))
      return synced
    }
  } catch {
    // Fallback to local storage if offline or unconfigured
  }

  return local
}

