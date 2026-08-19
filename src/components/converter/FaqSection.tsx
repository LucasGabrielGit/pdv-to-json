import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Layers, FileSpreadsheet, Zap } from 'lucide-react'

export const FaqSection: React.FC = () => {
  const faqs = [
    {
      icon: <ShieldCheck className="size-5 text-emerald-400" />,
      question: 'Are my files and data secure when converting JSON or CSV?',
      answer:
        'Yes, 100%! Unlike many online converters, all processing runs entirely within your browser via client-side JavaScript. None of your data or files are ever sent to any remote server.',
    },
    {
      icon: <Layers className="size-5 text-purple-400" />,
      question: 'How does nested JSON object flattening work?',
      answer:
        'Our converter automatically flattens nested JSON objects into dot-notation columns (e.g. address.city, user.profile.name). When converting CSV back to JSON, the "Expand nested" option accurately reconstructs the original nested structures.',
    },
    {
      icon: <Zap className="size-5 text-cyan-400" />,
      question: 'Is there a file size limit for JSON or CSV conversions?',
      answer:
        'Because data is processed using your local machine memory, you can convert large datasets with thousands of rows without queue delays or artificial server upload caps.',
    },
    {
      icon: <FileSpreadsheet className="size-5 text-lime-400" />,
      question: 'Can I open the generated CSV in Microsoft Excel or Google Sheets?',
      answer:
        'Absolutely. You can choose custom delimiters (comma `,`, semicolon `;`, tab `\\t`, or pipe `|`) to ensure seamless compatibility with Excel, Google Sheets, PostgreSQL, MySQL, or Python scripts.',
    },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-14 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Everything you need to know about the fastest, private JSON ↔ CSV converter.
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

