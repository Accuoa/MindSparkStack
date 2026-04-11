import { ArrowRight } from 'lucide-react'
import { curriculum } from '@/data/curriculum'

export default function CurriculumSection() {
  return (
    <section id="modules" className="pt-60 pb-32 relative z-10 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h2 className="h-echelon text-obsidian">Curriculum.</h2>
        <div className="flex items-center gap-6 border-b border-obsidian/10 pb-4 mb-12">
          <span className="text-obsidian/40 font-bold text-[10px] uppercase tracking-[0.2em]">
            6 Modules / 30+ Lessons
          </span>
          <div className="h-1 w-48 bg-brand-lime rounded-full" />
        </div>

        {/* Bento Grid */}
        <div className="bento-group grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8">
          {curriculum.map((mod) => {
            const is2Col = (mod.span ?? 1) >= 2
            const colSpan = is2Col ? 'md:col-span-2' : ''
            const minH =
              mod.number === '01' || mod.number === '02'
                ? 'min-h-[320px]'
                : 'min-h-[280px]'

            if (mod.variant === 'lime') {
              // Module 02 — lime card
              return (
                <div
                  key={mod.number}
                  className={`reveal-fold lime-card ${colSpan} ${minH} p-10 flex flex-col justify-between`}
                >
                  {/* Top */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-obsidian/60 font-bold text-[10px] uppercase tracking-[0.2em]">
                        {mod.number} / First Workflow
                      </span>
                      <span className="w-4 h-4 rounded-full bg-white animate-pulse shadow-[0_0_20px_#fff]" />
                    </div>
                    <h3 className="font-syne text-4xl md:text-5xl font-bold text-obsidian uppercase tracking-tighter leading-[0.95]">
                      Your First
                      <br />
                      AI Workflow
                    </h3>
                  </div>

                  {/* Terminal Block */}
                  {mod.terminal && (
                    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 mt-6 font-mono text-xs space-y-1.5">
                      {mod.terminal.lines.map((line, i) => {
                        const colorClass =
                          line.color === 'lime'
                            ? 'text-brand-lime'
                            : line.color === 'white/70'
                              ? 'text-white/70'
                              : 'text-white'
                        return (
                          <p key={i} className={colorClass}>
                            {line.text}
                          </p>
                        )
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-obsidian/20 pt-4 mt-6">
                    <span className="text-obsidian/60 text-[10px] font-bold uppercase tracking-[0.2em]">
                      {mod.lessons} Lessons
                    </span>
                    <ArrowRight className="size-4 text-obsidian/30" />
                  </div>
                </div>
              )
            }

            // Ivory cards (modules 01, 03, 04, 05, 06)
            return (
              <div
                key={mod.number}
                className={`reveal-fold ivory-card ${colSpan} ${minH} p-10 flex flex-col justify-between`}
              >
                <div>
                  <span className="text-obsidian font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">
                    {mod.number} /
                  </span>
                  <h3
                    className={`font-syne ${is2Col ? 'text-3xl' : 'text-2xl'} font-bold text-obsidian uppercase tracking-tighter mb-3`}
                  >
                    {mod.title}
                  </h3>
                  <p className="text-obsidian/70 text-sm leading-relaxed font-light">
                    {mod.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-black/10 pt-4 mt-4">
                  <span className="text-obsidian/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                    {mod.lessons} Lessons
                  </span>
                  <ArrowRight className="size-4 text-obsidian/30" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
