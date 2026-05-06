'use client'

import { motion } from 'framer-motion'

const partners = [
  { name: 'Sofitel', sub: 'Agadir Royal Bay Resort' },
  { name: 'Fairmont', sub: 'Taghazout Bay' },
  { name: 'Hyatt Place', sub: 'Taghazout Bay' },
  { name: 'Riu Palace', sub: 'Tikida Agadir' },
  { name: 'Mazagan', sub: 'Beach & Golf Resort' },
]

const trustStats = [
  { value: '10+', label: 'Years in Luxury Hospitality' },
  { value: '500+', label: 'Bespoke Experiences Delivered' },
  { value: '15', label: 'Countries & Nationalities Served' },
  { value: '100%', label: 'Word-of-Mouth Growth' },
]

export default function TrustedPartners() {
  return (
    <>
      {/* ── Trust Stats Strip ── */}
      <section style={{ background: '#080808', borderTop: '1px solid rgba(196,163,90,0.1)', borderBottom: '1px solid rgba(196,163,90,0.1)', padding: '48px 0' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 'clamp(32px, 3.5vw, 48px)',
                  fontWeight: 300, color: '#C4A35A', lineHeight: 1,
                  marginBottom: 8,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                  color: '#6B6355', lineHeight: 1.5,
                }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preferred Partners ── */}
      <section style={{ background: '#0a0a0a', padding: '80px 0' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}
            >
              <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.4)' }} />
              <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>
                Preferred Partners
              </span>
              <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.4)' }} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 'clamp(26px, 3vw, 42px)',
                fontWeight: 300, color: '#F5F0E8',
                letterSpacing: '0.02em', marginBottom: 14,
              }}
            >
              Our Trusted Network
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.75, delay: 0.2 }}
              style={{ fontSize: 13, color: '#6B6355', letterSpacing: '0.04em', maxWidth: 480, margin: '0 auto' }}
            >
              We collaborate with leading luxury hotels and experience providers to deliver an uncompromising standard of service.
            </motion.p>
          </div>

          {/* Partner cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px" style={{ background: 'rgba(196,163,90,0.07)' }}>
            {partners.map((p, i) => (
              <motion.div
                key={`${p.name}-${p.sub}`}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="group"
                style={{
                  background: '#0c0c0c',
                  padding: '36px 24px',
                  textAlign: 'center',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.35s ease',
                  cursor: 'default',
                }}
              >
                {/* Brand name as elegant typography */}
                <div style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 18, fontWeight: 400,
                  color: '#C4A35A',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  transition: 'color 0.35s ease',
                }} className="group-hover:text-[#DFC08A]">
                  {p.name}
                </div>
                <div style={{
                  fontSize: 9, letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#6B6355',
                  lineHeight: 1.4,
                  transition: 'color 0.35s ease',
                }} className="group-hover:text-[#C8BFA8]">
                  {p.sub}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Credibility note */}
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{
              marginTop: 28,
              textAlign: 'center',
              fontSize: 10, letterSpacing: '0.12em',
              color: '#3A3530', lineHeight: 1.7,
            }}
          >
            Properties listed represent our curated network of preferred accommodations and experience partners.
          </motion.p>
        </div>
      </section>

      {/* ── Credibility strip ── */}
      <section style={{ background: '#080808', padding: '40px 0', borderTop: '1px solid rgba(196,163,90,0.08)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {[
              { icon: '✦', text: 'Discreet & Personalised Service' },
              { icon: '✦', text: 'Global Concierge Network' },
              { icon: '✦', text: '10+ Years in Luxury Hospitality' },
              { icon: '✦', text: 'UHNW Client Specialists' },
            ].map(({ icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <span style={{ color: '#C4A35A', fontSize: 8 }}>{icon}</span>
                <span style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#6B6355' }}>
                  {text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
