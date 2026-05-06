'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { skillCategories, certifications, languages } from '@/data/skills'
import {
  TrendingUp, Rocket, BrainCircuit, Target,
  Award, ScrollText, ShieldCheck, Sigma,
  Briefcase, GraduationCap, ClipboardList, BookOpen,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  TrendingUp, Rocket, BrainCircuit, Target,
  Award, ScrollText, ShieldCheck, Sigma,
  Briefcase, GraduationCap, ClipboardList, BookOpen,
}

const iconColor: Record<string, string> = {
  gold: 'text-gold-400',
  blue: 'text-blue-400',
  teal: 'text-teal-400',
  purple: 'text-purple-400',
}

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="group">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-gray-300 group-hover:text-gold-400 transition-colors">{name}</span>
        <span className="text-xs text-gray-500">{level}%</span>
      </div>
      <div className="skill-bar">
        <motion.div
          className="skill-bar-fill"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: level / 100 } : {}}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

const colorMap: Record<string, string> = {
  gold: 'from-gold-500/20 to-gold-500/5 border-gold-500/20 hover:border-gold-500/40',
  blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40',
  teal: 'from-teal-500/20 to-teal-500/5 border-teal-500/20 hover:border-teal-500/40',
  purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40',
}

export default function Skills() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="skills" ref={ref} className="py-28 bg-navy-800 dark:bg-navy-800 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-500/3 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="section-tag mx-auto mb-6">Expertise</div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            Skills &amp; <span className="gold-text">Capabilities</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A unique blend of financial expertise, human-centered relationship skills, and modern technology competencies.
          </p>
        </motion.div>

        {/* Skill category cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {skillCategories.map(({ title, icon, color, skills }, catIdx) => {
            const Icon = iconMap[icon]
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: catIdx * 0.1 }}
                className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-6 transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-6">
                  {Icon && (
                    <div className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${iconColor[color]}`}>
                      <Icon size={16} />
                    </div>
                  )}
                  <h3 className="text-white font-semibold text-lg">{title}</h3>
                </div>
                <div className="space-y-4">
                  {skills.map((skill, j) => (
                    <SkillBar
                      key={skill.name}
                      name={skill.name}
                      level={skill.level}
                      delay={catIdx * 0.1 + j * 0.07}
                    />
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-white font-display text-2xl font-bold mb-8 text-center">
            Certifications &amp; Qualifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {certifications.map(({ name, issuer, year, icon }, i) => {
              const Icon = iconMap[icon]
              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="glass rounded-xl p-4 border border-gold-500/10 hover:border-gold-500/30 transition-all group text-center"
                >
                  {Icon && (
                    <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center mx-auto mb-3 group-hover:border-gold-500/35 transition-colors">
                      <Icon size={16} className="text-gold-400" />
                    </div>
                  )}
                  <div className="text-white text-sm font-semibold mb-1 group-hover:text-gold-400 transition-colors leading-tight">{name}</div>
                  <div className="text-gray-500 text-xs">{issuer}</div>
                  <div className="text-gold-500/70 text-xs mt-1">{year}</div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-white font-display text-2xl font-bold mb-8 text-center">Languages</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {languages.map(({ name, level, flag, percent }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="glass rounded-2xl p-6 border border-gold-500/10 hover:border-gold-500/30 transition-all min-w-[180px] text-center group"
              >
                <div className="text-4xl mb-3">{flag}</div>
                <div className="text-white font-semibold mb-0.5 group-hover:text-gold-400 transition-colors">{name}</div>
                <div className="text-gray-400 text-sm mb-3">{level}</div>
                <div className="skill-bar w-32 mx-auto">
                  <motion.div
                    className="skill-bar-fill"
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: percent / 100 } : {}}
                    transition={{ duration: 1, delay: 0.9 + i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
