'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, MapPin, Linkedin, Send, CheckCircle, AlertCircle, CalendarCheck, Video } from 'lucide-react'
import dynamic from 'next/dynamic'
import { siteConfig } from '@/data/config'

const CalendlyModal = dynamic(() => import('./CalendlyModal'), { ssr: false })

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

const contactInfo = [
  { icon: Mail,     label: 'Email',    value: 'a.allazim@hotmail.com',        href: 'mailto:a.allazim@hotmail.com' },
  { icon: MapPin,   label: 'Location', value: 'Dubai, UAE',                   href: '#' },
  { icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/ahmedallazim', href: siteConfig.linkedin },
]

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [showCalendly, setShowCalendly] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/portfolio-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed')
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 6000)
    }
  }

  const inputClass = `w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-gray-600
    bg-white/3 border border-white/8 transition-all duration-200
    focus:border-gold-500/50 focus:bg-white/5 focus:shadow-[0_0_0_3px_rgba(201,169,110,0.1)]
    outline-none`

  return (
    <section id="contact" ref={ref} className="py-28 bg-navy-800 dark:bg-navy-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/4 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="section-tag mx-auto mb-6">Get In Touch</div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            Let's <span className="gold-text">Connect</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Whether you're looking for wealth management advice, consulting, or simply want to connect — I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map(({ icon: Icon, label, value, href }, i) => (
              <motion.a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4 p-5 glass rounded-2xl border border-white/5 hover:border-gold-500/25 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-gold-500/15 flex items-center justify-center border border-gold-500/20 group-hover:bg-gold-500/25 transition-colors">
                  <Icon size={18} className="text-gold-500" />
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">{label}</div>
                  <div className="text-white text-sm font-medium group-hover:text-gold-400 transition-colors">{value}</div>
                </div>
              </motion.a>
            ))}

            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7 }}
              className="glass rounded-2xl p-5 border border-green-500/20 bg-green-500/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm font-semibold">Open to Opportunities</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Available for senior Relationship Manager roles in banking and wealth management, as well as operations roles in lifestyle management. Also open to consulting engagements and strategic partnerships across the UAE and MENA region.
              </p>
            </motion.div>

            {/* Book a Session CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.85 }}
              className="glass rounded-2xl p-5 border border-gold-500/20 bg-gold-500/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <CalendarCheck size={15} className="text-gold-400" />
                <span className="text-gold-400 text-sm font-semibold">Let's connect</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                Open for general discussion, consulting, or job opportunities — pick a time and I'll send a video call link.
              </p>
              <button
                onClick={() => setShowCalendly(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-500 to-gold-300 hover:shadow-gold transition-all hover:scale-[1.02]"
              >
                <Video size={14} />
                Schedule a Free Call
              </button>
              <p className="text-center text-xs text-gray-600 mt-2 leading-snug">
                Select your time — video link sent automatically
              </p>
            </motion.div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-white/5">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Smith"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-2 block">Subject</label>
                <input
                  type="text"
                  placeholder="How can I help you?"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="mb-6">
                <label className="text-xs text-gray-500 mb-2 block">Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell me about your needs or inquiry..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending' || status === 'success'}
                className="w-full flex items-center justify-center gap-2 py-4 px-8 rounded-xl text-sm font-semibold
                  text-navy-900 bg-gradient-to-r from-gold-500 to-gold-300
                  hover:shadow-gold transition-all duration-300 hover:scale-[1.02]
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
              >
                {status === 'sending' ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-navy-900/30 border-t-navy-900 animate-spin" />
                    Sending...
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle size={16} />
                    Message Sent!
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 text-sm text-green-400 bg-green-500/10 rounded-xl p-3 border border-green-500/20"
                >
                  <CheckCircle size={15} />
                  Thank you! I'll get back to you within 24 hours.
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-xl p-3 border border-red-500/20"
                >
                  <AlertCircle size={15} />
                  Something went wrong. Please email directly at a.allazim@hotmail.com
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>

      {/* Calendly Modal */}
      {showCalendly && (
        <CalendlyModal
          url={siteConfig.calendlyUrl}
          serviceName="Schedule a Free Call"
          onClose={() => setShowCalendly(false)}
        />
      )}
    </section>
  )
}
