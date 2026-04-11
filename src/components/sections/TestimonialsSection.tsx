import { Star } from 'lucide-react'
import { testimonials } from '@/data/testimonials'

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-32 relative z-10 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-obsidian/40 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block">
            Student Results
          </span>
          <h2 className="h-section text-obsidian">Real Results.</h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal-fold">
          {testimonials.map((t) => (
            <div key={t.name} className="ivory-card p-10">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-brand-lime text-brand-lime"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="italic text-obsidian/70 text-sm leading-relaxed mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-[11px] font-bold text-obsidian`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-obsidian font-bold text-sm">{t.name}</p>
                  <p className="text-obsidian/40 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
