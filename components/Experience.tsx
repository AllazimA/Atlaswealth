'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { experiences } from '@/data/experience'
import { ChevronDown, ExternalLink, Calendar, MapPin, Building2, Landmark, CreditCard, Star, Globe, Hotel, GraduationCap, BookOpen, type LucideIcon } from 'lucide-react'

const expIconMap: Record<string, LucideIcon> = {
  Building2, Landmark, CreditCard, Star, Globe, Hotel,
}

export default function Experience() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(experiences.map(e => e.id)))
  const toggle = (id: number) => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  return (
    <section id="experience" ref={ref} className="py-28 bg-navy-900 dark:bg-navy-900 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-gold-500/4 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="section-tag mx-auto mb-6">Career Journey</div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            Experience &amp; <span className="gold-text">Milestones</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From five-star hospitality to elite banking, every chapter has shaped a career defined by one constant: exceptional client experiences.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-gold-500/30 to-transparent" />

          <div className="space-y-4">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  onClick={() => toggle(exp.id)}
                  className="w-full text-left"
                >
                  <div className={`flex items-start gap-6 p-5 rounded-2xl transition-all duration-300 border ${
                    expanded.has(exp.id)
                      ? 'bg-gold-500/5 border-gold-500/20'
                      : 'border-transparent hover:bg-white/2 hover:border-white/5'
                  }`}>
                    {/* Timeline dot */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center z-10 relative overflow-hidden p-1.5 ${exp.logo?.includes('lavish-morocco') ? 'bg-white border-white/20' : 'bg-white/5 border-white/10'}`}>
                      {exp.logo ? (
                        <img
                          src={exp.logo}
                          alt={exp.company}
                          className="w-full h-full object-contain"
                          style={{ filter: exp.logo.includes('quintessentially') ? 'brightness(0) invert(1)' : undefined }}
                        />
                      ) : (() => {
                        const Icon = expIconMap[exp.icon]
                        return Icon ? <Icon size={20} className="text-gold-400" /> : null
                      })()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-white font-semibold text-base">{exp.role}</h3>
                            {exp.current && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 border border-green-500/20">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-gold-400 text-sm font-medium mt-0.5">{exp.company}</div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />{exp.period}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} />{exp.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="hidden sm:block px-2.5 py-1 rounded-full text-xs bg-white/5 text-gray-400 border border-white/8">
                            {exp.type}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`text-gray-500 transition-transform duration-300 ${expanded.has(exp.id) ? 'rotate-180 text-gold-400' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {expanded.has(exp.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <ul className="mt-4 space-y-2">
                              {exp.achievements.map((a, j) => (
                                <motion.li
                                  key={j}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: j * 0.05 }}
                                  className="flex items-start gap-3 text-sm text-gray-400"
                                >
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold-500/60 shrink-0" />
                                  {a}
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-16 grid sm:grid-cols-3 gap-4"
        >
          {[
            { Icon: GraduationCap, title: 'MBA (Pursuing)', sub: 'SBS Dubai, UAE', tag: 'In Progress' },
            { Icon: Hotel, title: 'DTS Hospitality Management', sub: 'Higher Institute for Hotel Management · Agadir', tag: '2000–2003' },
            { Icon: BookOpen, title: 'Baccalaureate of Economics', sub: 'Al Massira Al Khadra High School · Tiznit', tag: '1994–1999' },
          ].map(({ Icon, title, sub, tag }) => (
            <div key={title} className="glass rounded-2xl p-5 border border-gold-500/10 hover:border-gold-500/25 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center mb-3 group-hover:border-gold-500/35 transition-colors">
                <Icon size={16} className="text-gold-400" />
              </div>
              <div className="text-white text-sm font-semibold mb-1 group-hover:text-gold-400 transition-colors">{title}</div>
              <div className="text-gray-500 text-xs mb-2 leading-relaxed">{sub}</div>
              <span className="px-2 py-0.5 rounded-full text-xs bg-gold-500/10 text-gold-500 border border-gold-500/20">{tag}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
