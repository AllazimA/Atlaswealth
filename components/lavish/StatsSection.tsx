'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface Stat {
  value: number
  suffix: string
  label: string
  description: string
}

const stats: Stat[] = [
  { value: 500,  suffix: '+', label: 'Curated Experiences',  description: 'Meticulously designed for each client' },
  { value: 15,   suffix: '+', label: 'Countries Served',     description: 'Global clientele, local expertise' },
  { value: 98,   suffix: '%', label: 'Client Satisfaction',  description: 'Measured by repeat bookings' },
  { value: 24,   suffix: '/7', label: 'Concierge Availability', description: 'Your wish, at any hour' },
]

function AnimatedNumber({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1600
    const step = duration / value
    const timer = setInterval(() => {
      start += Math.max(1, Math.floor(value / 50))
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, step)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span>
      {display}{suffix}
    </span>
  )
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section
      ref={ref}
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0a04 50%, #0a0a0a 100%)',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gold glow background */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 200,
        background: 'radial-gradient(ellipse, rgba(196,163,90,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{
                textAlign: 'center',
                padding: '40px 24px',
                borderRight: i < stats.length - 1 ? '1px solid rgba(196,163,90,0.12)' : 'none',
              }}
              className="border-r-0 lg:border-r"
            >
              <div
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 'clamp(40px, 5vw, 60px)',
                  fontWeight: 300,
                  color: '#C4A35A',
                  lineHeight: 1,
                  marginBottom: 12,
                }}
              >
                <AnimatedNumber value={stat.value} suffix={stat.suffix} inView={inView} />
              </div>
              <div style={{
                fontSize: 11,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#F5F0E8',
                fontWeight: 500,
                marginBottom: 8,
              }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 12, color: '#6B6355', lineHeight: 1.5 }}>
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
