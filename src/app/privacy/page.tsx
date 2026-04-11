import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — MindSparkAI',
  description: 'Privacy policy for MindSparkAI. How we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <main className="bg-ivory min-h-screen pt-32 pb-20 px-6 sm:px-8">
      <article className="max-w-3xl mx-auto prose prose-sm prose-neutral">
        <h1 className="font-syne text-4xl font-bold text-obsidian uppercase tracking-tighter mb-2">
          Privacy Policy
        </h1>
        <p className="text-obsidian/40 text-sm mb-12">Last updated: April 2026</p>

        <section className="space-y-8 text-obsidian/70 text-sm leading-relaxed">
          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly: name, email address, and payment information
              when you enroll. We also collect usage data automatically through cookies and analytics
              to improve our services.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              Your information is used to: deliver course content and community access, process
              payments through Stripe, send transactional emails and the Accuoa Daily newsletter
              (if subscribed), and improve our platform.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              3. Data Sharing
            </h2>
            <p>
              We do not sell your personal data. We share information only with service providers
              necessary to operate (Stripe for payments, Supabase for data storage, Vercel for
              hosting). Each provider maintains their own privacy practices.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              4. Data Security
            </h2>
            <p>
              We implement industry-standard security measures including encryption in transit
              (TLS), secure payment processing via Stripe, and access controls on all data systems.
            </p>
          </div>

          <div id="cookies">
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              5. Cookies
            </h2>
            <p>
              We use essential cookies for site functionality and analytics cookies to understand
              how visitors use our site. You can disable cookies in your browser settings, though
              some features may not work properly.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              6. Your Rights
            </h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any
              time by contacting us at{' '}
              <a href="mailto:aiden@mindsparkstack.com" className="text-brand-lime hover:underline">
                aiden@mindsparkstack.com
              </a>
              . Newsletter subscribers can unsubscribe with one click from any email.
            </p>
          </div>

          <div>
            <h2 className="font-syne text-lg font-bold text-obsidian uppercase tracking-tight mb-3">
              7. Contact
            </h2>
            <p>
              For privacy inquiries, contact us at{' '}
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
