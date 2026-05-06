'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.85, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function AboutSection() {
  return (
    <section
      style={{ background: '#0a0a0a', padding: '120px 0', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── Left: Image ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            style={{ position: 'relative' }}
          >
            {/* Main image */}
            <div
              className="lv-img-zoom"
              style={{
                position: 'relative',
                aspectRatio: '3/4',
                overflow: 'hidden',
              }}
            >
              <img
                src="/lavish/agadir.jpg"
                alt="Agadir beach and marina aerial view"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Gold frame overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                border: '1px solid rgba(196,163,90,0.25)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                bottom: -24,
                right: -24,
                background: '#C4A35A',
                padding: '24px 28px',
                minWidth: 140,
              }}
            >
              <div
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 42,
                  fontWeight: 300,
                  color: '#080808',
                  lineHeight: 1,
                }}
              >
                500+
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4A3010', marginTop: 4 }}>
                Experiences Curated
              </div>
            </motion.div>

            {/* Gold corner accent */}
            <div style={{
              position: 'absolute', top: -12, left: -12,
              width: 48, height: 48,
              borderTop: '2px solid rgba(196,163,90,0.5)',
              borderLeft: '2px solid rgba(196,163,90,0.5)',
              pointerEvents: 'none',
            }} />
          </motion.div>

          {/* ── Right: Content ── */}
          <div>
            {/* Label */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={0}
              style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}
            >
              <div style={{ width: 40, height: 1, background: '#C4A35A' }} />
              <span style={{ fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>
                Our Philosophy
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={1}
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 'clamp(36px, 4.5vw, 58px)',
                fontWeight: 300,
                lineHeight: 1.1,
                color: '#F5F0E8',
                marginBottom: 28,
                letterSpacing: '0.02em',
              }}
            >
              The Art of<br />
              <em style={{ fontStyle: 'italic', color: '#DFC08A' }}>Exceptional Living</em>
            </motion.h2>

            {/* Body */}
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={2}
              style={{ fontSize: 15, lineHeight: 1.85, color: '#C8BFA8', marginBottom: 20 }}
            >
              Born in the golden warmth of Agadir in 2022, Lavish Morocco was founded with a singular mission: to deliver a level of service so refined, so anticipatory, that our guests never need to ask twice.
            </motion.p>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={3}
              style={{ fontSize: 15, lineHeight: 1.85, color: '#C8BFA8', marginBottom: 40 }}
            >
              We are not a travel agency. We are your personal gateway to a Morocco that most visitors never see — a world of private palaces, clandestine desert camps, and encounters that exist only for those who know where to look.
            </motion.p>

            {/* Divider */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={4}
              style={{ width: 48, height: 1, background: 'rgba(196,163,90,0.5)', marginBottom: 40 }}
            />

            {/* Mini stats */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={5}
              className="grid grid-cols-3 gap-6"
              style={{ marginBottom: 44 }}
            >
              {[
                { num: '500+', label: 'Experiences' },
                { num: '15+', label: 'Countries Served' },
                { num: '24/7', label: 'Concierge' },
              ].map(({ num, label }) => (
                <div key={label}>
                  <div
                    style={{
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                      fontSize: 34,
                      fontWeight: 300,
                      color: '#C4A35A',
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {num}
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#6B6355' }}>
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={6}
            >
              <Link href="/lavish-morocco/about" className="lv-btn-gold"
                style={{
                  display: 'inline-block',
                  padding: '13px 32px',
                  fontSize: 10,
                  letterSpacing: '0.42em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                <span>Our Story</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
