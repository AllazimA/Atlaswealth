'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home',        href: '/lavish-morocco'             },
  { label: 'About',       href: '/lavish-morocco/about'       },
  { label: 'Services',    href: '/lavish-morocco/services'    },
  { label: 'Experiences', href: '/lavish-morocco/experiences' },
  { label: 'Contact',     href: '/lavish-morocco/contact'     },
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'background 0.5s ease, border-color 0.5s ease, backdrop-filter 0.5s ease',
        background: scrolled ? 'rgba(8,8,8,0.96)' : 'rgba(8,8,8,0.15)',
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(4px)',
        borderBottom: scrolled
          ? '1px solid rgba(196,163,90,0.18)'
          : '1px solid rgba(196,163,90,0.06)',
      }}
    >
      {/* ── 3-column grid: logo | nav | cta ── */}
      <div
        style={{ maxWidth: 1440, margin: '0 auto', height: 80 }}
        className="grid grid-cols-[auto_1fr_auto] items-center px-6 lg:px-12 gap-8"
      >
        {/* Logo */}
        <Link href="/lavish-morocco" className="flex items-center gap-3 shrink-0">
          <img
            src="/lavish/logo-mark-transparent.svg"
            alt="Lavish Morocco"
            style={{ height: 48, width: 'auto' }}
          />
          <div className="flex flex-col leading-none">
            <span style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 21, fontWeight: 300,
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: '#F5F0E8', lineHeight: 1,
            }}>
              Lavish
            </span>
            <span style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 10, fontWeight: 500,
              letterSpacing: '0.72em', textTransform: 'uppercase',
              color: '#C4A35A', marginTop: 3,
            }}>
              Morocco
            </span>
          </div>
        </Link>

        {/* Center nav */}
        <nav className="hidden lg:flex items-center justify-center gap-10">
          {navLinks.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link key={label} href={href}
                className="group relative"
                style={{ textDecoration: 'none' }}
              >
                <span style={{
                  fontSize: 11,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  color: active ? '#C4A35A' : '#D4CCBB',
                  transition: 'color 0.25s ease',
                  display: 'block',
                  paddingBottom: 4,
                }}
                  className="group-hover:text-[#C4A35A]"
                >
                  {label}
                </span>
                {/* Gold underline — slides in on hover */}
                <span style={{
                  position: 'absolute', bottom: 0, left: 0,
                  height: 1,
                  background: '#C4A35A',
                  width: active ? '100%' : '0%',
                  transition: 'width 0.3s cubic-bezier(0.22,1,0.36,1)',
                }}
                  className="group-hover:w-full"
                />
              </Link>
            )
          })}
        </nav>

        {/* Right: CTA + mobile toggle */}
        <div className="flex items-center gap-4 justify-end">
          <Link href="/lavish-morocco/contact"
            className="hidden lg:inline-block lv-btn-gold"
            style={{
              padding: '10px 22px',
              fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase',
              fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            <span>Request Concierge</span>
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="lg:hidden"
            style={{
              color: '#F5F0E8', background: 'none', border: 'none',
              cursor: 'pointer', padding: 4,
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              overflow: 'hidden',
              background: 'rgba(8,8,8,0.98)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(196,163,90,0.12)',
            }}
          >
            <div style={{ padding: '32px 24px 40px', display: 'flex', flexDirection: 'column', gap: 22 }}>
              {navLinks.map(({ label, href }) => (
                <Link key={label} href={href}
                  style={{
                    fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase',
                    color: pathname === href ? '#C4A35A' : '#D4CCBB',
                    fontWeight: 500, textDecoration: 'none',
                    transition: 'color 0.25s',
                  }}
                >
                  {label}
                </Link>
              ))}
              <Link href="/lavish-morocco/contact" className="lv-btn-gold"
                style={{
                  marginTop: 8, display: 'block', textAlign: 'center',
                  padding: '13px 24px', fontSize: 10,
                  letterSpacing: '0.4em', textTransform: 'uppercase',
                  fontWeight: 500, textDecoration: 'none',
                }}
              >
                <span>Request Concierge</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
