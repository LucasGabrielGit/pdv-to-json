import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { safeParseLlmJson } from '@/utils/safeJsonParse'
import { createClient } from '@/lib/supabase/server'
import {
  verifyServerCredits,
  deductServerCreditPostSuccess,
} from '@/lib/serverCreditGuard'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      mode = 'generate', // 'generate' | 'explain'
      prompt = '',
      regex = '',
      flags = 'g',
      language = 'en',
      customApiKey,
    } = body

    if (mode === 'generate' && (!prompt || !prompt.trim())) {
      return NextResponse.json(
        { error: 'Prompt instruction is required for Regex generation.' },
        { status: 400 }
      )
    }

    if (mode === 'explain' && (!regex || !regex.trim())) {
      return NextResponse.json(
        { error: 'Regex pattern is required for explanation.' },
        { status: 400 }
      )
    }

    // Pre-check credits
    const supabase = await createClient()
    const creditCheck = await verifyServerCredits(supabase, customApiKey)
    if (!creditCheck.allowed && creditCheck.errorResponse) {
      return NextResponse.json(
        { error: creditCheck.errorResponse.error },
        { status: creditCheck.errorResponse.status }
      )
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

    const outputLang = language === 'pt' ? 'Portuguese (Brazil)' : 'English'

    let systemPrompt = ''
    let userContent = ''

    if (mode === 'generate') {
      systemPrompt = `You are a Principal Regular Expressions (Regex) expert.
Generate the optimal, safest, and most accurate Regular Expression based on the user's description.
Output language for explanations: ${outputLang}.

CRITICAL: Return strictly valid parseable JSON matching this schema:
{
  "pattern": "^[0-9]{3}\\\\.[0-9]{3}\\\\.[0-9]{3}-[0-9]{2}$",
  "flags": "gm",
  "explanation": "High-level summary of what this regex does...",
  "tokens": [
    { "token": "^", "description": "Asserts start of line" },
    { "token": "[0-9]{3}", "description": "Matches exactly 3 digits" }
  ],
  "validExamples": ["123.456.789-00"],
  "invalidExamples": ["12345678900", "abc"],
  "jsSnippet": "const regex = /pattern/flags;\\nconst isValid = regex.test(str);",
  "pythonSnippet": "import re\\npattern = r'pattern'\\nmatch = re.search(pattern, str)",
  "reDosRisk": "Low (no catastrophic backtracking risk)"
}`
      userContent = `User Request: ${prompt}\nPreferred Flags: ${flags}`
    } else {
      systemPrompt = `You are a Principal Regular Expressions (Regex) expert.
Analyze and explain the provided Regular Expression token by token.
Detect any ReDoS (Regular Expression Denial of Service) risks or catastrophic backtracking issues.
Output language: ${outputLang}.

CRITICAL: Return strictly valid parseable JSON matching this schema:
{
  "pattern": "${regex}",
  "flags": "${flags}",
  "explanation": "Detailed explanation of what this regex matches...",
  "tokens": [
    { "token": "^", "description": "Asserts position at start of a line" },
    { "token": "(?=.*[a-z])", "description": "Positive lookahead ensuring at least one lowercase letter" }
  ],
  "validExamples": ["SampleString123"],
  "invalidExamples": ["bad_input"],
  "jsSnippet": "const regex = /${regex}/${flags};",
  "pythonSnippet": "import re\\npattern = r'${regex}'",
  "reDosRisk": "Low"
}`
      userContent = `Regex Pattern: ${regex}\nFlags: ${flags}`
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\n${userContent}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      pattern: regex || '.*',
      flags: flags || 'g',
      explanation: 'Regex explanation',
      tokens: [],
      validExamples: [],
      invalidExamples: [],
      jsSnippet: '',
      pythonSnippet: '',
      reDosRisk: 'Low',
    })

    // Deduct credit only upon successful generation
    await deductServerCreditPostSuccess(
      supabase,
      creditCheck,
      'AI Regex Studio'
    )

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('AI Regex API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to process regex.' },
      { status: 500 }
    )
  }
}
