'use client'

import { motion } from 'framer-motion'

interface PageHeroProps {
  label: string
  title: string
  titleItalic?: string
  subtitle?: string
  image: string
  height?: string
}

export default function PageHero({
  label,
  title,
  titleItalic,
  subtitle,
  image,
  height = '60vh',
}: PageHeroProps) {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height,
        minHeight: 480,
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="lv-kenburns"
      />

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(8,8,8,0.4) 0%, rgba(8,8,8,0.7) 100%)',
      }} />

      {/* Content */}
      <div
        style={{ position: 'relative', zIndex: 10, maxWidth: 1440, margin: '0 auto', padding: '0 48px 72px', width: '100%' }}
        className="px-6 lg:px-12"
      >
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}
        >
          <div style={{ width: 32, height: 1, background: 'rgba(196,163,90,0.7)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>
            {label}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(40px, 6vw, 80px)',
            fontWeight: 300,
            lineHeight: 1.05,
            color: '#F5F0E8',
            letterSpacing: '0.02em',
            maxWidth: 700,
          }}
        >
          {title}
          {titleItalic && (
            <><br /><em style={{ fontStyle: 'italic', color: '#DFC08A' }}>{titleItalic}</em></>
          )}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: 20,
              fontSize: 14,
              color: '#C8BFA8',
              lineHeight: 1.7,
              maxWidth: 500,
              letterSpacing: '0.04em',
            }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  )
}
