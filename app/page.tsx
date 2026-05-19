'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Lock, BarChart3, Zap, Shield } from 'lucide-react'
import AtlasWealthNavbar from '@/components/AtlasWealthNavbar'
import AtlasWealthFooter from '@/components/AtlasWealthFooter'

const features = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Portfolio Management',
    description: 'Build, track, and optimize your investment portfolio with advanced analytics and real-time data.',
    color: 'from-blue-500/20 to-blue-500/5',
    borderColor: 'border-blue-500/30'
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Real-time Market Data',
    description: 'Stay informed with live stock prices, market indices, and comprehensive financial analysis tools.',
    color: 'from-green-500/20 to-green-500/5',
    borderColor: 'border-green-500/30'
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Enterprise Security',
    description: 'Your data is protected with enterprise-grade Firebase authentication and encryption.',
    color: 'from-purple-500/20 to-purple-500/5',
    borderColor: 'border-purple-500/30'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Smart Analytics',
    description: 'Get actionable insights from advanced portfolio analytics and risk assessment tools.',
    color: 'from-yellow-500/20 to-yellow-500/5',
    borderColor: 'border-yellow-500/30'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Multi-asset Support',
    description: 'Manage stocks, bonds, crypto, and more - all in one unified dashboard.',
    color: 'from-red-500/20 to-red-500/5',
    borderColor: 'border-red-500/30'
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Virtual Portfolio',
    description: 'Practice trading with our paper trading simulator before investing real money.',
    color: 'from-cyan-500/20 to-cyan-500/5',
    borderColor: 'border-cyan-500/30'
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
      <AtlasWealthNavbar />

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
                Intelligent Wealth Management
              </h1>

              <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-xl">
                Take control of your investments with real-time market data, advanced portfolio analytics, and intelligent wealth management tools. All in one unified platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/50 transition-all duration-300 hover:scale-105"
                >
                  Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-gold-500/30 text-gold-400 font-semibold hover:bg-gold-500/5 transition-all duration-300"
                >
                  Sign Up
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <p className="text-gray-500 text-sm mt-8">
                No credit card required. Get started in minutes.
              </p>
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
                  <div className="text-gold-400 text-3xl font-bold mb-2">12+</div>
                  <p className="text-gray-400 text-sm">Dashboard Pages</p>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
                  <div className="text-blue-400 text-3xl font-bold mb-2">∞</div>
                  <p className="text-gray-400 text-sm">Real-time Data</p>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm">
                  <div className="text-emerald-400 text-3xl font-bold mb-2">24/7</div>
                  <p className="text-gray-400 text-sm">Availability</p>
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

      {/* Features Section */}
      <section className="py-24 bg-navy-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-medium tracking-wide">
                Powerful Features
              </span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-white mb-4">
              Everything You Need to Manage Your Wealth
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Professional-grade tools designed for both individual investors and wealth managers.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                {...fadeInUp}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`p-8 rounded-2xl border ${feature.borderColor} bg-gradient-to-br ${feature.color} backdrop-blur-xl hover:border-gold-500/50 transition-all duration-300 group`}
              >
                <div className="w-12 h-12 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-400 mb-6 group-hover:bg-gold-500/30 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl lg:text-5xl font-light text-white mb-4">
              Get Started in 3 Steps
            </h2>
            <p className="text-gray-400 text-lg">
              Start managing your wealth in minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Account',
                description: 'Sign up with your email and create a secure account with Firebase authentication.'
              },
              {
                step: '2',
                title: 'Build Portfolio',
                description: 'Add your assets, set allocation targets, and configure your investment goals.'
              },
              {
                step: '3',
                title: 'Track & Analyze',
                description: 'Monitor real-time market data, track performance, and get actionable insights.'
              }
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                {...fadeInUp}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
              >
                <div className="p-8 rounded-2xl border border-gold-500/20 bg-navy-900/50 backdrop-blur-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-navy-900 font-bold text-xl mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-navy-800/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="p-12 rounded-2xl border border-gold-500/30 bg-gradient-to-br from-gold-500/5 to-navy-900/20 backdrop-blur-xl"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-gold-500/20">
                <Shield className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h3 className="text-2xl font-light text-white mb-2">Your Security is Our Priority</h3>
                <p className="text-gray-400">Enterprise-grade protection for your financial data</p>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg bg-navy-900/50 border border-white/5">
                <p className="text-gold-400 font-semibold mb-2">🔐 Firebase Authentication</p>
                <p className="text-gray-400 text-sm">Industry-standard email/password authentication with secure session management</p>
              </div>

              <div className="p-6 rounded-lg bg-navy-900/50 border border-white/5">
                <p className="text-gold-400 font-semibold mb-2">🛡️ Data Encryption</p>
                <p className="text-gray-400 text-sm">All your data is encrypted in transit and at rest using enterprise-grade encryption</p>
              </div>

              <div className="p-6 rounded-lg bg-navy-900/50 border border-white/5">
                <p className="text-gold-400 font-semibold mb-2">👤 User Isolation</p>
                <p className="text-gray-400 text-sm">Your data is completely isolated. Only you can access your portfolio and settings</p>
              </div>

              <div className="p-6 rounded-lg bg-navy-900/50 border border-white/5">
                <p className="text-gold-400 font-semibold mb-2">📊 Compliance</p>
                <p className="text-gray-400 text-sm">Built with security best practices and compliance standards in mind</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-transparent to-navy-800/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="font-display text-4xl lg:text-5xl font-light text-white mb-6">
              Ready to Take Control of Your Wealth?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of investors using Atlas Wealth to manage their portfolios and achieve their financial goals.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/50 transition-all duration-300 hover:scale-105"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-lg border border-gold-500/30 text-gold-400 font-semibold hover:bg-gold-500/5 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>

            <p className="text-gray-500 text-sm mt-8">
              No credit card required • Free to start • Full features access
            </p>
          </motion.div>
        </div>
      </section>

      <AtlasWealthFooter />
    </main>
  )
}
