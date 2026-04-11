import { Check } from 'lucide-react'
import { pricingTiers } from '@/data/pricing'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-32 relative z-10 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="h-echelon text-obsidian">Invest.</h2>
          <p className="text-obsidian/50 text-lg font-light max-w-xl mx-auto mt-4">
            Simple, transparent pricing. Start free. Upgrade when you&apos;re
            ready.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start reveal-fold">
          {pricingTiers.map((tier) => {
            const isPopular = tier.popular
            const isFree = tier.price === '$0'

            return (
              <div
                key={tier.name}
                className={`ivory-card p-10 ${
                  isPopular
                    ? 'ring-2 ring-brand-lime shadow-[0_30px_60px_rgba(212,255,0,0.15)] relative'
                    : ''
                }`}
              >
                {/* Most Popular badge */}
                {isPopular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-lime text-obsidian px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest font-syne shadow-lg whitespace-nowrap">
                    Most Popular
                  </span>
                )}

                {/* Tier label */}
                <span
                  className={`font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block ${
                    isPopular ? 'text-brand-lime' : 'text-obsidian/40'
                  }`}
                >
                  {tier.name}
                </span>

                {/* Price */}
                <div className="mb-2">
                  <span
                    className={`font-syne font-bold text-obsidian ${
                      isPopular ? 'text-6xl' : 'text-5xl'
                    }`}
                  >
                    {tier.price}
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-obsidian/40 text-sm mb-8">{tier.subtitle}</p>

                {/* VIP description */}
                {tier.description && (
                  <p className="text-obsidian/60 text-sm leading-relaxed mb-6 font-light">
                    {tier.description}
                  </p>
                )}

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="size-4 text-brand-lime flex-shrink-0 mt-0.5" />
                      <span className="text-obsidian/70 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isFree ? (
                  <a
                    href={tier.cta.href}
                    className="block w-full text-center py-4 border-2 border-obsidian/10 rounded-xl text-obsidian font-bold text-[11px] uppercase tracking-[0.15em] hover:border-brand-lime hover:bg-brand-lime/5 transition-all"
                  >
                    {tier.cta.label}
                  </a>
                ) : (
                  <a
                    href={tier.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center btn-lime py-5 rounded-xl"
                  >
                    {tier.cta.label}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
