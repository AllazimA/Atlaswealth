'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    id: 1,
    quote: 'Lavish Morocco transformed what could have been a holiday into an experience I will speak of for the rest of my life. Every detail was flawless — from the private riad to the Saharan camp under the stars.',
    name: 'Jonathan H.',
    title: 'Private Equity Partner',
    location: 'London, UK',
  },
  {
    id: 2,
    quote: 'I have used concierge services across five continents. None have matched the level of attention and cultural access that Lavish Morocco provides. They opened doors I did not know existed.',
    name: 'F. Al-Rashidi',
    title: 'Chief Executive',
    location: 'Dubai, UAE',
  },
  {
    id: 3,
    quote: 'Our family celebration in Marrakech was orchestrated with an elegance that exceeded even our highest expectations. Three generations left Morocco changed forever.',
    name: 'Henri D.',
    title: 'Family Office Principal',
    location: 'Paris, France',
  },
  {
    id: 4,
    quote: 'The discreet, anticipatory style of service is remarkable. They remembered preferences from our first trip and incorporated them seamlessly into every subsequent visit — without being asked.',
    name: 'Victoria K.',
    title: 'International Philanthropist',
    location: 'Geneva, Switzerland',
  },
  {
    id: 5,
    quote: 'A level of personalisation I have only encountered at the finest properties in the world. Lavish Morocco curated an itinerary that felt entirely ours — not a single generic moment.',
    name: 'M. Al-Sayed',
    title: 'Private Client',
    location: 'Riyadh, Saudi Arabia',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Testimonials() {
  return (
    <section style={{ background: '#0a0a0a', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient quote mark */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 480, fontWeight: 700,
        color: 'rgba(196,163,90,0.03)',
        lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
      }}>"</div>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px', position: 'relative' }} className="px-6 lg:px-12">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}
          >
            <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.4)' }} />
            <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>
              Client Voices
            </span>
            <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.4)' }} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 'clamp(28px, 3.5vw, 46px)',
              fontWeight: 300, color: '#F5F0E8', letterSpacing: '0.02em',
            }}
          >
            What Our Clients Say
          </motion.h2>
        </div>

        {/* Cards grid — 3 top, 2 centred bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'rgba(196,163,90,0.08)', marginBottom: 2 }}>
          {testimonials.slice(0, 3).map((t, i) => (
            <TestimonialCard key={t.id} t={t} i={i} />
          ))}
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-px"
          style={{ background: 'rgba(196,163,90,0.08)', maxWidth: '66.67%', margin: '2px auto 0' }}
        >
          {testimonials.slice(3).map((t, i) => (
            <TestimonialCard key={t.id} t={t} i={i + 3} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ t, i }: { t: typeof testimonials[0]; i: number }) {
  return (
    <motion.div
      initial="hidden" whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      custom={i} variants={fadeUp}
      className="group"
      style={{
        background: '#0c0c0c',
        padding: '40px 36px 36px',
        display: 'flex', flexDirection: 'column',
        transition: 'background 0.4s ease',
      }}
    >
      {/* Opening quote */}
      <div style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 56, color: '#C4A35A', lineHeight: 0.7,
        marginBottom: 24, opacity: 0.65,
        transition: 'opacity 0.4s ease',
      }} className="group-hover:opacity-100">
        "
      </div>

      {/* Quote */}
      <blockquote style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 17, fontWeight: 300, fontStyle: 'italic',
        lineHeight: 1.7, color: '#E8E2D5',
        marginBottom: 28, flex: 1,
        letterSpacing: '0.01em',
      }}>
        {t.quote}
      </blockquote>

      {/* Divider */}
      <div style={{ width: 28, height: 1, background: 'rgba(196,163,90,0.45)', marginBottom: 20 }} />

      {/* Author */}
      <div>
        <div style={{
          fontSize: 12, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#F5F0E8',
          fontWeight: 500, marginBottom: 5,
        }}>
          {t.name}
        </div>
        <div style={{ fontSize: 11, color: '#6B6355', letterSpacing: '0.06em' }}>
          {t.title}
        </div>
        <div style={{ fontSize: 10, color: '#4A4035', letterSpacing: '0.08em', marginTop: 2 }}>
          {t.location}
        </div>
      </div>
    </motion.div>
  )
}
