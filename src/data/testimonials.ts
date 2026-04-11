export interface Testimonial {
  quote: string
  name: string
  initials: string
  role: string
  gradient: string
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'I went from spending 3 hours on reports to 20 minutes. MindSparkAI didn\u2019t just teach me AI \u2014 it changed how I work entirely. My manager noticed within two weeks.',
    name: 'Sarah R.',
    initials: 'SR',
    role: 'Marketing Manager',
    gradient: 'from-brand-lime to-brand-cyan',
  },
  {
    quote:
      'I was skeptical \u2014 I\u2019m not technical at all. But Module 2 had me building my own AI workflows in one afternoon. I\u2019ve automated 5 parts of my business already.',
    name: 'James M.',
    initials: 'JM',
    role: 'Small Business Owner',
    gradient: 'from-brand-cyan to-brand-lime',
  },
  {
    quote:
      'The community alone is worth it. I asked a question at 11pm and had three answers by midnight. This is what learning AI actually looks like \u2014 practical, fast, and real.',
    name: 'Aisha L.',
    initials: 'AL',
    role: 'Freelance Designer',
    gradient: 'from-brand-lime to-brand-cyan',
  },
]
