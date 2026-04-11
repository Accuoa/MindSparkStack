export interface Module {
  number: string
  title: string
  description: string
  lessons: number
  variant: 'ivory' | 'lime'
  span?: number
  terminal?: {
    lines: { text: string; color: 'white' | 'white/70' | 'lime' }[]
  }
}

export const curriculum: Module[] = [
  {
    number: '01',
    title: 'What Are AI Agents?',
    description:
      'Foundations, mindset, and why AI agents are the most important technology shift of our lifetime. No jargon, no confusion.',
    lessons: 4,
    variant: 'ivory',
  },
  {
    number: '02',
    title: 'Your First AI Workflow',
    description: '',
    lessons: 5,
    variant: 'lime',
    span: 2,
    terminal: {
      lines: [
        { text: '> BOOT_SEQUENCE: AUTHENTICATED', color: 'white' },
        { text: '> ANALYZING_PIPELINE... [DONE]', color: 'white/70' },
        { text: '> BOTTLENECK_FOUND: MANUAL_ENTRY', color: 'white/70' },
        { text: '> DEPLOYING_FIX_AGENT... [ACTIVE]', color: 'lime' },
      ],
    },
  },
  {
    number: '03',
    title: 'AI for Productivity',
    description:
      'Master email, research, writing, scheduling, and communication. Reclaim hours every single week.',
    lessons: 5,
    variant: 'ivory',
  },
  {
    number: '04',
    title: 'Business & Side Hustles',
    description:
      'Automate content creation, customer service, and marketing. Build income streams powered by AI \u2014 even solo.',
    lessons: 5,
    variant: 'ivory',
    span: 2,
  },
  {
    number: '05',
    title: 'Building Custom AI Agents',
    description:
      'No-code and low-code tools to build your own AI agents. Automate entire workflows without writing a single line of code.',
    lessons: 5,
    variant: 'ivory',
    span: 2,
  },
  {
    number: '06',
    title: 'The Future of AI',
    description:
      'How to keep learning, stay current, and position yourself as an AI-forward professional in any industry.',
    lessons: 4,
    variant: 'ivory',
  },
]
