'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, TrendingUp, Lock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface AppCard {
  title: string
  subtitle: string
  description: string
  features: string[]
  cta: {
    text: string
    href: string
  }
  icon: React.ReactNode
  color: string
}

const apps: AppCard[] = [
  {
    title: 'Lavish Morocco',
    subtitle: 'Luxury Concierge Services',
    description: 'Experience unparalleled luxury concierge services in Morocco. From bespoke travel planning to VIP experiences, we transform every moment into an extraordinary memory.',
    features: [
      'Personalized travel itineraries',
      'VIP airport & accommodation services',
      'Private experiences & exclusive access',
      ' 24/7 concierge support',
      'Curated local expert guidance',
    ],
    cta: {
      text: 'Browse Services',
      href: '/lavish-morocco',
    },
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-gold-500 to-gold-300',
  },
  {
    title: 'WealthOS',
    subtitle: 'Wealth Management Dashboard',
    description: 'Intelligent wealth management and investment tracking dashboard. Real-time market data, multi-asset portfolio tracking, and comprehensive financial analytics.',
    features: [
      'Real-time price tracking with multi-API integration',
      'Portfolio management & analytics',
      'Secure Firebase authentication',
      'Investment performance metrics',
      'Comprehensive asset tracking',
    ],
    cta: {
      text: 'Access Dashboard',
      href: '/wealthos',
    },
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-300',
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6 },
}

export default function LandingPage() {
  return (
    <main className="bg-navy-900 min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="mb-6">
                <span className="inline-block px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-medium tracking-wide">
                  Welcome to Atlas Wealth
                </span>
              </div>

              <h1 className="font-display text-5xl lg:text-6xl font-light text-white mb-6 leading-tight">
                Premium Wealth Management & Luxury Services
              </h1>

              <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-xl">
                Discover our integrated platform offering world-class wealth management with WealthOS and unparalleled luxury concierge services through Lavish Morocco.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/lavish-morocco"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/50 transition-all duration-300 hover:scale-105"
                >
                  Explore Lavish Morocco
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/wealthos"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-gold-500/30 text-gold-400 font-semibold hover:bg-gold-500/5 transition-all duration-300"
                >
                  Access WealthOS
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right side - Stats/Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-gold-500/10 to-gold-500/5 border border-gold-500/20 backdrop-blur-sm">
                  <div className="text-gold-400 text-3xl font-bold mb-2">2</div>
                  <p className="text-gray-400 text-sm">Premium Applications</p>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
                  <div className="text-blue-400 text-3xl font-bold mb-2">∞</div>
                  <p className="text-gray-400 text-sm">Real-time Market Data</p>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm">
                  <div className="text-emerald-400 text-3xl font-bold mb-2">24/7</div>
                  <p className="text-gray-400 text-sm">Global Support</p>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
                  <div className="text-purple-400 text-3xl font-bold mb-2">🔒</div>
                  <p className="text-gray-400 text-sm">Enterprise Security</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-24 bg-navy-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-medium tracking-wide">
                Our Platforms
              </span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-white mb-4">
              Integrated Solutions for Modern Wealth
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Two complementary platforms designed to serve your wealth management and lifestyle needs with excellence.
            </p>
          </motion.div>

          {/* Apps Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {apps.map((app, idx) => (
              <motion.div
                key={app.title}
                {...fadeInUp}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gold-500/0 via-gold-500/0 to-gold-500/0 group-hover:from-gold-500/5 group-hover:via-gold-500/10 group-hover:to-gold-500/5 rounded-2xl transition-all duration-500" />

                <div className="relative p-8 lg:p-10 rounded-2xl border border-white/5 group-hover:border-gold-500/30 bg-navy-900/50 backdrop-blur-xl transition-all duration-500">
                  {/* Icon & Title */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center text-white mb-4`}>
                        {app.icon}
                      </div>
                      <h3 className="font-display text-3xl font-light text-white mb-2">
                        {app.title}
                      </h3>
                      <p className="text-gold-400 text-sm font-medium tracking-wide">
                        {app.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-base leading-relaxed mb-8">
                    {app.description}
                  </p>

                  {/* Features */}
                  <div className="mb-8 space-y-3">
                    <p className="text-white text-sm font-semibold uppercase tracking-wider text-gray-500">Key Features</p>
                    <ul className="space-y-2">
                      {app.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-gray-400 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={app.cta.href}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 group/btn
                      ${app.title === 'Lavish Morocco'
                        ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:shadow-lg hover:shadow-gold-500/50 hover:scale-105'
                        : 'border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500'
                      }`}
                  >
                    {app.cta.text}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            {...fadeInUp}
            className="p-12 rounded-2xl border border-gold-500/30 bg-gradient-to-br from-gold-500/5 to-navy-900/20 backdrop-blur-xl"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-gold-500/20">
                <Lock className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h3 className="text-2xl font-light text-white mb-2">Demo Access</h3>
                <p className="text-gray-400">Use the following credentials to explore WealthOS and test all features</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="p-6 rounded-lg bg-navy-900/50 border border-white/5">
                <p className="text-gray-500 text-sm uppercase tracking-wide mb-2">Email Address</p>
                <p className="text-white text-lg font-medium">a.allazim@gmail.com</p>
              </div>

              <div className="p-6 rounded-lg bg-navy-900/50 border border-white/5">
                <p className="text-gray-500 text-sm uppercase tracking-wide mb-2">Access Method</p>
                <p className="text-white text-lg font-medium">Firebase Authentication</p>
                <p className="text-gray-400 text-sm mt-2">Sign in with the email above via Firebase. Use your browser's "Remember me" feature for persistent access.</p>
              </div>

              <div className="p-6 rounded-lg bg-navy-900/50 border border-white/5">
                <p className="text-gray-500 text-sm uppercase tracking-wide mb-2">Available Platforms</p>
                <ul className="space-y-2 text-white">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                    WealthOS - Wealth Management Dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                    Lavish Morocco - Luxury Concierge Services
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-gray-500 text-sm mt-8 text-center">
              All data is secure and protected by enterprise-grade Firebase authentication
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-transparent to-navy-800/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-white mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Choose your platform and start your journey towards premium wealth management and unforgettable experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/lavish-morocco"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/50 transition-all duration-300 hover:scale-105"
              >
                Explore Lavish Morocco
              </Link>
              <Link
                href="/wealthos"
                className="px-8 py-4 rounded-lg border border-gold-500/30 text-gold-400 font-semibold hover:bg-gold-500/5 transition-all duration-300"
              >
                Access WealthOS Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
