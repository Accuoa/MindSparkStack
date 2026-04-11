'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function DemoSection() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  async function handleGenerate() {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setOutput([
      '> INITIALIZING_BLUEPRINT_ENGINE...',
      '> PARSING_CONTEXT...',
      '> ROUTING_TO_GEMINI_CORE...',
    ])

    try {
      const res = await fetch('/api/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: input.trim() }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      const text: string = data.text ?? data.blueprint ?? data.result ?? ''

      // Typewriter effect
      setOutput([])
      let buffer = ''
      for (let i = 0; i < text.length; i++) {
        buffer += text[i]
        // Batch updates every 12ms worth of characters
        await new Promise((r) => setTimeout(r, 12))
        setOutput([buffer])
      }
    } catch {
      setOutput(['> CRITICAL_FAILURE: CONNECTION_LOST'])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section
      id="demo"
      className="py-32 relative z-10 px-6 sm:px-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-20">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-cyan">
          Interactive Intelligence
        </span>
        <h2 className="h-section text-white mt-4">Live Architecture Gen.</h2>
        <p className="text-xl text-white/50 max-w-2xl mx-auto mt-6 font-light leading-relaxed">
          Describe a manual process. Watch an AI agent blueprint the automation
          in real time.
        </p>
      </div>

      {/* Main container */}
      <div className="reveal-fold bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 md:p-12 grid md:grid-cols-2 gap-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {/* Left - Input */}
        <div className="flex flex-col gap-6">
          <label className="text-[10px] font-mono uppercase tracking-widest text-brand-lime">
            Manual Process Context
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Every morning I manually check 4 inboxes, copy tracking numbers into a spreadsheet, and email suppliers with updates..."
            rows={8}
            className="bg-black/40 border border-white/10 rounded-xl p-5 text-white text-sm font-light focus:outline-none focus:border-brand-lime/50 placeholder:text-white/20 resize-none transition-colors"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            className="btn-lime w-full py-5 text-sm flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Engineer Blueprint'
            )}
          </button>
        </div>

        {/* Right - Terminal output */}
        <div className="terminal-block p-6 md:p-8 flex flex-col min-h-[300px]">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-3 h-3 rounded-full bg-brand-red/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-[9px] font-mono text-white/20 ml-3 uppercase tracking-widest">
              blueprint.output
            </span>
          </div>
          <div className="font-mono text-xs text-brand-lime/80 leading-relaxed flex-1 whitespace-pre-wrap">
            {output.length > 0 ? (
              output.map((line, i) => (
                <div key={i} className="mb-1">
                  {line}
                </div>
              ))
            ) : (
              <>
                <div className="text-white/20">
                  {'>'} WAITING_FOR_INPUT...
                </div>
                <div className="text-white/20 mt-1">
                  {'>'} SYSTEM_IDLE{' '}
                  <span className="terminal-cursor">_</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
