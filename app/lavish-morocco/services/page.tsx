'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/lavish/Navbar'
import Footer from '@/components/lavish/Footer'
import PageHero from '@/components/lavish/PageHero'
import CTASection from '@/components/lavish/CTASection'

const categories = [
  {
    id: 'travel',
    label: 'Travel & Experiences',
    headline: 'Journeys Beyond the Ordinary',
    services: [
      {
        number: '01',
        title: 'Bespoke Travel Planning',
        subtitle: 'Curated Journeys',
        description: 'We craft every itinerary from the ground up — consulting deeply with our clients to understand their desires, rhythm, and definition of the extraordinary.',
        features: ['Custom multi-city itineraries', 'Private guides & exclusive access', 'Curated dining reservations', 'Day-by-day concierge support'],
        image: '/lavish/Morocco%20desert%20%26%20sand.jpg',
      },
      {
        number: '02',
        title: 'VIP Airport Services',
        subtitle: 'Seamless Arrivals',
        description: 'Personal meet & greet, dedicated customs and immigration facilitation, private lounges, and a fleet of impeccable vehicles awaiting every transfer.',
        features: ['Private terminal access', 'Personal meet & greet', 'Immigration facilitation', 'Luxury fleet transfers'],
        image: '/lavish/Airport%20services.jpg',
      },
      {
        number: '03',
        title: 'Private Experiences',
        subtitle: 'Exclusive Access',
        description: 'Private palaces, after-hours museum visits, master artisan workshops, clandestine culinary traditions, and landscapes that require private permission to enter.',
        features: ['Private medina & cultural tours', 'After-hours historical access', 'Master artisan encounters', 'Desert & mountain adventures'],
        image: '/lavish/Camel%20caravane.jpg',
      },
    ],
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle & Concierge',
    headline: 'Excellence in Every Detail',
    services: [
      {
        number: '04',
        title: 'Luxury Accommodations',
        subtitle: 'Homes Beyond Compare',
        description: 'Privately owned riads in historic medinas, palace suites at La Mamounia, and hilltop villas overlooking the Atlantic — each personally inspected by our team.',
        features: ['Exclusive off-market riads & villas', 'Palace suites & residences', 'Pre-arrival personalisation', 'In-property concierge team'],
        image: '/lavish/la-mamounia-marrakech.jpg',
      },
      {
        number: '05',
        title: 'Chauffeur & Transport',
        subtitle: 'Effortless Movement',
        description: 'A fleet of premium vehicles — from Rolls-Royce to Range Rover — with private jet charters, helicopter transfers, and yacht-to-shore tenders for every occasion.',
        features: ['Rolls-Royce, Bentley & G-Wagon fleet', 'Private jet & helicopter charters', 'Fixed-wing aircraft arrangements', 'Yacht & boat transfers'],
        image: '/lavish/Private%20jet.jpg',
      },
      {
        number: '06',
        title: 'Events & Occasions',
        subtitle: 'Unforgettable Moments',
        description: 'From intimate rooftop chef dinners to grand feasts in centuries-old kasbahs — weddings, milestone celebrations, and corporate galas curated to perfection.',
        features: ['Private chef & rooftop dinners', 'Exclusive restaurant reservations', 'Weddings & celebrations', 'Corporate galas & incentives'],
        image: '/lavish/Fine%20Dining.jpg',
      },
    ],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.85, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

function ServiceCard({ service, index }: { service: typeof categories[0]['services'][0]; index: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      custom={index}
      variants={fadeUp}
      className="group"
      style={{
        background: '#0c0c0c',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        <img
          src={service.image}
          alt={service.title}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', display: 'block',
            transition: 'transform 0.9s cubic-bezier(0.22,1,0.36,1), filter 0.5s ease',
            filter: 'brightness(0.82) saturate(0.88)',
          }}
          className="group-hover:scale-[1.06] group-hover:brightness-[0.65]"
        />
        {/* Gold corner accents */}
        <div style={{
          position: 'absolute', top: 14, left: 14, width: 26, height: 26,
          borderTop: '1px solid rgba(196,163,90,0.55)', borderLeft: '1px solid rgba(196,163,90,0.55)',
          opacity: 0.5, transition: 'opacity 0.4s ease',
        }} className="group-hover:opacity-100" />
        <div style={{
          position: 'absolute', bottom: 14, right: 14, width: 26, height: 26,
          borderBottom: '1px solid rgba(196,163,90,0.55)', borderRight: '1px solid rgba(196,163,90,0.55)',
          opacity: 0.5, transition: 'opacity 0.4s ease',
        }} className="group-hover:opacity-100" />
        {/* Number */}
        <div style={{
          position: 'absolute', top: 16, right: 18,
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 11, color: 'rgba(196,163,90,0.55)', letterSpacing: '0.15em',
        }}>
          {service.number}
        </div>
        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 50%, rgba(12,12,12,0.6) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.48em', textTransform: 'uppercase',
          color: '#C4A35A', fontWeight: 500, marginBottom: 10,
        }}>
          {service.subtitle}
        </div>

        <h3 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 22, fontWeight: 400, color: '#F5F0E8',
          lineHeight: 1.2, letterSpacing: '0.02em', marginBottom: 14,
        }}>
          {service.title}
        </h3>

        <p style={{ fontSize: 13, color: '#C8BFA8', lineHeight: 1.8, marginBottom: 20, flex: 1 }}>
          {service.description}
        </p>

        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 26 }}>
          {service.features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 16, height: 1, background: '#C4A35A', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#6B6355', letterSpacing: '0.04em', transition: 'color 0.35s ease' }} className="group-hover:text-[#C8BFA8]">
                {f}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/lavish-morocco/contact"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
            fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
            color: '#C4A35A', textDecoration: 'none', fontWeight: 500,
            borderBottom: '1px solid transparent', paddingBottom: 3,
            transition: 'border-color 0.3s ease, gap 0.3s ease',
          }}
          className="hover:border-[rgba(196,163,90,0.6)]"
        >
          Request Service
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transition: 'transform 0.3s ease' }}>
            <path d="M1 9L9 1M9 1H3M9 1V7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  )
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="What We Offer"
          title="Signature"
          titleItalic="Services"
          subtitle="Every service we provide is delivered with the same unwavering standard of excellence — discreet, bespoke, and designed entirely around you."
          image="/lavish/lagzira-beach.jpg"
          height="65vh"
        />

        {/* Intro */}
        <section style={{ background: '#080808', padding: '64px 0 48px' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_4fr] gap-12 lg:gap-24 items-end">
              <motion.h2
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  fontWeight: 300, color: '#F5F0E8',
                  lineHeight: 1.1, letterSpacing: '0.02em',
                }}
              >
                Six pillars of an<br />
                <em style={{ fontStyle: 'italic', color: '#DFC08A' }}>uncompromising standard</em>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.85 }}
              >
                From the moment your journey begins to the quiet of your final evening, our services work in seamless concert — each one refined over years of delivering the impossible to those who expect nothing less.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Gold divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.25), transparent)' }} />

        {/* Service categories */}
        {categories.map((cat, catIndex) => (
          <section
            key={cat.id}
            style={{
              background: catIndex % 2 === 0 ? '#080808' : '#0a0a0a',
              padding: '64px 0 64px',
            }}
          >
            <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">

              {/* Category label + headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.75 }}
                style={{ marginBottom: 36 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 1, background: '#C4A35A' }} />
                  <span style={{
                    fontSize: 10, letterSpacing: '0.52em', textTransform: 'uppercase',
                    color: '#C4A35A', fontWeight: 500,
                  }}>
                    {cat.label}
                  </span>
                </div>
                <h2 style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 'clamp(26px, 3vw, 40px)',
                  fontWeight: 300, color: '#F5F0E8',
                  letterSpacing: '0.02em', lineHeight: 1.15,
                }}>
                  {cat.headline}
                </h2>
              </motion.div>

              {/* 3-column grid with gap-px gold seams */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
                style={{ background: 'rgba(196,163,90,0.1)' }}
              >
                {cat.services.map((service, i) => (
                  <ServiceCard key={service.number} service={service} index={i} />
                ))}
              </div>
            </div>

            {/* Bottom divider (not on last category) */}
            {catIndex < categories.length - 1 && (
              <div style={{ maxWidth: 1440, margin: '32px auto 0', padding: '0 48px' }} className="px-6 lg:px-12">
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.2), transparent)' }} />
              </div>
            )}
          </section>
        ))}

        <CTASection />
      </main>
      <Footer />
    </>
  )
}
