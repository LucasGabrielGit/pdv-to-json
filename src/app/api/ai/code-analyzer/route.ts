import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { safeParseLlmJson } from '@/utils/safeJsonParse'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      code,
      language = 'javascript',
      aiMode = 'turbo', // 'turbo' (~1.2s) | 'deep' (~3.5s)
      customApiKey,
    } = body

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { error: 'Code content is required.' },
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
                'You have reached your daily credit limit. Please enter a custom Gemini API Key or upgrade.',
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
            'No Gemini API Key provided. Please enter your Gemini API Key in the tool settings or set GEMINI_API_KEY on the server.',
        },
        { status: 401 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const systemPrompt = `You are a world-class senior software architect, code reviewer, and security specialist.
Analyze the provided ${language} code for:
1. Overall Quality Score (1 to 100)
2. Executive Summary of what the code does and its overall health.
3. Security & OWASP Vulnerabilities (if any).
4. Performance & Refactoring Suggestions.
5. Improved & Clean Refactored Code.
6. Recommended Unit Test Code.

CRITICAL INSTRUCTIONS FOR JSON ESCAPING:
- You must output valid, parseable JSON ONLY.
- Inside string properties (like refactoredCode and unitTestCode), escape all backslashes and double quotes properly.

Respond strictly in valid JSON format matching this schema:
{
  "score": 85,
  "summary": "High-level review summary...",
  "securityTips": ["Tip 1", "Tip 2"],
  "performanceTips": ["Tip 1", "Tip 2"],
  "refactoredCode": "// Cleaned up code here",
  "unitTestCode": "// Unit test sample here"
}`

    const selectedModel = aiMode === 'deep' ? 'gemini-2.5-flash' : 'gemini-2.0-flash'

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: `${systemPrompt}\n\nHere is the code to analyze:\n\`\`\`${language}\n${code}\n\`\`\``,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      score: 75,
      summary: 'Code analysis completed.',
      securityTips: ['Verify input validation and sanitization.'],
      performanceTips: ['Consider async batching for heavy operations.'],
      refactoredCode: code,
      unitTestCode: '// Unit test generated',
    })

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('Code Analyzer API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to analyze code.' },
      { status: 500 }
    )
  }
}

