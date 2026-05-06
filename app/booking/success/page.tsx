'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, Mail, ArrowLeft, Linkedin, Video } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { siteConfig } from '@/data/config'

function SuccessContent() {
  const params = useSearchParams()
  const service = params.get('service') || 'Consultation'
  const serviceId = params.get('serviceId') || ''
  const name = params.get('name') || ''

  const calendlyUrl =
    siteConfig.calendlyEvents[serviceId as keyof typeof siteConfig.calendlyEvents]
    ?? siteConfig.calendlyUrl

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/8 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative max-w-md w-full text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle size={48} className="text-green-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-4xl font-bold text-white mb-3"
        >
          Payment Confirmed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-base leading-relaxed mb-6"
        >
          {name ? `Thank you, ${name}!` : 'Thank you!'} Your payment for{' '}
          <span className="text-gold-400 font-medium">{service}</span> has been received.
        </motion.p>

        {/* Schedule CTA — primary action */}
        <motion.a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-500 to-gold-300 hover:shadow-gold transition-all hover:scale-[1.02] mb-2"
        >
          <Calendar size={16} />
          Schedule Your Session Now
          <Video size={14} className="opacity-70" />
        </motion.a>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-xs text-gray-500 text-center mb-8"
        >
          Pick your preferred time — a video call link will be sent upon booking
        </motion.p>

        {/* What's next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/3 rounded-2xl border border-white/8 p-6 mb-8 text-left space-y-4"
        >
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">What Happens Next</h3>
          {[
            { icon: Mail, color: 'text-gold-400', text: "You'll receive a payment confirmation email within 5 minutes." },
            { icon: Calendar, color: 'text-blue-400', text: 'Use the button above to pick your session time — a video call link is included automatically.' },
            { icon: Linkedin, color: 'text-blue-500', text: 'Feel free to connect on LinkedIn in the meantime.' },
          ].map(({ icon: Icon, color, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <Icon size={16} className={`${color} mt-0.5 shrink-0`} />
              <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </motion.div>

        {/* AA branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-300 flex items-center justify-center text-navy-900 font-bold text-sm">
            AA
          </div>
          <div className="text-left">
            <div className="text-white font-semibold text-sm">Ahmed Allazim</div>
            <div className="text-gold-400 text-xs">Senior Relationship Manager</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:border-white/25 transition-all"
          >
            <ArrowLeft size={14} />
            Back to Portfolio
          </Link>
          <a
            href="https://www.linkedin.com/in/ahmedallazim/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:border-white/25 transition-all"
          >
            <Linkedin size={14} />
            Connect on LinkedIn
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
