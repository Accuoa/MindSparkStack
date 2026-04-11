import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — MindSparkAI',
  description: 'Terms of service for MindSparkAI courses and subscriptions.',
}

export default function TermsPage() {
  return (
    <main className="bg-ivory min-h-screen pt-32 pb-20 px-6 sm:px-8">
      <article className="max-w-3xl mx-auto prose prose-sm prose-neutral">
        <h1 className="font-syne text-4xl font-bold text-obsidian uppercase tracking-tighter mb-2">
          Terms of Service
        </h1>
        <p className="text-obsidian/40 text-sm mb-12">Last updated: April 2026</p>

        <section className="space-y-8 text-obsidian/70 text-sm leading-relaxed">
          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using MindSparkAI (&ldquo;the Service&rdquo;), you agree to be bound
              by these Terms. If you do not agree, do not use the Service.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              2. Account & Access
            </h2>
            <p>
              Course purchases grant you a personal, non-transferable, lifetime license to access
              the enrolled course content. Subscription tiers (Core Stack, Hive Protocol, Vanguard
              Architect) grant access for the duration of your active subscription.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              3. Payments
            </h2>
            <p>
              All payments are processed securely through Stripe. Course purchases are one-time
              payments. Subscriptions are billed monthly and can be cancelled at any time from your
              billing page.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              4. Intellectual Property
            </h2>
            <p>
              All course content, materials, and resources are owned by MindSparkAI. You may not
              redistribute, resell, or share course materials without written permission. Workflows
              and automations you build using the course are yours.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              5. Community Guidelines
            </h2>
            <p>
              Access to community features (Discord, live calls) requires respectful conduct. We
              reserve the right to revoke community access for harassment, spam, or disruptive
              behavior without refund of community-specific features.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              6. Disclaimer
            </h2>
            <p>
              MindSparkAI provides educational content. Results vary by individual. We do not
              guarantee specific income, career, or productivity outcomes. The Service is provided
              &ldquo;as is&rdquo; without warranties of any kind.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              7. Contact
            </h2>
            <p>
              Questions about these terms? Contact{' '}
              <a href="mailto:aiden@mindsparkstack.com" className="text-brand-lime hover:underline">
                aiden@mindsparkstack.com
              </a>
              .
            </p>
          </div>
        </section>
      </article>
    </main>
  )
}
