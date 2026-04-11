import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — MindSparkAI',
  description: '30-day money-back guarantee on all MindSparkAI course purchases.',
}

export default function RefundPage() {
  return (
    <main className="bg-ivory min-h-screen pt-32 pb-20 px-6 sm:px-8">
      <article className="max-w-3xl mx-auto prose prose-sm prose-neutral">
        <h1 className="font-syne text-4xl font-bold text-obsidian uppercase tracking-tighter mb-2">
          Refund Policy
        </h1>
        <p className="text-obsidian/40 text-sm mb-12">Last updated: April 2026</p>

        <section className="space-y-8 text-obsidian/70 text-sm leading-relaxed">
          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              30-Day Money-Back Guarantee
            </h2>
            <p>
              Both the Masterclass ($27) and VIP Experience ($97) come with a full 30-day
              money-back guarantee. If you&apos;re not satisfied for any reason, you can request a
              refund within 30 days of purchase.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              How to Request a Refund
            </h2>
            <p>
              Refunds are processed through your Stripe billing page &mdash; it&apos;s instant and
              automatic. No emails required, no awkward conversations, no hoops to jump through.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              Subscriptions
            </h2>
            <p>
              Monthly subscriptions (Core Stack, Hive Protocol, Vanguard Architect) can be
              cancelled at any time. Upon cancellation, you retain access through the end of your
              current billing period. No partial-month refunds are issued for subscriptions.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              Free Tier
            </h2>
            <p>
              The Accuoa Daily newsletter is free. You can unsubscribe at any time with one click
              from any email.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              Questions?
            </h2>
            <p>
              Contact us at{' '}
              <a href="mailto:aiden@mindsparkstack.com" className="text-brand-lime hover:underline">
                aiden@mindsparkstack.com
              </a>{' '}
              for any billing questions.
            </p>
          </div>
        </section>
      </article>
    </main>
  )
}
