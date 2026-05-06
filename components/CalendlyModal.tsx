'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Video, Clock, CalendarCheck, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface CalendlyModalProps {
  url: string
  serviceName: string
  duration?: string
  onClose: () => void
}

const PURPOSE_OPTIONS = [
  'General Discussion',
  'Job Opportunity',
  'Career Discussion',
  'Wealth Management Advisory',
  'Partnership Opportunity',
  'Consulting Inquiry',
  'Networking Call',
  'Other',
]

export default function CalendlyModal({ url, duration, onClose }: CalendlyModalProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [purpose, setPurpose] = useState('')
  const [customPurpose, setCustomPurpose] = useState('')
  const [step, setStep] = useState<'purpose' | 'calendar'>('purpose')

  useEffect(() => setMounted(true), [])

  const isDark = !mounted || theme === 'dark'

  const selectedPurpose = purpose === 'Other' ? customPurpose : purpose
  const meetingTitle = selectedPurpose || 'Introductory Call'

  const embedUrl = `${url}?embed=true&theme=${isDark ? 'dark' : 'light'}&notes=${encodeURIComponent(`Purpose: ${meetingTitle}`)}`

  const canContinue = purpose !== '' && (purpose !== 'Other' || customPurpose.trim() !== '')

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600
    bg-white/5 border border-white/10 transition-all duration-200
    focus:border-gold-500/50 outline-none`

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 pointer-events-none"
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ height: step === 'purpose' ? 'auto' : 'min(94vh, 860px)' }}
          className={`pointer-events-auto w-full max-w-2xl flex flex-col rounded-3xl border border-gold-500/20 shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden ${
            isDark ? 'bg-navy-800' : 'bg-[#f5f3ef]'
          }`}
        >
          {/* Header */}
          <div className={`flex-shrink-0 px-6 pt-6 pb-4 border-b ${isDark ? 'border-white/5' : 'border-black/8'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-300 flex items-center justify-center text-navy-900 font-bold text-sm">
                  AA
                </div>
                <div>
                  <h3 className={`font-display font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-navy-900'}`}>
                    Schedule a Free Call
                  </h3>
                  <p className="text-gold-400 text-xs font-medium mt-0.5">Ahmed Allazim · Senior Relationship Manager</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`transition-colors p-1.5 rounded-lg ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-navy-900 hover:bg-black/5'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
              {[
                { icon: CalendarCheck, text: 'Select your preferred time' },
                { icon: Video, text: 'Video call included' },
                ...(duration ? [{ icon: Clock, text: duration }] : []),
              ].map(({ icon: Icon, text }) => (
                <span key={text} className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Icon size={12} className="text-gold-500 flex-shrink-0" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* STEP 1 — Purpose selection */}
          {step === 'purpose' && (
            <div className="p-6 space-y-4">
              <div>
                <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Purpose of Meeting <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>(optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={purpose}
                    onChange={e => { setPurpose(e.target.value); setCustomPurpose('') }}
                    className={`${inputClass} appearance-none pr-10 cursor-pointer ${isDark ? 'bg-white/5 text-white' : 'bg-black/5 text-navy-900'} ${!purpose ? (isDark ? 'text-gray-500' : 'text-gray-400') : ''}`}
                  >
                    <option value="" disabled>Select a purpose…</option>
                    {PURPOSE_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="bg-navy-900 text-white">{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {purpose === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className={`text-xs font-medium mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Please specify
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of your topic…"
                    value={customPurpose}
                    onChange={e => setCustomPurpose(e.target.value)}
                    className={inputClass}
                    autoFocus
                  />
                </motion.div>
              )}

              {/* Meeting title preview */}
              {(purpose && purpose !== 'Other') || (purpose === 'Other' && customPurpose) ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-xl px-4 py-3 border text-xs ${isDark ? 'bg-gold-500/5 border-gold-500/15 text-gray-400' : 'bg-gold-500/5 border-gold-500/20 text-gray-600'}`}
                >
                  Meeting title will be: <span className="text-gold-400 font-semibold">{meetingTitle}</span>
                </motion.div>
              ) : null}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep('calendar')}
                  disabled={!canContinue && purpose !== ''}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-500 to-gold-300 hover:shadow-gold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                >
                  {purpose ? 'Continue →' : 'Skip & Continue →'}
                </button>
              </div>

              <p className={`text-center text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                A video call link will be sent automatically upon booking. No payment required.
              </p>
            </div>
          )}

          {/* STEP 2 — Cal.com embed */}
          {step === 'calendar' && (
            <div className="flex-1 min-h-0" style={{ minHeight: '600px' }}>
              <iframe
                src={embedUrl}
                style={{ width: '100%', height: '100%' }}
                frameBorder="0"
                title="Schedule a Free Call with Ahmed Allazim"
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
