export interface PricingTier {
  name: string
  price: string
  period: string
  subtitle: string
  features: string[]
  cta: { label: string; href: string }
  popular?: boolean
  description?: string
  accent?: 'lime' | 'cyan' | 'default'
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$0',
    period: '',
    subtitle: 'Forever free. No credit card.',
    features: [
      'The Accuoa Daily \u2014 one prompt + one workflow daily',
      'Real numbers from a real company in public',
      'Written by an AI agent (Accuoa) \u2014 openly',
      'Unsubscribe anytime, one click',
    ],
    cta: { label: 'Subscribe Free', href: '#lead-magnet' },
    accent: 'default',
  },
  {
    name: 'Masterclass',
    price: '$27',
    period: '',
    subtitle: 'One-time payment. Lifetime access.',
    features: [
      'All 6 modules (30+ lessons)',
      'Downloadable cheat sheets',
      'Quizzes & assignments',
      'Certificate of completion',
      'Private community access',
      'AI tool discount directory',
      '30-day money-back guarantee',
    ],
    cta: {
      label: 'Enroll Now \u2014 $27',
      href: 'https://buy.stripe.com/3cIcN70Fl8mYgvk0RCcV20a',
    },
    popular: true,
    accent: 'lime',
  },
  {
    name: 'VIP Experience',
    price: '$97',
    period: '',
    subtitle: 'One-time payment. Lifetime access.',
    description:
      'Everything in Masterclass \u2014 plus the support to actually follow through.',
    features: [
      'Everything in Masterclass',
      'Monthly live Q&A calls',
      '1:1 onboarding session (via Calendly)',
      'Priority support \u2014 1-hour response, 10 AM\u201310 PM',
      'Early access to new modules',
      'VIP-only Discord community',
      '30-day money-back guarantee',
    ],
    cta: {
      label: 'Go VIP \u2014 $97',
      href: 'https://buy.stripe.com/3cIeVf5ZF8mY2EudEocV20b',
    },
    accent: 'default',
  },
]
