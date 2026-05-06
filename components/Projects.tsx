'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { projects } from '@/data/projects'
import { ArrowRight, ChevronDown, ExternalLink, BrainCircuit, Landmark, Globe, TrendingUp, Lightbulb, ArrowUp, type LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  BrainCircuit,
  Landmark,
  Globe,
  TrendingUp,
}

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(projects.map(p => p.id)))
  const toggle = (id: number) => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  return (
    <section id="projects" ref={ref} className="py-28 bg-navy-900 dark:bg-navy-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/4 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gold-500/4 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="section-tag mx-auto mb-6">Case Studies</div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            Projects &amp; <span className="gold-text">Impact</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real initiatives. Measurable outcomes. Each project tells a story of a problem identified, a solution crafted, and impact delivered.
          </p>
        </motion.div>

        {/* Projects list */}
        <div className="space-y-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                expanded.has(project.id)
                  ? 'border-gold-500/30 bg-gradient-to-br ' + project.color
                  : 'border-white/5 bg-white/2 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => toggle(project.id)}
                className="w-full text-left p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {(() => {
                      const Icon = iconMap[project.icon]
                      return Icon ? (
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${project.iconBg}`}>
                          <Icon size={20} className={project.iconColor} />
                        </div>
                      ) : null
                    })()}
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="text-white font-semibold text-base leading-tight">{project.title}</h3>
                        {project.featured && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gold-500/20 text-gold-400 border border-gold-500/30 flex-shrink-0">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-gold-400 text-sm mb-2">{project.subtitle} · {project.period}</div>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-gray-400 border border-white/8">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 flex-shrink-0 mt-1 transition-transform duration-300 ${expanded.has(project.id) ? 'rotate-180 text-gold-400' : ''}`}
                  />
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {expanded.has(project.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <div className="h-px bg-gold-500/15 mb-6" />
                      <div className="grid sm:grid-cols-3 gap-6">
                        {/* Problem */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                              <span className="text-red-400 text-xs font-bold">!</span>
                            </div>
                            <span className="text-white text-xs font-semibold uppercase tracking-wider">Problem</span>
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{project.problem}</p>
                        </div>
                        {/* Solution */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                              <Lightbulb size={10} className="text-blue-400" />
                            </div>
                            <span className="text-white text-xs font-semibold uppercase tracking-wider">Solution</span>
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{project.solution}</p>
                        </div>
                        {/* Impact */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                              <ArrowUp size={10} className="text-green-400" />
                            </div>
                            <span className="text-white text-xs font-semibold uppercase tracking-wider">Impact</span>
                          </div>
                          <ul className="space-y-1.5">
                            {project.impact.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                                <ArrowRight size={12} className="text-gold-500 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Live links */}
                      {project.links && project.links.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-3">
                          {project.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-gold-500/30 bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 hover:border-gold-500/50 transition-all duration-200 hover:scale-105"
                            >
                              <ExternalLink size={11} />
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
