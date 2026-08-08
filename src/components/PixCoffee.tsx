import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Coffee, Copy, Check, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { generatePixPayload } from '@/utils/pixPayload'

const RAW_PIX_KEY = '(99) 98155-5572'
const PIX_PAYLOAD = generatePixPayload(RAW_PIX_KEY)

export default function PixCoffee() {
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedPayload, setCopiedPayload] = useState(false)

  const handleCopyKey = () => {
    navigator.clipboard.writeText(RAW_PIX_KEY)
    setCopiedKey(true)
    toast.success('Chave PIX copiada para a área de transferência!')
    setTimeout(() => setCopiedKey(false), 2500)
  }

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(PIX_PAYLOAD)
    setCopiedPayload(true)
    toast.success('Código PIX Copia e Cola copiado com sucesso!')
    setTimeout(() => setCopiedPayload(false), 2500)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-12 mb-6">
      <Card className="relative overflow-hidden border border-border bg-card/60 backdrop-blur-xl shadow-2xl transition-all duration-300">
        {/* Subtle decorative glow */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            {/* Left side: Info & Buttons */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Coffee className="w-3.5 h-3.5" />
                <span>Apoie o projeto</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
                  Pague-me um café! <span className="text-2xl">☕</span>
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Gostou da ferramenta e ela te ajudou a economizar tempo? Considere fazer uma pequena contribuição via PIX!
                </p>
              </div>

              {/* PIX Key display and copy actions */}
              <div className="pt-2 space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background/60 border border-border font-mono text-sm text-amber-300 select-all">
                  <span className="text-xs text-muted-foreground">Chave PIX:</span>
                  <span className="font-semibold">{RAW_PIX_KEY}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <Button
                    onClick={handleCopyKey}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border-amber-500/30 transition-all cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave PIX'}</span>
                  </Button>

                  <Button
                    onClick={handleCopyPayload}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
                    title="Copiar código PIX para leitura no app do banco"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <QrCode className="w-3.5 h-3.5" />}
                    <span>{copiedPayload ? 'Copia e Cola Copiado!' : 'PIX Copia e Cola'}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right side: QR Code */}
            <div className="flex flex-col items-center justify-center shrink-0 p-3 bg-white rounded-2xl shadow-lg border border-white/20 group transition-transform duration-300 hover:scale-105">
              <QRCodeSVG
                value={PIX_PAYLOAD}
                size={140}
                level="M"
                includeMargin={false}
              />
              <span className="mt-2 text-[10px] font-medium tracking-wider uppercase text-gray-500">
                Escaneie para pagar
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
