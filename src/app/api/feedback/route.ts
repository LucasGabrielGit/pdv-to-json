import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      type = 'suggestion',
      message,
      rating,
      toolId,
      pageUrl,
      email,
      deviceInfo,
    } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'A mensagem de feedback é obrigatória.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const feedbackPayload = {
      user_id: user?.id || null,
      email: (email && typeof email === 'string' ? email.trim() : null) || user?.email || null,
      type: ['suggestion', 'bug', 'praise', 'general'].includes(type) ? type : 'suggestion',
      tool_id: toolId || null,
      rating: typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating : null,
      message: message.trim(),
      page_url: pageUrl || null,
      device_info: deviceInfo || {},
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('feedbacks').insert(feedbackPayload)

    if (error) {
      console.error('[Feedback API] Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Não foi possível salvar seu feedback. Tente novamente mais tarde.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback enviado com sucesso! Muito obrigado pela contribuição.',
    })
  } catch (err) {
    console.error('[Feedback API] Exception:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Erro interno ao processar feedback.' },
      { status: 500 }
    )
  }
}
