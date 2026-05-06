'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { blogPosts, categories } from '@/data/blog'
import { ExternalLink, Clock, Calendar, BarChart2 } from 'lucide-react'

const categoryColors: Record<string, string> = {
  'Market Insights': 'bg-gold-500/15 text-gold-400',
  'Wealth Management': 'bg-blue-500/15 text-blue-400',
  'MENA Financial Pulse': 'bg-teal-500/15 text-teal-400',
  'Banking & Finance': 'bg-purple-500/15 text-purple-400',
  'Investing': 'bg-green-500/15 text-green-400',
  'Emerging Markets': 'bg-orange-500/15 text-orange-400',
}

export default function Blog() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory)

  return (
    <section id="blog" ref={ref} className="py-28 bg-navy-900 dark:bg-navy-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/4 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/4 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <div className="section-tag mx-auto mb-6">Insights</div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            Thoughts &amp; <span className="gold-text">Perspectives</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-2">
            Regular insights on markets, wealth management, AI in finance, and the MENA economic landscape.
          </p>
          <a
            href="https://www.linkedin.com/in/ahmedallazim/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold-400 text-sm hover:text-gold-300 transition-colors"
          >
            Follow MENA Financial Pulse Newsletter
            <ExternalLink size={13} />
          </a>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-gold-500/20 text-gold-400 border-gold-500/40'
                  : 'bg-white/3 text-gray-400 border-white/8 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Blog grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="group glass rounded-2xl overflow-hidden border border-white/5 hover:border-gold-500/20 transition-all duration-300 flex flex-col"
            >
              {/* Article header gradient */}
              <div className="h-1 w-full bg-gradient-to-r from-gold-500 to-gold-300 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 flex flex-col flex-1">
                {/* Category + read time */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[post.category] || 'bg-gray-500/15 text-gray-400'}`}>
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={11} />
                    {post.readTime}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold text-base leading-snug mb-3 group-hover:text-gold-400 transition-colors flex-1">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md text-xs text-gray-500 bg-white/3 border border-white/6">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={11} />
                    {post.date}
                  </span>
                  <a
                    href={post.link || 'https://www.linkedin.com/in/ahmedallazim/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gold-500 hover:text-gold-400 transition-colors font-medium"
                  >
                    Read on LinkedIn
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-14 text-center"
        >
          <div className="glass rounded-2xl p-8 border border-gold-500/15 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4">
              <BarChart2 size={22} className="text-gold-400" />
            </div>
            <h3 className="text-white font-display text-xl font-bold mb-2">MENA Financial Pulse</h3>
            <p className="text-gray-400 text-sm mb-5">
              Join 900+ subscribers receiving bi-weekly insights on MENA markets, fintech trends, and wealth management strategies.
            </p>
            <a
              href="https://www.linkedin.com/newsletters/mena-financial-pulse-7264012657022713856/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-500 to-gold-300 hover:shadow-gold transition-all hover:scale-105"
            >
              Subscribe on LinkedIn
              <ExternalLink size={13} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
