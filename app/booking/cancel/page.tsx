'use client'

import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function BookingCancelPage() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-orange-500/10 border border-orange-500/25 flex items-center justify-center mx-auto mb-8"
        >
          <XCircle size={48} className="text-orange-400" />
        </motion.div>

        <h1 className="font-display text-4xl font-bold text-white mb-3">Payment Cancelled</h1>
        <p className="text-gray-400 text-base leading-relaxed mb-8">
          No worries — your booking was not charged. You can go back and try again whenever you're ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/#services"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:border-white/25 transition-all"
          >
            <ArrowLeft size={14} />
            Back to Services
          </Link>
          <Link
            href="/#services"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-500 to-gold-300 hover:shadow-gold transition-all"
          >
            <RefreshCw size={14} />
            Try Again
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
