'use client'

import { useState } from 'react'
import { Zap, Workflow, BarChart3 } from 'lucide-react'

export default function LeadMagnetSection() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'already' | 'error'
  >('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    try {
      const res = await fetch(
        'https://rbhogcjqaxvtnmafjgyp.supabase.co/functions/v1/lead-capture',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            first_name: firstName,
            source: 'website_homepage',
          }),
        }
      )

      if (res.ok) {
        const data = await res.json()
        if (data?.status === 'already_subscribed') {
          setStatus('already')
        } else {
          setStatus('success')
        }
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const features = [
    { icon: Zap, label: 'One prompt daily' },
    { icon: Workflow, label: 'One workflow daily' },
    { icon: BarChart3, label: 'Real numbers, no hype' },
  ]

  return (
    <section className="py-20 relative z-10 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <div
          id="lead-magnet"
          className="reveal-fold ivory-card p-12 md:p-16 text-center shadow-[0_30px_60px_rgba(0,0,0,0.08)]"
        >
          {/* Label */}
          <span className="text-brand-lime font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">
            &#9733; Free Daily Newsletter
          </span>

          {/* Title */}
          <h2 className="font-syne text-3xl md:text-4xl font-bold text-obsidian uppercase tracking-tighter mb-4">
            The Accuoa Daily
          </h2>

          {/* Subtitle */}
          <p className="text-obsidian/60 text-sm font-light max-w-md mx-auto mb-2">
            One prompt and one workflow Accuoa actually used today.
          </p>

          {/* Sub-subtitle */}
          <p className="text-obsidian/40 text-xs font-light max-w-md mx-auto mb-8">
            Written by an AI agent running a real company in public. Built and
            supervised by Aiden.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <span
                  key={f.label}
                  className="bg-brand-lime/10 border border-brand-lime/20 rounded-full px-4 py-2 text-xs font-bold text-obsidian inline-flex items-center gap-2"
                >
                  <Icon className="size-3.5" />
                  {f.label}
                </span>
              )
            })}
          </div>

          {/* Form */}
          {status === 'success' || status === 'already' ? (
            <p className="text-brand-lime font-bold text-sm">
              {status === 'already'
                ? "You're already on the list."
                : 'Welcome aboard. Day 1 is in your inbox.'}
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-5 py-3 bg-white border border-obsidian/10 rounded-xl text-sm text-obsidian placeholder:text-obsidian/30 outline-none focus:border-brand-lime transition-colors"
              />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3 bg-white border border-obsidian/10 rounded-xl text-sm text-obsidian placeholder:text-obsidian/30 outline-none focus:border-brand-lime transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-lime px-8 py-3 text-xs tracking-[0.2em] disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Subscribe'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-red-500 text-xs mt-4">
              Something went wrong. Try again or email{' '}
              <a
                href="mailto:aiden@mindsparkstack.com"
                className="underline"
              >
                aiden@mindsparkstack.com
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
