'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Briefcase, GraduationCap, Globe, Award, MapPin, Languages, BadgeCheck } from 'lucide-react'

const metrics = [
  { value: '$50M+', label: 'Assets Managed' },
  { value: '90%+', label: 'Client Retention' },
  { value: '10+', label: 'Years Experience' },
  { value: '3', label: 'Languages' },
]

const credentials = [
  { icon: BadgeCheck, text: 'CISI ICWIM Level 3' },
  { icon: BadgeCheck, text: 'Six Sigma Black Belt' },
  { icon: BadgeCheck, text: 'KYC / AML Certified' },
  { icon: GraduationCap, text: 'MBA — SBS Dubai (Pursuing)' },
  { icon: MapPin, text: 'Dubai, UAE' },
  { icon: Languages, text: 'Arabic · English · French (C1)' },
]

const awards = [
  { label: 'FAB Fintech Megathon 2022', style: 'text-gold-400 border-gold-500/25 bg-gold-500/8' },
  { label: 'Best Concierge ME 2009',    style: 'text-gray-300 border-white/10 bg-white/4' },
  { label: 'CISI ICWIM L3',            style: 'text-blue-400 border-blue-500/20 bg-blue-500/8' },
  { label: 'Six Sigma BB',             style: 'text-teal-400 border-teal-500/20 bg-teal-500/8' },
]

const pillars = [
  {
    icon: Briefcase,
    title: 'Client-First Always',
    desc: 'Every recommendation starts with what\'s right for the client — not the product, not the quota.',
  },
  {
    icon: Globe,
    title: 'Cross-Cultural Intelligence',
    desc: 'At home across Dubai, Doha, Kuwait, Riyadh, and Casablanca — fluent in three languages, trusted across cultures.',
  },
  {
    icon: Award,
    title: 'Performance-Driven',
    desc: 'FAB Fintech Megathon winner. Top 3 Hotelier Middle East. Consistent top-quartile producer across every role.',
  },
]

function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = canvas.offsetWidth
    let h = canvas.offsetHeight
    canvas.width = w
    canvas.height = h

    const COUNT = 55
    type Particle = {
      x: number; y: number; r: number
      opacity: number; speed: number
      drift: number; pulse: number; phase: number
    }

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.35 + 0.08,
      speed: Math.random() * 0.25 + 0.05,
      drift: (Math.random() - 0.5) * 0.15,
      pulse: Math.random() * 0.008 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      t += 1

      for (const p of particles) {
        const o = p.opacity * (0.7 + 0.3 * Math.sin(t * p.pulse + p.phase))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,169,110,${o})`
        ctx.fill()

        p.y -= p.speed
        p.x += p.drift
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w }
        if (p.x < -4) p.x = w + 4
        if (p.x > w + 4) p.x = -4
      }
      animId = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.9 }}
    />
  )
}

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" ref={ref} className="py-36 bg-navy-800 dark:bg-navy-800 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 right-1/3 w-[700px] h-[500px] rounded-full bg-gold-500/4 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-500/4 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-20 xl:gap-28 items-start">

          {/* ── Left: Profile panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5 lg:sticky lg:top-28"
          >
            {/* Identity + credentials card */}
            <div className="relative rounded-3xl border border-gold-500/20 bg-white dark:bg-[#060d1f] overflow-hidden">

              {/* Gold particle animation */}
              <GoldParticles />

              {/* Multi-stop overlay: deep navy + warm gold tint at bottom */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-navy-900/80 via-navy-900/50 to-[#1a1200]/40" />
              {/* Warm gold cast from below */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gold-500/10 via-transparent to-transparent" />
              {/* Gold shimmer line at card top */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />

              {/* Gold left accent bar */}
              <div className="absolute left-0 top-10 bottom-10 w-[3px] rounded-full bg-gradient-to-b from-gold-300 via-gold-500 to-transparent" />

              <div className="relative z-10 px-8 py-9">
                {/* Avatar + name */}
                <div className="flex items-center gap-4 mb-9">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-900 font-bold text-lg font-display shadow-[0_0_30px_rgba(201,169,110,0.3)]">
                      AA
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-navy-800" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-base leading-tight">Ahmed Allazim</div>
                    <div className="text-gold-400 text-xs tracking-wide mt-1">
                      Senior Relationship Manager · Dubai
                    </div>
                  </div>
                </div>

                {/* 2×2 Metrics grid */}
                <div className="grid grid-cols-2 gap-px bg-white/6 rounded-2xl overflow-hidden mb-9">
                  {metrics.map(({ value, label }) => (
                    <div key={label} className="bg-gray-50 dark:bg-navy-900/70 px-5 py-4 text-center backdrop-blur-sm">
                      <div className="text-white font-display font-bold text-xl tracking-tight">{value}</div>
                      <div className="text-gray-500 text-xs mt-1 leading-tight">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Credential rows */}
                <div className="space-y-3.5">
                  {credentials.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <Icon size={13} className="text-gold-500 shrink-0" />
                      <span className="text-gray-300 text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Award badges */}
            <div className="flex flex-wrap gap-2">
              {awards.map(({ label, style }) => (
                <span key={label} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${style}`}>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Narrative ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="pt-1"
          >
            <div className="section-tag mb-7">About</div>

            <h2 className="font-display text-4xl lg:text-[2.75rem] font-bold text-white mb-7 leading-[1.15] tracking-tight">
              A Decade at the Intersection<br className="hidden lg:block" /> of{' '}
              <span className="gold-text">Wealth &amp; Trust</span>
            </h2>

            {/* Signature quote */}
            <div className="border-l-2 border-gold-500/40 pl-5 mb-10">
              <p className="text-gray-300 text-[0.9375rem] italic leading-relaxed">
                "The best advisory isn't about products — it's about understanding what wealth truly means to each client, and building a relationship that endures beyond any single transaction."
              </p>
            </div>

            {/* Body copy */}
            <div className="space-y-5 text-gray-400 leading-[1.85] text-[0.9375rem] mb-10">
              <p>
                Over a decade growing{' '}
                <span className="text-gold-400 font-medium">HNWI and UHNWI client portfolios</span> across the UAE and MENA — managing assets exceeding{' '}
                <span className="text-gold-400 font-medium">USD 50M</span>, with double-digit year-on-year growth and{' '}
                <span className="text-gold-400 font-medium">90%+ client retention</span> through deeply personalised, advisory-led service.
              </p>
              <p>
                At <span className="text-gold-400 font-medium">First Abu Dhabi Bank</span> and{' '}
                <span className="text-gold-400 font-medium">American Express</span>, I led full-cycle relationship management — from acquisition and onboarding through portfolio development and structured cross-selling across deposits, lending, investments, and premium credit — within strict KYC, AML, and suitability frameworks.
              </p>
              <p>
                Leadership roles at <span className="text-gold-400 font-medium">Aspire Lifestyles</span> and{' '}
                <span className="text-gold-400 font-medium">Quintessentially Dubai</span> — serving Visa Middle East and Ferrari — refined my ability to manage complex, high-expectation relationships and deliver experiences that turn clients into lifelong advocates.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-gold-500/25 via-white/6 to-transparent mb-10" />

            {/* Three pillars */}
            <div className="space-y-6">
              {pillars.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 24 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-9 h-9 rounded-xl border border-gold-500/20 bg-gold-500/8 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-gold-500/45 group-hover:bg-gold-500/12 transition-all duration-200">
                    <Icon size={15} className="text-gold-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold mb-1.5">{title}</div>
                    <div className="text-gray-500 text-sm leading-relaxed">{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
