import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { safeParseLlmJson } from '@/utils/safeJsonParse'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      diff,
      scope = '',
      style = 'conventional',
      language = 'en',
      customApiKey,
    } = body

    if (!diff || typeof diff !== 'string' || !diff.trim()) {
      return NextResponse.json(
        { error: 'Git diff or change description is required.' },
        { status: 400 }
      )
    }

    // Check Supabase authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is authenticated and not using BYOK, verify and deduct credit
    if (user && !customApiKey) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('free_credits_remaining, purchased_credits, is_pro')
        .eq('id', user.id)
        .single()

      if (profile && !profile.is_pro) {
        const total =
          (profile.free_credits_remaining || 0) +
          (profile.purchased_credits || 0)

        if (total <= 0) {
          return NextResponse.json(
            {
              error:
                'You have reached your daily credit limit. Please enter a custom Gemini API Key or upgrade to Pro.',
            },
            { status: 403 }
          )
        }

        // Deduct 1 credit
        if (profile.free_credits_remaining > 0) {
          await supabase
            .from('profiles')
            .update({
              free_credits_remaining: profile.free_credits_remaining - 1,
            })
            .eq('id', user.id)
        } else if (profile.purchased_credits > 0) {
          await supabase
            .from('profiles')
            .update({
              purchased_credits: profile.purchased_credits - 1,
            })
            .eq('id', user.id)
        }
      }
    }

    const apiKey = (
      customApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      ''
    ).trim()

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'No Gemini API Key configured. Please enter your custom Gemini API key or set GEMINI_API_KEY.',
        },
        { status: 401 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const systemPrompt = `You are a Principal Software Engineer and Git expert.
Analyze the following git diff, staged changes, or change description and generate:
1. Short Conventional Commit title following the specification: <type>(<scope>): <short summary in imperative mood, under 72 chars>.
   Types: feat, fix, refactor, docs, test, chore, perf, style, ci, build.
   User specified scope (if any): "${scope}".
2. Detailed bullet points explaining the why and what changed.
3. Complete GitHub / GitLab Pull Request template formatted in Markdown.
4. Gitmoji commit message (e.g. ✨ feat(...): ...).

Output Language: ${language === 'pt' ? 'Portuguese (Brazil)' : 'English'}.
Style preference: ${style}.

CRITICAL: Respond STRICTLY in valid parseable JSON matching this schema:
{
  "commitTitle": "feat(auth): add google oauth and session verification",
  "gitmojiTitle": "✨ feat(auth): add google oauth and session verification",
  "commitBody": "- Add Supabase auth callback handler\\n- Verify user session on redirect\\n- Handle OAuth state mismatch errors gracefully",
  "fullCommitMessage": "feat(auth): add google oauth and session verification\\n\\n- Add Supabase auth callback handler\\n- Verify user session on redirect",
  "prTitle": "feat: Add Google OAuth and session verification flow",
  "prDescription": "## 📝 Description\\nSummary of changes...\\n\\n## 🔨 Changes Made\\n- ...\\n\\n## ✅ Checklist\\n- [x] Unit tests pass\\n- [x] Tested locally\\n- [ ] Documentation updated",
  "breakingChanges": ""
}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\nInput Diff / Changes:\n${diff.slice(0, 15000)}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      commitTitle: 'feat: update codebase with new changes',
      gitmojiTitle: '✨ feat: update codebase with new changes',
      commitBody: '- Updated files and refactored components',
      fullCommitMessage: 'feat: update codebase with new changes\n\n- Updated files',
      prTitle: 'feat: Update codebase with new changes',
      prDescription: '## 📝 Description\nUpdates and improvements.',
      breakingChanges: '',
    })

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('Git Commit Generator API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to generate commit message.' },
      { status: 500 }
    )
  }
}
