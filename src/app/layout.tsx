import type { Metadata } from 'next'
import { Inter, Syne, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://mindsparkstack.com'),
  title: 'MindSparkAI — Learn AI. Use AI. Lead with AI.',
  description:
    'Learn to use AI tools to automate your work, boost productivity, and future-proof your career. No tech background required. Masterclass $27 or Go VIP $97 — both lifetime access.',
  keywords: [
    'AI course',
    'learn AI',
    'ChatGPT course',
    'AI productivity',
    'AI tools',
    'artificial intelligence training',
    'AI for beginners',
    'online AI course',
  ],
  authors: [{ name: 'MindSparkAI' }],
  openGraph: {
    type: 'website',
    url: 'https://mindsparkstack.com',
    title: 'MindSparkAI — Learn AI. Use AI. Lead with AI.',
    description:
      'The most practical AI course for everyday professionals. Master ChatGPT, Claude, Gemini, and automation tools. Masterclass $27 or Go VIP $97 — lifetime access.',
    siteName: 'MindSparkAI',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mindsparkai',
    title: 'MindSparkAI — Learn AI. Use AI. Lead with AI.',
    description:
      'The most practical AI course for everyday professionals. Lifetime access for $27.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://mindsparkstack.com' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} ${jetbrains.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Course',
              name: 'MindSparkAI Masterclass',
              description:
                'Learn to use AI agents to automate work, boost productivity, and future-proof your career.',
              provider: {
                '@type': 'Organization',
                name: 'MindSparkAI',
                url: 'https://mindsparkstack.com',
              },
              offers: {
                '@type': 'Offer',
                price: '27',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: 'https://buy.stripe.com/3cIcN70Fl8mYgvk0RCcV20a',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased font-sans">
        <div className="grain-overlay" />
        {children}
      </body>
    </html>
  )
}
