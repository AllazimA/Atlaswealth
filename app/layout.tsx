import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Atlas Wealth | Luxury Concierge & Wealth Management',
  description: 'Experience premium wealth management with WealthOS and luxury concierge services with Lavish Morocco. Integrated solutions for modern wealth management.',
  keywords: ['Wealth Management', 'Investment Dashboard', 'Luxury Concierge', 'Financial Planning', 'Real-time Market Data', 'Portfolio Management'],
  authors: [{ name: 'Ahmed Allazim' }],
  openGraph: {
    title: 'Atlas Wealth | Luxury Concierge & Wealth Management',
    description: 'Premium wealth management with WealthOS and luxury concierge services with Lavish Morocco.',
    url: 'https://atlas-wealth.vercel.app',
    siteName: 'Atlas Wealth',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atlas Wealth | Luxury Concierge & Wealth Management',
    description: 'Premium wealth management with WealthOS and luxury concierge services with Lavish Morocco.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050814' },
    { media: '(prefers-color-scheme: light)', color: '#f8f7f4' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
