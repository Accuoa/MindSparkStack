import { Check } from 'lucide-react'
import { subscriptionTiers } from '@/data/subscriptions'

export default function SubscriptionsSection() {
  return (
    <section id="subscriptions" className="py-32 relative z-10 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-obsidian/40 font-bold uppercase tracking-[0.2em] text-[10px] mb-4 block">
            Or — Run With Accuoa Monthly
          </span>
          <h2 className="h-echelon text-obsidian">Subscribe.</h2>
          <p className="text-obsidian/50 text-lg font-light max-w-xl mx-auto mt-4">
            Ongoing artifacts, live rooms, and direct access. Built by Accuoa,
            supervised by Aiden.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start reveal-fold">
          {subscriptionTiers.map((tier) => {
            const isPopular = tier.popular
            const isHive = tier.name === 'Hive Protocol'
            const isCoreStack = tier.name === 'Core Stack'

            // Label color
            const labelColor = isCoreStack
              ? 'text-brand-lime'
              : isHive
                ? 'text-brand-cyan'
                : 'text-obsidian/40'

            // Check icon color
            const checkColor =
              isHive ? 'text-brand-cyan' : 'text-brand-lime'

            return (
              <div
                key={tier.name}
                className={`ivory-card p-10 ${
                  isPopular
                    ? 'ring-2 ring-brand-cyan shadow-[0_30px_60px_rgba(0,208,255,0.15)] relative'
                    : ''
                }`}
              >
                {/* Most Popular badge */}
                {isPopular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-cyan text-obsidian px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest font-syne shadow-lg whitespace-nowrap">
                    Most Popular
                  </span>
                )}

                {/* Tier + Category */}
                <span className="text-obsidian/30 font-bold text-[10px] uppercase tracking-[0.2em] mb-1 block">
                  {tier.tier} — {tier.category}
                </span>

                {/* Name */}
                <span
                  className={`font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block ${labelColor}`}
                >
                  {tier.name}
                </span>

                {/* Price */}
                <div className="mb-2">
                  <span className="font-syne text-5xl font-bold text-obsidian">
                    {tier.price}
                  </span>
                  <span className="text-lg text-obsidian/40 ml-1">/mo</span>
                </div>

                {/* Subtitle */}
                <p className="text-obsidian/40 text-sm mb-8">{tier.subtitle}</p>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`size-4 ${checkColor} flex-shrink-0 mt-0.5`}
                      />
                      <span className="text-obsidian/70 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isHive ? (
                  <a
                    href={tier.cta.href}
                    className="block w-full text-center bg-brand-cyan text-obsidian py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.15em] hover:brightness-110 transition-all"
                  >
                    {tier.cta.label}
                  </a>
                ) : (
                  <a
                    href={tier.cta.href}
                    className="block w-full text-center py-4 border-2 border-obsidian/10 rounded-xl text-obsidian font-bold text-[11px] uppercase tracking-[0.15em] hover:border-brand-lime hover:bg-brand-lime/5 transition-all"
                  >
                    {tier.cta.label}
                  </a>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-obsidian/30 text-xs mt-12 max-w-2xl mx-auto leading-relaxed">
          Each subscription includes everything in the tier below it &middot;
          Cancel anytime &middot; Run by Accuoa, supervised by Aiden
        </p>
      </div>
    </section>
  )
}
