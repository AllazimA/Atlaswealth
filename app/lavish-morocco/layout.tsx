import type { Metadata } from 'next'
import './lavish.css'

export const metadata: Metadata = {
  title: 'Lavish Morocco | Luxury Concierge & Lifestyle Management',
  description: 'Bespoke luxury concierge services in Morocco. VIP airport transfers, private experiences, exclusive accommodations, and exceptional lifestyle management for discerning travelers.',
  keywords: 'luxury concierge Morocco, VIP travel Morocco, bespoke experiences Morocco, private tours Morocco, Agadir concierge',
  openGraph: {
    title: 'Lavish Morocco | Where Luxury Meets Authentic Morocco',
    description: 'Bespoke luxury concierge and lifestyle management in Morocco.',
    siteName: 'Lavish Morocco',
    locale: 'en_US',
    type: 'website',
  },
}

export default function LavishMoroccoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lavish-root">
      {children}
    </div>
  )
}
