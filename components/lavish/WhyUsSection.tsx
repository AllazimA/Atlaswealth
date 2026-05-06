'use client'

import { motion } from 'framer-motion'

const pillars = [
  {
    number: '01',
    title: 'Anticipatory Service',
    body: 'We anticipate needs before they arise. Our team studies your preferences, history, and desires to craft experiences that feel entirely effortless.',
  },
  {
    number: '02',
    title: 'Elite Local Network',
    body: 'Two decades of relationships with Morocco\'s finest — palace owners, master chefs, private pilots, and cultural custodians who open doors no others can.',
  },
  {
    number: '03',
    title: '24/7 Dedicated Manager',
    body: 'One person. Your person. A dedicated lifestyle manager available at all hours who knows your name, your preferences, and never hands you off.',
  },
  {
    number: '04',
    title: 'Absolute Discretion',
    body: 'Privacy is not a feature — it is our foundation. Our clients trust us with their most intimate journeys. That trust is sacred and unwavering.',
  },
]

export default function WhyUsSection() {
  return (
    <section
      style={{
        background: '#0f0f0f',
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C4A35A' fill-opacity='0.02'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px', position: 'relative' }} className="px-6 lg:px-12">

        {/* ── Header ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end" style={{ marginBottom: 72 }}>
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7 }}
              style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}
            >
              <div style={{ width: 40, height: 1, background: '#C4A35A' }} />
              <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>
                Why Lavish Morocco
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 'clamp(32px, 4vw, 54px)',
                fontWeight: 300,
                color: '#F5F0E8',
                lineHeight: 1.1,
                letterSpacing: '0.02em',
              }}
            >
              The Standard<br />
              <em style={{ fontStyle: 'italic', color: '#DFC08A' }}>Others Aspire To</em>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.8, maxWidth: 480 }}
          >
            In a world full of travel companies, Lavish Morocco stands apart — not through words, but through an unwavering standard of excellence that our clients have come to depend on.
          </motion.p>
        </div>

        {/* ── Pillars grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0"
          style={{ borderTop: '1px solid rgba(196,163,90,0.12)', borderLeft: '1px solid rgba(196,163,90,0.12)' }}
        >
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.75, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group"
              style={{
                padding: '48px 36px',
                borderRight: '1px solid rgba(196,163,90,0.12)',
                borderBottom: '1px solid rgba(196,163,90,0.12)',
                transition: 'background 0.4s ease',
              }}
            >
              <div
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 48,
                  fontWeight: 300,
                  color: 'rgba(196,163,90,0.18)',
                  lineHeight: 1,
                  marginBottom: 28,
                  transition: 'color 0.4s ease',
                }}
                className="group-hover:text-[rgba(196,163,90,0.35)]"
              >
                {pillar.number}
              </div>
              <div style={{
                width: 24, height: 1,
                background: '#C4A35A',
                marginBottom: 20,
                transition: 'width 0.4s ease',
              }}
                className="group-hover:w-10"
              />
              <h3 style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 22,
                fontWeight: 400,
                color: '#F5F0E8',
                marginBottom: 16,
                lineHeight: 1.2,
              }}>
                {pillar.title}
              </h3>
              <p style={{ fontSize: 13, color: '#6B6355', lineHeight: 1.75, transition: 'color 0.4s ease' }}
                className="group-hover:text-[#C8BFA8]"
              >
                {pillar.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
