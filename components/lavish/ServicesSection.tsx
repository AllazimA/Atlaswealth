'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Service {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  icon: string
}

const services: Service[] = [
  {
    id: 1,
    title: 'Bespoke Travel Planning',
    subtitle: 'Curated Journeys',
    description: 'Tailor-made itineraries crafted around your desires — from imperial cities to secret desert oases no guidebook has discovered.',
    image: '/lavish/Morocco%20desert%20%26%20sand.jpg',
    icon: '✦',
  },
  {
    id: 2,
    title: 'VIP Airport Services',
    subtitle: 'Seamless Arrivals',
    description: 'Private terminals, personal meet & greet, customs facilitation, and a chauffeur-driven luxury fleet awaiting your arrival.',
    image: '/lavish/Airport%20services.jpg',
    icon: '◆',
  },
  {
    id: 3,
    title: 'Luxury Accommodations & Riads',
    subtitle: 'Extraordinary Stays',
    description: 'Access to palaces, private riads, and ultra-luxury villas not publicly listed — each property personally vetted by our team.',
    image: '/lavish/la-mamounia-marrakech.jpg',
    icon: '◈',
  },
  {
    id: 4,
    title: 'Private Experiences',
    subtitle: 'Exclusive Access',
    description: 'Sunrise camel rides over Saharan dunes, private Fez medina tours, helicopter rides over Atlas peaks — experiences beyond price.',
    image: '/lavish/Menara%20Marrakech.jpg',
    icon: '◇',
  },
  {
    id: 5,
    title: 'Chauffeur & Transport',
    subtitle: 'Effortless Movement',
    description: 'Our fleet of premium vehicles ensures every transfer is a statement — from airport arrivals to inter-city journeys in supreme comfort.',
    image: '/lavish/Private%20jet.jpg',
    icon: '◉',
  },
  {
    id: 6,
    title: 'Events & Occasions',
    subtitle: 'Unforgettable Moments',
    description: 'Private chef dinners in kasbahs, rooftop banquets over Marrakech, weddings, and corporate galas orchestrated to perfection.',
    image: '/lavish/Fine%20dining%20restaurant.jpg',
    icon: '◎',
  },
]

export default function ServicesSection() {
  return (
    <section style={{ background: '#080808', padding: '120px 0' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">

        {/* ── Section Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}
          >
            <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.5)' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>
              Signature Services
            </span>
            <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.5)' }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 300,
              color: '#F5F0E8',
              letterSpacing: '0.02em',
              lineHeight: 1.15,
            }}
          >
            Every Wish, Anticipated
          </motion.h2>
        </div>

        {/* ── Services Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ background: 'rgba(196,163,90,0.08)' }}
        >
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group lv-img-zoom"
              style={{
                position: 'relative',
                aspectRatio: '4/3',
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#111',
              }}
            >
              <Link href="/lavish-morocco/services" style={{ position: 'absolute', inset: 0, zIndex: 2 }} aria-label={service.title} />
              {/* Background image */}
              <img
                src={service.image}
                alt={service.title}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
                  filter: 'brightness(0.55)',
                }}
                className="group-hover:scale-[1.06] group-hover:brightness-[0.7]"
              />

              {/* Overlay gradient */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, transparent 30%, rgba(8,8,8,0.88) 100%)',
              }} />

              {/* Gold hover overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(196,163,90,0)',
                transition: 'background 0.4s ease',
              }}
                className="group-hover:bg-[rgba(196,163,90,0.06)]"
              />

              {/* Content */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '32px',
              }}>
                {/* Icon */}
                <div style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 18, color: '#C4A35A', marginBottom: 12,
                  transform: 'translateY(0)',
                  transition: 'transform 0.4s ease',
                }}
                  className="group-hover:-translate-y-1"
                >
                  {service.icon}
                </div>

                <div style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C4A35A', marginBottom: 8 }}>
                  {service.subtitle}
                </div>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 24, fontWeight: 400, color: '#F5F0E8',
                  marginBottom: 12, lineHeight: 1.2,
                }}>
                  {service.title}
                </h3>

                {/* Description — reveals on hover */}
                <p style={{
                  fontSize: 13, color: '#C8BFA8', lineHeight: 1.65,
                  maxHeight: 0, overflow: 'hidden',
                  transition: 'max-height 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
                  opacity: 0,
                }}
                  className="group-hover:max-h-[100px] group-hover:opacity-100"
                >
                  {service.description}
                </p>

                {/* Arrow link */}
                <Link href="/lavish-morocco/services"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 16,
                    fontSize: 10,
                    letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    color: '#C4A35A',
                    textDecoration: 'none',
                    opacity: 0,
                    transform: 'translateY(8px)',
                    transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
                  }}
                  className="group-hover:opacity-100 group-hover:translate-y-0"
                >
                  Discover →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all services */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginTop: 56 }}
        >
          <Link href="/lavish-morocco/services" className="lv-btn-gold"
            style={{
              display: 'inline-block',
              padding: '13px 40px',
              fontSize: 10,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <span>View All Services</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
