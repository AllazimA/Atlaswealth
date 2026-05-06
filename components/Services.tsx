'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { services } from '@/data/services'
import { Check, ArrowRight, Clock, Lock, Bell, CalendarCheck, TrendingUp, Target, Landmark, Compass, type LucideIcon } from 'lucide-react'

const serviceIconMap: Record<string, LucideIcon> = { TrendingUp, Target, Landmark, Compass }
import dynamic from 'next/dynamic'
import { siteConfig } from '@/data/config'

const BookingModal  = dynamic(() => import('./BookingModal'),  { ssr: false })
const CalendlyModal = dynamic(() => import('./CalendlyModal'), { ssr: false })

const colorClasses: Record<string, { card: string; badge: string; cta: string; check: string; price: string }> = {
  gold: {
    card: 'hover:border-gold-500/40 hover:bg-gold-500/5',
    badge: 'bg-gold-500/15 text-gold-400 border-gold-500/25',
    cta: 'bg-gradient-to-r from-gold-500 to-gold-300 text-navy-900 hover:shadow-gold',
    check: 'text-gold-500',
    price: 'text-gold-400',
  },
  blue: {
    card: 'hover:border-blue-500/40 hover:bg-blue-500/5',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    cta: 'bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:shadow-lg',
    check: 'text-blue-400',
    price: 'text-blue-400',
  },
  teal: {
    card: 'hover:border-teal-500/40 hover:bg-teal-500/5',
    badge: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
    cta: 'bg-gradient-to-r from-teal-600 to-teal-400 text-white hover:shadow-lg',
    check: 'text-teal-400',
    price: 'text-teal-400',
  },
  purple: {
    card: 'hover:border-purple-500/40 hover:bg-purple-500/5',
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    cta: 'bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:shadow-lg',
    check: 'text-purple-400',
    price: 'text-purple-400',
  },
}

