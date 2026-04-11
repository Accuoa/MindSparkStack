import { Rocket, Clock, Target } from 'lucide-react'

const problems = [
  {
    icon: Rocket,
    color: 'brand-lime',
    title: 'Getting Left Behind',
    description:
      'Your colleagues are using AI to work 3x faster, get promoted, and take on bigger projects — while you\'re still doing things the old way.',
  },
  {
    icon: Clock,
    color: 'brand-cyan',
    title: 'Wasting Hours',
    description:
      'You\'re spending hours on tasks that AI could automate in minutes — email, research, writing, scheduling. That time is gone forever.',
  },
  {
    icon: Target,
    color: 'brand-red',
    title: 'Overwhelmed',
    description:
      'There\'s an ocean of AI tools, tutorials, and hype — and no clear roadmap for how to actually use any of it to move forward.',
  },
] as const

export default function ProblemSection() {
  return (
    <section id="problem" className="py-32 relative z-10 px-6 sm:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-20">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-lime">
          The Problem
        </span>
        <h2 className="h-section text-sheen mt-4">AI Is Changing Everything</h2>
        <p className="text-xl text-white/50 max-w-2xl mx-auto mt-6 font-light leading-relaxed">
          Your colleagues are using AI to work 3x faster. Are you keeping up?
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-8 reveal-fold">
        {problems.map((problem) => {
          const Icon = problem.icon
          const bgColor =
            problem.color === 'brand-lime'
              ? 'bg-brand-lime/10'
              : problem.color === 'brand-cyan'
                ? 'bg-brand-cyan/10'
                : 'bg-brand-red/10'
          const textColor =
            problem.color === 'brand-lime'
              ? 'text-brand-lime'
              : problem.color === 'brand-cyan'
                ? 'text-brand-cyan'
                : 'text-brand-red'

          return (
            <div key={problem.title} className="echelon-card p-10">
              <div
                className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center mb-6`}
              >
                <Icon className={`h-7 w-7 ${textColor}`} />
              </div>
              <h3 className="font-syne text-xl font-bold text-white uppercase tracking-tight mb-4">
                {problem.title}
              </h3>
              <p className="text-white/40 font-light leading-relaxed text-sm">
                {problem.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
