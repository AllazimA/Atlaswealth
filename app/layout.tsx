import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ahmed Allazim | Senior Relationship Manager | Wealth Management',
  description: 'Senior Relationship Manager with 10+ years experience in Wealth Management, HNWI/UHNWI client portfolios, and AI-driven financial solutions across the UAE and MENA region.',
  keywords: ['Ahmed Allazim', 'Wealth Management', 'Relationship Manager', 'HNWI', 'UAE Banking', 'Dubai Finance'],
  authors: [{ name: 'Ahmed Allazim' }],
  openGraph: {
    title: 'Ahmed Allazim | Senior Relationship Manager',
    description: 'Premium wealth management and banking expertise in the UAE.',
    url: 'https://ahmedallazim.com',
    siteName: 'Ahmed Allazim Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmed Allazim | Senior Relationship Manager',
    description: 'Premium wealth management and banking expertise in the UAE.',
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
