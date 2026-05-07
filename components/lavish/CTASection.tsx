'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CTASection() {
  const whatsappNumber = '+212661234567'
  const whatsappMsg = encodeURIComponent("Hello, I'd like to make a concierge request with Lavish Morocco.")

  return (
    <section
      style={{
        position: 'relative',
        padding: '140px 0',
        overflow: 'hidden',
        background: '#080808',
      }}
    >
      {/* Background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=1920&q=80&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15,
      }}
        className="lv-kenburns"
      />

      {/* Gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(8,8,8,0.97) 0%, rgba(20,12,0,0.92) 100%)',
      }} />

      {/* Gold glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800, height: 300,
        background: 'radial-gradient(ellipse, rgba(196,163,90,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px', position: 'relative', textAlign: 'center' }} className="px-6 lg:px-12">

        {/* ── Label ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 28 }}
        >
          <div style={{ width: 48, height: 1, background: 'rgba(196,163,90,0.5)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>
            Begin Today
          </span>
          <div style={{ width: 48, height: 1, background: 'rgba(196,163,90,0.5)' }} />
        </motion.div>

        {/* ── Headline ── */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.95, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(40px, 6vw, 80px)',
            fontWeight: 300,
            lineHeight: 1.05,
            color: '#F5F0E8',
            letterSpacing: '0.02em',
            marginBottom: 24,
          }}
        >
          Ready for the<br />
          <em style={{ fontStyle: 'italic', color: '#DFC08A' }}>Extraordinary?</em>
        </motion.h2>

        {/* ── Subtext ── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 15,
            color: '#C8BFA8',
            lineHeight: 1.75,
            maxWidth: 520,
            margin: '0 auto 56px',
          }}
        >
          Your journey to an extraordinary Morocco begins with a single message. Our concierge team responds within the hour.
        </motion.p>

        {/* ── CTA Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center' }}
        >
          {/* Primary CTA */}
          <Link href="/lavish-morocco/contact" className="lv-btn-gold"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              fontSize: 11,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <span>Make a Request</span>
          </Link>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '15px 36px',
              fontSize: 11,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              fontWeight: 500,
              color: '#F5F0E8',
              border: '1px solid rgba(245,240,232,0.2)',
              textDecoration: 'none',
              transition: 'border-color 0.3s ease, color 0.3s ease',
            }}
            className="hover:border-[rgba(196,163,90,0.5)] hover:text-[#C4A35A]"
          >
            {/* WhatsApp icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.7 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </motion.div>

        {/* ── Contact details ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          style={{ marginTop: 56, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32 }}
        >
          {[
            { label: 'Email', value: 'contact@lavishmorocco.com', href: 'mailto:contact@lavishmorocco.com' },
            { label: 'Office', value: 'Agadir, Morocco', href: '#' },
          ].map(({ label, value, href }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#6B6355', marginBottom: 6 }}>
                {label}
              </div>
              <a href={href}
                style={{ fontSize: 13, color: '#C8BFA8', textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.25s' }}
                className="hover:text-[#C4A35A]">
                {value}
              </a>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
