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
      errorText = '',
      language = 'auto',
      aiMode = 'turbo',
      customApiKey,
    } = body

    if (!errorText || typeof errorText !== 'string' || !errorText.trim()) {
      return NextResponse.json(
        { error: 'Error log, traceback, or compiler output is required.' },
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

    const systemPrompt = `You are a Principal Software Debugger, Runtime Engineer, and Compiler Specialist.
Analyze the provided error message, stack trace, compiler error, or build log.
Context/Language hint: ${language}

Your task:
1. Identify the exact error type and framework/technology.
2. Provide a crisp executive summary in clear Portuguese (PT-BR) explaining what went wrong without fluff.
3. Identify the technical root cause (e.g. undefined property, missing dependency, CORS, database constraint violation, version mismatch).
4. Provide the exact corrected code snippet or terminal command that fixes the error.
5. Provide step-by-step guidance on applying the fix.
6. Provide concrete prevention tips.

CRITICAL: Return strictly valid parseable JSON matching this schema:
{
  "errorType": "TypeError / NullPointerException / HydrationMismatch / DockerBuildFail",
  "languageOrFramework": "TypeScript / React / Python / Docker / PostgreSQL",
  "summary": "Resumo direto em português do problema...",
  "rootCause": "Explicação técnica detalhada da causa raiz...",
  "solutionCode": "// Código corrigido ou comando terminal para resolver",
  "explanation": "Explicação passo a passo de como aplicar a correção...",
  "preventionTips": [
    "Dica 1 para prevenir esse erro no futuro",
    "Dica 2..."
  ]
}`

    const selectedModel = aiMode === 'deep' ? 'gemini-2.5-pro' : 'gemini-2.5-flash'

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: `${systemPrompt}\n\nError Log / Stack Trace:\n${errorText.slice(0, 15000)}`,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    })

    const responseText = response.text || '{}'
    const resultJson = safeParseLlmJson(responseText, {
      errorType: 'Runtime Error',
      languageOrFramework: 'General',
      summary: 'Erro identificado no log fornecido.',
      rootCause: 'Falha durante a execução da rotina.',
      solutionCode: '// Código ou comando de correção',
      explanation: 'Verifique a compatibilidade dos dados e dependências.',
      preventionTips: ['Adicione validação defensiva.'],
    })

    // Deduct credit only upon successful generation
    await deductServerCreditPostSuccess(
      supabase,
      creditCheck,
      'AI Error & Stack Trace Explainer'
    )

    return NextResponse.json({
      success: true,
      data: resultJson,
    })
  } catch (err) {
    console.error('AI Error Explainer API Error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to analyze error stack trace.' },
      { status: 500 }
    )
  }
}
