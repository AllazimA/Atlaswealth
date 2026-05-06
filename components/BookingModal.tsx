'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Clock, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

interface Service {
  id: string
  title: string
  priceDisplay: string
  price: number
  duration: string
  currency: string
  icon: string
  badge: string
}

interface BookingModalProps {
  service: Service
  onClose: () => void
}

type Step = 'details' | 'payment' | 'processing'

export default function BookingModal({ service, onClose }: BookingModalProps) {
  const [step, setStep] = useState<Step>('details')
  const [form, setForm] = useState({ name: '', email: '', note: '' })
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | null>(null)

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setStep('payment')
  }

  const handleStripeCheckout = async () => {
    setStep('processing')
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.title,
          price: service.price,
          currency: service.currency,
          customerName: form.name,
          customerEmail: form.email,
          bookingNote: form.note,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Could not create checkout session')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
      setStep('payment')
    }
  }

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600
    bg-white/5 border border-white/10 transition-all duration-200
    focus:border-gold-500/50 focus:bg-white/8 outline-none`

  const paypalAmount = (service.price / 100).toFixed(2)

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-md bg-navy-800 rounded-3xl border border-gold-500/20 shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{service.icon}</span>
                <div>
                  <h3 className="text-white font-display font-bold text-lg leading-tight">
                    {service.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gold-400 font-bold text-xl">{service.priceDisplay}</span>
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock size={11} />
                      {service.duration}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2 mt-4">
              {['details', 'payment'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step === s ? 'bg-gold-400 w-6' :
                    (step === 'payment' || step === 'processing') && s === 'details' ? 'bg-gold-500/50' :
                    'bg-white/15'
                  }`} />
                </div>
              ))}
              <span className="text-gray-500 text-xs ml-1">
                {step === 'details' ? 'Step 1 of 2 — Your details' :
                 step === 'payment' ? 'Step 2 of 2 — Payment' :
                 'Processing...'}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* STEP 1: Details */}
            {step === 'details' && (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleDetailsSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Full Name *</label>
                  <input
                    type="text" required placeholder="Your full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Email Address *</label>
                  <input
                    type="email" required placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">What would you like to discuss? <span className="text-gray-600">(optional)</span></label>
                  <textarea
                    rows={3}
                    placeholder="Brief overview of your goals or questions..."
                    value={form.note}
                    onChange={e => setForm({ ...form, note: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-500 to-gold-300 hover:shadow-gold transition-all hover:scale-[1.02]"
                >
                  Continue to Payment →
                </button>
              </motion.form>
            )}

            {/* STEP 2: Payment */}
            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Order summary */}
                <div className="bg-white/3 rounded-xl p-4 border border-white/8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Booking for</span>
                    <span className="text-white font-medium">{form.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-400">Service</span>
                    <span className="text-white font-medium">{service.title}</span>
                  </div>
                  <div className="border-t border-white/8 mt-3 pt-3 flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total due today</span>
                    <span className="text-gold-400 font-bold text-lg">{service.priceDisplay}</span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                {/* Stripe button */}
                <button
                  onClick={handleStripeCheckout}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-[#635BFF]/40 bg-[#635BFF]/10 hover:bg-[#635BFF]/20 transition-all group"
                >
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5 11.5C14.5 10.4 15.3 9.8 16.5 9.8C18.1 9.8 19.8 10.4 21 11.2V7.2C19.7 6.5 18.1 6 16.4 6C12.4 6 9.8 8.1 9.8 11.6C9.8 17.2 17.2 16.3 17.2 18.9C17.2 20.1 16.2 20.7 14.9 20.7C13.1 20.7 11.3 19.9 10 18.9V23C11.4 23.8 13.1 24.3 14.9 24.3C19 24.3 21.8 22.3 21.8 18.7C21.8 12.7 14.5 13.8 14.5 11.5Z" fill="#635BFF"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-white text-sm font-semibold">Pay with Card</div>
                    <div className="text-gray-500 text-xs">Visa, Mastercard, Amex — via Stripe</div>
                  </div>
                  <div className="ml-auto text-gold-400 font-bold text-sm">{service.priceDisplay}</div>
                </button>

                {/* PayPal */}
                <div className="relative">
                  <div className="text-center text-xs text-gray-600 mb-3">— or pay with —</div>
                  <PayPalScriptProvider options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
                    currency: 'USD',
                  }}>
                    <PayPalButtons
                      style={{ layout: 'horizontal', color: 'gold', shape: 'rect', label: 'paypal', height: 44 }}
                      createOrder={(_data, actions) => {
                        return actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [{
                            amount: { currency_code: 'USD', value: paypalAmount },
                            description: `${service.title} — Consultation with Ahmed Allazim`,
                          }],
                        })
                      }}
                      onApprove={async (_data, actions) => {
                        if (actions.order) {
                          await actions.order.capture()
                          window.location.href = `/booking/success?method=paypal&serviceId=${encodeURIComponent(service.id)}&service=${encodeURIComponent(service.title)}&name=${encodeURIComponent(form.name)}`
                        }
                      }}
                      onError={() => setError('PayPal payment failed. Please try card payment instead.')}
                    />
                  </PayPalScriptProvider>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Shield size={11} className="text-green-500" />
                    256-bit SSL encrypted
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle size={11} className="text-green-500" />
                    Secure payment
                  </div>
                </div>

                <button
                  onClick={() => setStep('details')}
                  className="w-full text-xs text-gray-500 hover:text-gray-400 transition-colors pt-1"
                >
                  ← Back to details
                </button>
              </motion.div>
            )}

            {/* STEP 3: Processing */}
            {step === 'processing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-8 gap-4"
              >
                <Loader2 size={40} className="text-gold-400 animate-spin" />
                <div className="text-white font-semibold">Redirecting to secure checkout...</div>
                <div className="text-gray-500 text-sm">Please wait, do not close this window.</div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
