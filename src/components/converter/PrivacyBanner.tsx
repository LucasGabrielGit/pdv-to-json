import React from 'react'
import { ShieldCheck, Lock, Cpu } from 'lucide-react'

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md shadow-lg shadow-emerald-950/20 text-emerald-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
              <span>100% Privado &amp; Seguro</span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                Zero Servidores
              </span>
            </div>
            <p className="text-xs text-emerald-400/90 font-medium">
              Seus dados não saem do seu navegador. Todo o processamento é feito localmente no seu dispositivo.
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-xs text-emerald-300/80 font-medium">
          <span className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-emerald-400" /> Sem uploads
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="size-3.5 text-emerald-400" /> Processamento local
          </span>
        </div>
      </div>
    </div>
  )
}