function ComingSoonCard({ service, delay, inView }: {
  service: typeof services[0]
  delay: number
  inView: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const [joined, setJoined] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group flex flex-col"
    >
      {/* Hover glow ring */}
      <motion.div
        animate={hovered ? { opacity: 1, scale: 1.01 } : { opacity: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute -inset-px rounded-2xl bg-gradient-to-br from-teal-500/20 via-transparent to-teal-400/10 pointer-events-none z-0"
      />

      {/* Card */}
      <div className="relative z-10 glass rounded-2xl p-7 border border-white/5 hover:border-teal-500/30 transition-all duration-300 flex flex-col opacity-85 hover:opacity-100 h-full">

        {/* Launching soon tooltip */}
        <motion.div
          animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-9 left-1/2 -translate-x-1/2 bg-teal-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none flex items-center gap-1.5 shadow-lg"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Launching soon — join the waitlist
        </motion.div>

        {/* Icon + Badges */}
        <div className="flex items-start justify-between mb-5">
          <div className="relative">
{(() => { const I = serviceIconMap[service.icon]; return I ? <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><I size={18} className="text-gold-400" /></div> : null })()}
            {/* Lock overlay */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
              <Lock size={9} className="text-teal-400" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Coming Soon badge — distinct pulsing style */}
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-teal-500/10 text-teal-300 border-teal-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Coming Soon
            </span>
            <span className="text-xs text-gray-500 italic">Free during launch</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-display text-xl font-bold mb-3 group-hover:text-teal-400 transition-colors">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed mb-5">{service.description}</p>

        {/* Features — no checkmark, styled as product list */}
        <ul className="space-y-3 mb-7 flex-1">
          {service.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2.5 text-sm text-gray-300">
              <span className="mt-0.5 text-base leading-none">{feat.slice(0, 2)}</span>
              <span>{feat.slice(2)}</span>
            </li>
          ))}
        </ul>

        {/* CTA — Waitlist button */}
        <button
          onClick={() => {
            setJoined(true)
            window.open('mailto:a.allazim@hotmail.com?subject=Early Access — Digital Products & Tools&body=Hi Ahmed,%0A%0AI\'d like to get early access to your Digital Products & Tools ecosystem.%0A%0AName: %0AProfile: (expat / entrepreneur / finance professional)%0A%0ALooking forward to hearing from you.', '_blank')
          }}
          className={`group/btn flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-300
            ${joined
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 cursor-default'
              : 'bg-gradient-to-r from-teal-600 to-teal-400 text-white hover:shadow-lg hover:scale-[1.02]'
            }`}
        >
          {joined ? (
            <>
              <Check size={14} />
              Request Sent — Thank You!
            </>
          ) : (
            <>
              <Bell size={14} className="group-hover/btn:animate-bounce" />
              {service.cta}
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default function Services() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [selectedService,  setSelectedService]  = useState<typeof services[0] | null>(null)
  const [calendlyService,  setCalendlyService]  = useState<typeof services[0] | null>(null)

  return (
    <section id="services" ref={ref} className="py-28 bg-navy-800 dark:bg-navy-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-5"
        >
          <div className="section-tag mx-auto mb-6">What I Offer</div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            Services &amp; <span className="gold-text">Solutions</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-3">
            Whether you're an HNWI seeking portfolio guidance, a financial institution looking to scale, or an entrepreneur building the next fintech — I bring the expertise you need.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Secure Stripe &amp; PayPal checkout
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Payment required to confirm booking
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              All major cards accepted
            </span>
          </div>
        </motion.div>

        {/* Services grid */}
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {services.map((service, i) => {
            // Coming Soon card gets its own component
            if (service.ctaType === 'coming-soon') {
              return (
                <ComingSoonCard
                  key={service.id}
                  service={service}
                  delay={i * 0.1}
                  inView={inView}
                />
              )
            }

            const colors = colorClasses[service.color]
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className={`group glass rounded-2xl p-7 border border-white/5 transition-all duration-300 ${colors.card} flex flex-col`}
              >
                {/* Icon + Badge + Price */}
                <div className="flex items-start justify-between mb-5">
{(() => { const I = serviceIconMap[service.icon]; return I ? <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto"><I size={18} className="text-gold-400" /></div> : null })()}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors.badge}`}>
                      {service.badge}
                    </span>
                    {service.priceDisplay && (
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xl font-bold font-display ${colors.price}`}>{service.priceDisplay}</span>
                        {service.duration && (
                          <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock size={10} />
                            {service.duration}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-white font-display text-xl font-bold mb-3 group-hover:text-gold-400 transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{service.description}</p>

                {/* Features */}
                {'featureGroups' in service && service.featureGroups?.length ? (
                  <div className="space-y-4 mb-7 flex-1">
                    {(service.featureGroups as { label: string; items: string[] }[]).map((group) => (
                      <div key={group.label}>
                        <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${colors.check}`}>{group.label}</p>
                        <ul className="space-y-1.5">
                          {group.items.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                              <Check size={13} className={`${colors.check} mt-0.5 flex-shrink-0`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2 mb-7 flex-1">
                    {service.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <Check size={14} className={`${colors.check} mt-0.5 flex-shrink-0`} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedService(service)}
                    className={`group/btn flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] ${colors.cta}`}
                  >
                    <CalendarCheck size={14} />
                    {service.cta}
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-center text-xs text-gray-600 leading-snug px-2">
                    Select your time — Zoom link included upon booking
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-600 mt-8"
        >
          All bookings require upfront payment. You will receive a confirmation email immediately after payment and Ahmed will contact you within 24 hours to schedule your session.
        </motion.p>
      </div>

      {/* Payment Modal (fallback) */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      {/* Calendly Modal */}
      {calendlyService && (
        <CalendlyModal
          url={
            siteConfig.calendlyEvents[calendlyService.id as keyof typeof siteConfig.calendlyEvents]
            ?? siteConfig.calendlyUrl
          }
          serviceName={calendlyService.title}
          duration={calendlyService.duration || undefined}
          onClose={() => setCalendlyService(null)}
        />
      )}
    </section>
  )
}
