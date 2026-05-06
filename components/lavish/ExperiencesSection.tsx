'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const experiences = [
  {
    id: 1,
    title: 'Desert Caravane Experience',
    label: 'Saharan Escape',
    image: '/lavish/Desert%20caravan%20at%20golden%20hour.png',
    size: 'large',
  },
  {
    id: 2,
    title: 'Agafay Mountains Retreat',
    label: 'Highland Sanctuary',
    image: '/lavish/Agafay%20desert%20Experience.jpg',
    size: 'small',
  },
  {
    id: 3,
    title: 'Private Riad Experience',
    label: 'Imperial Heritage',
    image: '/lavish/Morocco%20Riad.jpg',
    size: 'small',
  },
  {
    id: 4,
    title: 'Coastal Escapes',
    label: 'Atlantic Luxury',
    image: '/lavish/Yacht.jpg',
    size: 'wide',
  },
]

function ExperienceCard({ exp, delay = 0 }: { exp: typeof experiences[0]; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group"
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#111',
        height: '100%',
      }}
    >
      <Link href="/lavish-morocco/experiences" style={{ position: 'absolute', inset: 0, zIndex: 2 }} aria-label={exp.title} />
      {/* Image */}
      <img
        src={exp.image}
        alt={exp.title}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          minHeight: 280,
          display: 'block',
          transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1), filter 0.5s ease',
          filter: 'brightness(0.65)',
        }}
        className="group-hover:scale-[1.06] group-hover:brightness-[0.45]"
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent 40%, rgba(8,8,8,0.85) 100%)',
      }} />

      {/* Hover gold overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(196,163,90,0)',
        transition: 'background 0.5s ease',
        border: '1px solid rgba(196,163,90,0)',
      }}
        className="group-hover:bg-[rgba(196,163,90,0.04)] group-hover:border-[rgba(196,163,90,0.25)]"
      />

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '28px', zIndex: 3,
        transform: 'translateY(0)',
        transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{ fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#C4A35A', marginBottom: 8 }}>
          {exp.label}
        </div>
        <h3 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 'clamp(20px, 2.5vw, 28px)',
          fontWeight: 400,
          color: '#F5F0E8',
          lineHeight: 1.2,
          marginBottom: 0,
        }}>
          {exp.title}
        </h3>

        {/* CTA — reveals on hover */}
        <div style={{
          overflow: 'hidden',
          maxHeight: 0,
          transition: 'max-height 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}
          className="group-hover:max-h-[48px]"
        >
          <Link href="/lavish-morocco/experiences"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 14,
              fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase',
              color: '#C4A35A', textDecoration: 'none',
            }}
          >
            Request This Experience →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function ExperiencesSection() {
  return (
    <section style={{ background: '#080808', padding: '120px 0' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">

        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, gap: 24 }}>
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}
            >
              <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.5)' }} />
              <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>
                Curated Experiences
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 'clamp(32px, 4vw, 52px)',
                fontWeight: 300,
                color: '#F5F0E8',
                lineHeight: 1.1,
                letterSpacing: '0.02em',
              }}
            >
              Beyond the<br />
              <em style={{ fontStyle: 'italic', color: '#DFC08A' }}>Ordinary</em>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link href="/lavish-morocco/experiences" className="lv-btn-gold"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                fontSize: 10,
                letterSpacing: '0.38em',
                textTransform: 'uppercase',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <span>All Experiences</span>
            </Link>
          </motion.div>
        </div>

        {/* ── Magazine grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Large — spans 7 cols, 2 rows */}
          <div className="lg:col-span-7 lg:row-span-2">
            <div style={{ height: '100%', minHeight: 560 }}>
              <ExperienceCard exp={experiences[0]} delay={0} />
            </div>
          </div>
          {/* Small top-right */}
          <div className="lg:col-span-5">
            <div style={{ height: 272 }}>
              <ExperienceCard exp={experiences[1]} delay={0.08} />
            </div>
          </div>
          {/* Small bottom-right */}
          <div className="lg:col-span-5">
            <div style={{ height: 272 }}>
              <ExperienceCard exp={experiences[2]} delay={0.16} />
            </div>
          </div>
          {/* Wide bottom */}
          <div className="lg:col-span-12">
            <div style={{ height: 320 }}>
              <ExperienceCard exp={experiences[3]} delay={0.24} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
