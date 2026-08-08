import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Converter from './components/Converter'

function App() {
  return (
    <TooltipProvider>
      <div
        className="min-h-screen py-12"
        style={{
          background: 'radial-gradient(ellipse at top, #1a1040 0%, #0f0f1a 60%)',
        }}
      >
        {/* Ambient glow orbs */}
        <div
          className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="fixed bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <Converter />

        <footer className="text-center mt-8 pb-4" style={{ color: 'rgba(148,163,184,0.4)' }}>
          <p className="text-xs">JSON ↔ CSV · All processing is done locally in your browser</p>
        </footer>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}

export default App
