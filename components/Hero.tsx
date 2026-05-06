'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Linkedin, Mail, ChevronDown, Award, Users, TrendingUp, Star } from 'lucide-react'
import Image from 'next/image'

const stats = [
  { value: '10+', label: 'Years Experience', icon: Star },
  { value: '$50M+', label: 'Portfolios Managed', icon: TrendingUp },
  { value: '80%+', label: 'Client Retention', icon: Users },
  { value: '370+', label: 'Corporate Contracts', icon: Award },
]

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number; y: number; size: number; speedX: number; speedY: number; opacity: number
    }> = []

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 169, 110, ${p.opacity})`
        ctx.fill()
      })

      // Draw connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((q) => {
          const dx = p.x - q.x, dy = p.y - q.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(201, 169, 110, ${0.05 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden bg-navy-900 dark:bg-navy-900">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Background gradient orbs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-gold-500 animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl bg-blue-600 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl bg-gradient-radial from-gold-500 to-transparent" />
      </div>

      {/* Hero grid pattern overlay */}
      <div className="absolute inset-0 bg-hero-pattern opacity-30 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="section-tag">
                <MapPin size={12} />
                Dubai, UAE · Available for Opportunities
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-4"
            >
              Ahmed
              <span className="block gold-text">Allazim</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gold-400 font-medium mb-4 tracking-wide"
            >
              Senior Relationship Manager · Wealth Management · AI Innovation
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-400 text-base leading-relaxed mb-8 max-w-xl"
            >
              A decade of growing HNWI &amp; UHNWI portfolios across the UAE. From managing $50M+ in assets at FAB to building AI-powered wealth platforms — I sit at the intersection of{' '}
              <span className="text-gold-400 font-medium">premium finance, deep client relationships, and modern technology</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <a
                href="#contact"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-500 to-gold-300 hover:shadow-gold-lg transition-all duration-300 hover:scale-105"
              >
                <Mail size={16} />
                Get In Touch
              </a>
              <a
                href="#projects"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white glass border border-gold-500/20 hover:border-gold-500/50 transition-all duration-300"
              >
                View My Work
                <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
              </a>
              <a
                href="https://www.linkedin.com/in/ahmedallazim/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-blue-400 glass border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300"
              >
                <Linkedin size={16} />
                LinkedIn
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map(({ value, label, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="glass rounded-xl p-4 text-center border border-gold-500/10 hover:border-gold-500/30 transition-all group cursor-default"
                >
                  <Icon size={16} className="text-gold-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-bold text-white font-display">{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Profile Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full animate-glow" />

              {/* Spinning gradient ring */}
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-gold-500 via-transparent to-gold-300 opacity-30 animate-spin-slow" />

              {/* Profile image container */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden glow-ring">
                <Image
                  src="/images/profile.png"
                  alt="Ahmed Allazim"
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 384px"
                />
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-2.5 border border-gold-500/20"
              >
                <div className="text-xs text-gray-400">CISI Certified</div>
                <div className="text-sm font-bold text-gold-400">ICWIM Level 3</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-2.5 border border-blue-500/20"
              >
                <div className="text-xs text-gray-400">FAB Award</div>
                <div className="text-sm font-bold text-blue-400">Fintech Megathon '22</div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-600 tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-gold-500/30 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-gold-500" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
