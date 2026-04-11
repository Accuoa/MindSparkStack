'use client'

import { useEffect, useState } from 'react'

function useCountdown() {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' })

  useEffect(() => {
    const key = 'msai_launch_end'
    let end = localStorage.getItem(key)
    if (!end) {
      end = String(Date.now() + 72 * 3600 * 1000)
      localStorage.setItem(key, end)
    }
    const endTime = Number(end)

    function tick() {
      const diff = Math.max(0, endTime - Date.now())
      setTime({
        h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      })
      return diff
    }

    tick()
    const interval = setInterval(() => {
      if (tick() <= 0) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return time
}

export default function FinalCTASection() {
  const { h, m, s } = useCountdown()

  return (
    <section className="py-32 relative z-10 px-6 sm:px-8 text-center">
      <div className="max-w-3xl mx-auto reveal-fold">
        <span className="text-brand-lime font-bold text-[10px] uppercase tracking-[0.2em] mb-6 block">
          Limited Time Offer
        </span>
        <h2 className="h-echelon text-white mb-8">
          Your AI Journey
          <br />
          <span className="text-brand-lime">Starts Today.</span>
        </h2>
        <p className="text-white/40 text-lg font-light mb-12 max-w-md mx-auto">
          Introductory pricing ends soon. Lock in $27 before it goes to $97.
        </p>

        <div className="flex gap-6 justify-center flex-wrap mb-16">
          {[
            { value: h, label: 'Hours' },
            { value: m, label: 'Minutes' },
            { value: s, label: 'Seconds' },
          ].map((unit) => (
            <div
              key={unit.label}
              className="echelon-card px-8 py-6 text-center min-w-[100px]"
            >
              <div className="countdown-num">{unit.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-2">
                {unit.label}
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://buy.stripe.com/3cIcN70Fl8mYgvk0RCcV20a"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-glass-glow px-14 py-6 text-sm shadow-[0_0_60px_rgba(212,255,0,0.3)]"
        >
          Enroll Now for $27
        </a>
      </div>
    </section>
  )
}
