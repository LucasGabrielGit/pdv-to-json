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
