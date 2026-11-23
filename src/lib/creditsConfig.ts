/**
 * Shared (client + server) configuration for the free daily AI quota and BYOK.
 *
 * Cascade used everywhere:
 *   1. BYOK key present        -> unlimited, no credits consumed, any model
 *   2. Free daily credits left -> fast model only (gemini-2.5-flash)
 *   3. Otherwise               -> limit reached, ask the user for their own key
 */
export const DAILY_FREE_CREDITS_LIMIT = 10

export const FREE_TIER_MODEL = 'gemini-2.5-flash'
export const BYOK_DEEP_MODEL = 'gemini-2.5-pro'

export const AI_STUDIO_KEY_URL = 'https://aistudio.google.com/apikey'

export const DAILY_LIMIT_ERROR_MESSAGE =
  'Você atingiu sua cota diária gratuita. Insira sua própria chave do Google Gemini para continuar usando de forma 100% gratuita e ilimitada.'

/** Google AI Studio keys start with "AIza" and have 39 characters. */
export function isValidGeminiKeyFormat(key: string): boolean {
  return /^AIza[0-9A-Za-z_-]{30,}$/.test(key.trim())
}

/**
 * Picks the Gemini model for a request. The "deep" (Pro) model is only
 * available when the caller brings their own key.
 */
export function resolveGeminiModel(
  aiMode: unknown,
  customApiKey?: unknown
): string {
  const hasByok =
    typeof customApiKey === 'string' && customApiKey.trim().length > 0
  return aiMode === 'deep' && hasByok ? BYOK_DEEP_MODEL : FREE_TIER_MODEL
}
