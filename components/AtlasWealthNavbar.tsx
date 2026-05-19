'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AtlasWealthNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Security', href: '/#security' },
    { label: 'How It Works', href: '/#how-it-works' },
  ]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-navy-900/80 backdrop-blur-lg border-b border-gold-500/10"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-navy-900 font-bold text-lg group-hover:shadow-lg group-hover:shadow-gold-500/50 transition-all">
              AW
            </div>
            <span className="text-white font-semibold text-lg hidden sm:inline">Atlas Wealth</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/login"
              className="text-gold-400 hover:text-gold-300 font-semibold transition-colors"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/50 transition-all hover:scale-105"
            >
              Access Dashboard
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white hover:text-gold-400 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gold-500/10 py-4 space-y-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-gray-400 hover:text-gold-400 transition-colors font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-gold-500/10">
              <Link
                href="/login"
                className="text-center py-2 text-gold-400 hover:text-gold-300 font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                href="/dashboard"
                className="text-center py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/50 transition-all"
              >
                Access Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
