import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Layers, FileSpreadsheet, Zap } from 'lucide-react'

export const FaqSection: React.FC = () => {
  const faqs = [
    {
      icon: <ShieldCheck className="size-5 text-emerald-400" />,
      question: 'Os meus dados estão seguros ao converter arquivos JSON ou CSV?',
      answer:
        'Sim, 100%! Diferente de outras ferramentas online, toda a conversão acontece exclusivamente dentro do seu navegador via JavaScript client-side. Nenhum arquivo ou texto é enviado para qualquer servidor externo.',
    },
    {
      icon: <Layers className="size-5 text-purple-400" />,
      question: 'Como funciona o tratamento de objetos e arrays aninhados (Nested JSON)?',
      answer:
        'Nossa ferramenta achata automaticamente objetos JSON aninhados em colunas com notação de ponto (ex: address.city, user.profile.name). Ao converter de CSV de volta para JSON, a opção "Expand nested" reconstrói os objetos originais perfeitamente.',
    },
    {
      icon: <Zap className="size-5 text-cyan-400" />,
      question: 'Existe limite de tamanho para os arquivos JSON ou CSV?',
      answer:
        'Como o processamento utiliza a memória ram local do seu dispositivo, você pode converter arquivos grandes com milhares de linhas sem filas de espera ou limites artificiais colocados por servidores.',
    },
    {
      icon: <FileSpreadsheet className="size-5 text-lime-400" />,
      question: 'Posso abrir o arquivo CSV gerado no Microsoft Excel ou Google Sheets?',
      answer:
        'Com certeza. Você pode escolher o delimitador ideal (vírgula `,`, ponto e vírgula `;`, tab `\\t` ou pipe `|`) para garantir compatibilidade perfeita com Excel, Google Sheets, bancos de dados PostgreSQL/MySQL ou scripts Python.',
    },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-14 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
          Perguntas Frequentes &amp; Recursos
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Tudo o que você precisa saber sobre o conversor JSON ↔ CSV mais rápido e seguro da web.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq, index) => (
          <Card
            key={index}
            className="border border-[rgba(124,58,237,0.2)] bg-[#16213e]/80 backdrop-blur-md shadow-lg"
          >
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-black/30 border border-white/5 shrink-0">
                  {faq.icon}
                </div>
                <h3 className="text-base font-bold text-slate-100 leading-snug">
                  {faq.question}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-11">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
