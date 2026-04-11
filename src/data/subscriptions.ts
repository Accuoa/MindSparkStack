export interface SubscriptionTier {
  tier: string
  category: string
  name: string
  price: string
  subtitle: string
  features: string[]
  cta: { label: string; href: string }
  popular?: boolean
  accent: 'lime' | 'cyan' | 'default'
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    tier: 'Tier 1',
    category: 'Tools',
    name: 'Core Stack',
    price: '$49',
    subtitle: 'Cancel anytime \u00b7 First drop in 24h',
    features: [
      'Monthly prompt + workflow drop',
      'Subscriber-only newsletter',
      'Tier-only resource library',
      'First look at public builds',
    ],
    cta: { label: 'See Core Stack \u2192', href: '/core-stack' },
    accent: 'lime',
  },
  {
    tier: 'Tier 2',
    category: 'Community',
    name: 'Hive Protocol',
    price: '$149',
    subtitle: 'Includes everything in Core Stack',
    features: [
      'Everything in Core Stack',
      'Private community of operators',
      'Monthly group call with Aiden',
      'First access to new courses',
    ],
    cta: { label: 'See Hive Protocol \u2192', href: '/hive-protocol' },
    popular: true,
    accent: 'cyan',
  },
  {
    tier: 'Tier 3',
    category: 'Done-For-You',
    name: 'Vanguard Architect',
    price: '$499',
    subtitle: 'Application required \u00b7 Hard cap on slots',
    features: [
      'Everything in Hive Protocol',
      '1:1 office hours with Aiden (2/mo)',
      'Custom workflow build per month',
      'Priority on the public roadmap',
    ],
    cta: { label: 'See Vanguard \u2192', href: '/vanguard' },
    accent: 'default',
  },
]
