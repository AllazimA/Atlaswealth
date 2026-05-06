'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'

const previewCards = [
  {
    title: 'Desert Caravane',
    label: 'Saharan Escape',
    image: '/lavish/Desert%20caravan%20at%20golden%20hour.png',
    href: '/lavish-morocco/experiences',
  },
  {
    title: 'Private Riads',
    label: 'Imperial Heritage',
    image: '/lavish/Riad%20pacio.jpg',
    href: '/lavish-morocco/experiences',
  },
  {
    title: 'Agafay Retreat',
    label: 'Highland Sanctuary',
    image: '/lavish/Agafay%20desert%20Experience.jpg',
    href: '/lavish-morocco/experiences',
  },
]

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 2.8 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
}
const fadeRight = (delay = 0) => ({
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] } },
})

export default function HeroSection() {
  const scrollDown = () => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#080808',
      paddingTop: 80,
    }}>

      {/* ── Ambient gold glow ── */}
      <div style={{
        position: 'absolute', top: '20%', left: '-8%',
        width: 700, height: 700,
        background: 'radial-gradient(ellipse, rgba(196,163,90,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-5%',
        width: 500, height: 500,
        background: 'radial-gradient(ellipse, rgba(196,163,90,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── Vertical side label ── */}
      <div style={{
        position: 'absolute', left: 20, top: '50%',
        transform: 'translateY(-50%) rotate(-90deg)',
        transformOrigin: 'center center',
        fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase',
        color: 'rgba(196,163,90,0.3)', whiteSpace: 'nowrap',
        display: 'none',
      }}
        className="lg:block"
      >
        Lavish Morocco · Est. 2022 · Agadir
      </div>

      {/* ── Main grid ── */}
      <div
        style={{ maxWidth: 1440, margin: '0 auto', width: '100%', padding: '60px 64px 80px' }}
        className="px-6 lg:px-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── LEFT: Content ── */}
          <motion.div variants={stagger} initial="hidden" animate="visible">

            {/* Eyebrow */}
            <motion.div variants={fadeUp}
              style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
              <div style={{ width: 36, height: 1, background: '#C4A35A' }} />
              <span style={{
                fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase',
                color: '#C4A35A', fontWeight: 500,
              }}>
                Est. 2022 · Agadir, Morocco
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                lineHeight: 0.95,
                letterSpacing: '-0.01em',
              }}>
                <span style={{
                  display: 'block',
                  fontSize: 'clamp(52px, 7vw, 96px)',
                  fontWeight: 300,
                  color: '#F5F0E8',
                }}>
                  Beyond the
                </span>
                <em style={{
                  display: 'block',
                  fontSize: 'clamp(62px, 8.5vw, 116px)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  background: 'linear-gradient(135deg, #C4A35A 0%, #F0D890 50%, #C4A35A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                }}>
                  Ordinary
                </em>
              </h1>
            </motion.div>

            {/* Divider */}
            <motion.div variants={fadeUp}
              style={{ width: 48, height: 1, background: 'rgba(196,163,90,0.4)', marginBottom: 24 }} />

            {/* Sub */}
            <motion.p variants={fadeUp} style={{
              fontSize: 'clamp(14px, 1.3vw, 16px)',
              color: '#C8BFA8',
              lineHeight: 1.85,
              maxWidth: 420,
              marginBottom: 40,
            }}>
              Bespoke concierge and lifestyle management for those who demand the finest. Every moment in Morocco, designed entirely around you.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 52 }}>
              <Link href="/lavish-morocco/contact" className="lv-btn-gold"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '14px 32px',
                  fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase',
                  fontWeight: 500, textDecoration: 'none',
                }}
              >
                <span>Begin Your Journey</span>
                <ArrowRight size={12} style={{ position: 'relative', zIndex: 1 }} />
              </Link>

              <Link href="/lavish-morocco/experiences"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px',
                  fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase',
                  fontWeight: 500, color: '#C8BFA8',
                  border: '1px solid rgba(255,255,255,0.12)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease, border-color 0.3s ease',
                }}
                className="hover:text-[#C4A35A] hover:border-[rgba(196,163,90,0.4)]"
              >
                Our Experiences
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp}
              style={{
                display: 'flex', gap: 0,
                borderTop: '1px solid rgba(196,163,90,0.12)',
                paddingTop: 28,
              }}
            >
              {[
                { num: '500+', label: 'Experiences' },
                { num: '15+',  label: 'Countries' },
                { num: '24/7', label: 'Concierge' },
              ].map(({ num, label }, i) => (
                <div key={label} style={{
                  flex: 1,
                  paddingRight: 20,
                  borderRight: i < 2 ? '1px solid rgba(196,163,90,0.12)' : 'none',
                  marginRight: i < 2 ? 20 : 0,
                }}>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 'clamp(24px, 2.5vw, 32px)',
                    fontWeight: 300, color: '#C4A35A', lineHeight: 1,
                    marginBottom: 4,
                  }}>
                    {num}
                  </div>
                  <div style={{
                    fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase',
                    color: '#6B6355',
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Editorial card grid ── */}
          <div className="hidden lg:grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 10,
            height: 'clamp(480px, 70vh, 640px)',
          }}>

            {/* Card 1 — tall left, spans 2 rows */}
            <motion.div
              initial="hidden" animate="visible" variants={fadeRight(3.0)}
              className="group lv-img-zoom"
              style={{
                gridRow: '1 / 3',
                position: 'relative', overflow: 'hidden', cursor: 'pointer',
              }}
            >
              <img
                src={previewCards[0].image}
                alt={previewCards[0].title}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
                  filter: 'brightness(0.75) saturate(0.95)',
                }}
                className="group-hover:scale-[1.06]"
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, transparent 50%, rgba(8,8,8,0.82) 100%)',
              }} />
              {/* Gold border on hover */}
              <div style={{
                position: 'absolute', inset: 0,
                border: '1px solid rgba(196,163,90,0)',
                transition: 'border-color 0.4s ease',
              }} className="group-hover:border-[rgba(196,163,90,0.5)]" />
              <Link href={previewCards[0].href} style={{
                position: 'absolute', bottom: 24, left: 24, right: 24,
                textDecoration: 'none',
              }}>
                <div style={{
                  fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
                  color: '#C4A35A', marginBottom: 6,
                }}>
                  {previewCards[0].label}
                </div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 22, fontWeight: 400, color: '#F5F0E8', lineHeight: 1.15,
                }}>
                  {previewCards[0].title}
                </div>
              </Link>
            </motion.div>

            {/* Card 2 — top right */}
            <motion.div
              initial="hidden" animate="visible" variants={fadeRight(3.15)}
              className="group lv-img-zoom"
              style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
            >
              <img
                src={previewCards[1].image}
                alt={previewCards[1].title}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
                  filter: 'brightness(0.75) saturate(0.95)',
                }}
                className="group-hover:scale-[1.06]"
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, transparent 40%, rgba(8,8,8,0.82) 100%)',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                border: '1px solid rgba(196,163,90,0)',
                transition: 'border-color 0.4s ease',
              }} className="group-hover:border-[rgba(196,163,90,0.5)]" />
              <Link href={previewCards[1].href} style={{
                position: 'absolute', bottom: 18, left: 18,
                textDecoration: 'none',
              }}>
                <div style={{
                  fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase',
                  color: '#C4A35A', marginBottom: 4,
                }}>
                  {previewCards[1].label}
                </div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 18, fontWeight: 400, color: '#F5F0E8',
                }}>
                  {previewCards[1].title}
                </div>
              </Link>
            </motion.div>

            {/* Card 3 — bottom right */}
            <motion.div
              initial="hidden" animate="visible" variants={fadeRight(3.3)}
              className="group lv-img-zoom"
              style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
            >
              <img
                src={previewCards[2].image}
                alt={previewCards[2].title}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1)',
                  filter: 'brightness(0.75) saturate(0.95)',
                }}
                className="group-hover:scale-[1.06]"
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, transparent 40%, rgba(8,8,8,0.82) 100%)',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                border: '1px solid rgba(196,163,90,0)',
                transition: 'border-color 0.4s ease',
              }} className="group-hover:border-[rgba(196,163,90,0.5)]" />
              <Link href={previewCards[2].href} style={{
                position: 'absolute', bottom: 18, left: 18,
                textDecoration: 'none',
              }}>
                <div style={{
                  fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase',
                  color: '#C4A35A', marginBottom: 4,
                }}>
                  {previewCards[2].label}
                </div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 18, fontWeight: 400, color: '#F5F0E8',
                }}>
                  {previewCards[2].title}
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Mobile: single full-width image */}
          <motion.div
            className="lg:hidden lv-img-zoom"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 3.0 }}
            style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}
          >
            <img
              src="/lavish/Desert%20caravan%20at%20golden%20hour.png"
              alt="Desert Caravane Experience"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.75)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(8,8,8,0.75) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C4A35A', marginBottom: 4 }}>Saharan Escape</div>
              <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 20, color: '#F5F0E8' }}>Desert Caravane Experience</div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.button
        onClick={scrollDown}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 4.2, duration: 0.8 }}
        style={{
          position: 'absolute', bottom: 28, left: '50%',
          transform: 'translateX(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: 'rgba(245,240,232,0.35)',
        }}
        aria-label="Scroll down"
      >
        <span style={{ fontSize: 8, letterSpacing: '0.5em', textTransform: 'uppercase' }}>Scroll</span>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

    </section>
  )
}
