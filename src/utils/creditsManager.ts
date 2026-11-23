import type { SupabaseClient } from '@supabase/supabase-js'
import { DAILY_FREE_CREDITS_LIMIT } from '@/lib/creditsConfig'

export interface UserCredits {
  freeCreditsRemaining: number
  lastDailyResetDate: string // YYYY-MM-DD
  /** BYOK: user's own Google Gemini key. When present the quota is bypassed. */
  userCustomApiKey?: string
}

const STORAGE_KEY = 'devkit_user_credits_v1'
export const CREDITS_UPDATED_EVENT = 'devkit_credits_updated'

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function freshCredits(): UserCredits {
  return {
    freeCreditsRemaining: DAILY_FREE_CREDITS_LIMIT,
    lastDailyResetDate: getTodayString(),
  }
}

function persist(credits: UserCredits): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credits))
}

function notifyChange(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CREDITS_UPDATED_EVENT))
}

/**
 * Retrieves the current user's daily credits and BYOK state.
 * Legacy fields from the old paid plans (purchased credits / Pro) are dropped.
 */
export function getUserCredits(): UserCredits {
  if (typeof window === 'undefined') return freshCredits()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = freshCredits()
      persist(initial)
      return initial
    }

    const stored = JSON.parse(raw) as Partial<UserCredits>
    const today = getTodayString()
    const credits: UserCredits = {
      freeCreditsRemaining:
        typeof stored.freeCreditsRemaining === 'number'
          ? stored.freeCreditsRemaining
          : DAILY_FREE_CREDITS_LIMIT,
      lastDailyResetDate: stored.lastDailyResetDate ?? today,
      userCustomApiKey: stored.userCustomApiKey || undefined,
    }

    // Reset daily free credits if date changed
    if (credits.lastDailyResetDate !== today) {
      credits.freeCreditsRemaining = DAILY_FREE_CREDITS_LIMIT
      credits.lastDailyResetDate = today
      persist(credits)
    }

    // Never show more than the current limit (e.g. old 5-credit state is fine, old higher is capped)
    credits.freeCreditsRemaining = Math.min(
      credits.freeCreditsRemaining,
      DAILY_FREE_CREDITS_LIMIT
    )

    return credits
  } catch {
    return freshCredits()
  }
}

export function hasCustomApiKey(credits: UserCredits = getUserCredits()): boolean {
  return Boolean(credits.userCustomApiKey && credits.userCustomApiKey.trim())
}

/**
 * Save user custom BYOK API key (localStorage)
 */
export function setCustomApiKey(key: string): void {
  if (typeof window === 'undefined') return
  const current = getUserCredits()
  current.userCustomApiKey = key.trim()
  persist(current)
  notifyChange()
}

/**
 * Remove the BYOK key from this browser
 */
export function clearCustomApiKey(): void {
  if (typeof window === 'undefined') return
  const current = getUserCredits()
  delete current.userCustomApiKey
  persist(current)
  notifyChange()
}

/**
 * Cascade check: BYOK (unlimited) -> daily free credits -> blocked.
 */
export function canConsumeCredit(): { allowed: boolean; reason?: string } {
  const credits = getUserCredits()
  if (hasCustomApiKey(credits)) return { allowed: true }
  if (credits.freeCreditsRemaining > 0) return { allowed: true }

  return {
    allowed: false,
    reason: `Daily free credits limit reached (0/${DAILY_FREE_CREDITS_LIMIT}). Add your own Gemini API key to keep going for free.`,
  }
}

/**
 * Deducts 1 daily credit. BYOK usage never consumes credits.
 */
export function consumeCredit(): UserCredits {
  const credits = getUserCredits()

  if (hasCustomApiKey(credits)) return credits

  if (credits.freeCreditsRemaining > 0) {
    credits.freeCreditsRemaining -= 1
    persist(credits)
    notifyChange()
  }

  return credits
}

/**
 * Persists the BYOK key on the authenticated user's Supabase profile.
 * Silently no-ops for guests / offline / unconfigured environments.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveCustomApiKeyToCloud(supabaseClient: SupabaseClient<any, any, any>, key: string | null): Promise<boolean> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) return false

    const { error } = await supabaseClient
      .from('profiles')
      .update({
        user_custom_api_key: key,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    return !error
  } catch {
    return false
  }
}

/**
 * Cloud sync with Supabase profile if available
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncUserCreditsWithCloud(supabaseClient: SupabaseClient<any, any, any>): Promise<UserCredits> {
  const local = getUserCredits()
  if (typeof window === 'undefined') return local

  try {
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) return local

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('free_credits_remaining, user_custom_api_key, last_daily_reset_date')
      .eq('id', user.id)
      .single()

    if (profile) {
      const today = getTodayString()
      let freeCredits: number = profile.free_credits_remaining

      // If cloud profile date is older than today, reset free credits
      if (profile.last_daily_reset_date !== today) {
        freeCredits = DAILY_FREE_CREDITS_LIMIT
        // Sync cloud profile in background
        supabaseClient
          .from('profiles')
          .update({
            free_credits_remaining: DAILY_FREE_CREDITS_LIMIT,
            last_daily_reset_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .then(() => notifyChange())
      }

      const synced: UserCredits = {
        freeCreditsRemaining: Math.min(freeCredits, DAILY_FREE_CREDITS_LIMIT),
        lastDailyResetDate: today,
        userCustomApiKey: profile.user_custom_api_key || local.userCustomApiKey,
      }
      persist(synced)
      return synced
    }
  } catch {
    // Fallback to local storage if offline or unconfigured
  }

  return local
}
