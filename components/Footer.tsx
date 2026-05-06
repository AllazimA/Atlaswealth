'use client'

import { motion } from 'framer-motion'
import { Linkedin, Mail, ArrowUp, MapPin } from 'lucide-react'

const quickLinks = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Main footer */}
        <div className="py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-300 flex items-center justify-center text-navy-900 font-bold">
                AA
              </div>
              <span className="font-display text-white font-semibold text-lg">Ahmed Allazim</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
              Senior Relationship Manager · Wealth Management · AI Innovation. Building the future of premium financial advisory in the UAE and MENA region.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href="https://www.linkedin.com/in/ahmedallazim/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full glass border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={15} />
              </a>
              <a
                href="https://x.com/AhmedAllazim"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/10 hover:border-white/30 transition-all"
                aria-label="X (Twitter)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/971501315241"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full glass border border-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/10 hover:border-green-500/40 transition-all"
                aria-label="WhatsApp"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href="mailto:a.allazim@hotmail.com"
                className="w-9 h-9 rounded-full glass border border-gold-500/20 flex items-center justify-center text-gold-400 hover:bg-gold-500/10 hover:border-gold-500/40 transition-all"
                aria-label="Email"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-500 text-sm hover:text-gold-400 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2.5">
              <li className="text-gray-500 text-sm">Dubai, UAE</li>
              <li>
                <a href="mailto:a.allazim@hotmail.com" className="text-gray-500 text-sm hover:text-gold-400 transition-colors">
                  a.allazim@hotmail.com
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Newsletter</h4>
              <a
                href="https://www.linkedin.com/newsletters/mena-financial-pulse-7264012657022713856/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 text-sm hover:text-gold-300 transition-colors"
              >
                MENA Financial Pulse →
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Ahmed Allazim. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-gray-600 text-xs"><MapPin size={11} /> Dubai, UAE</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-8 h-8 rounded-full glass border border-gold-500/20 flex items-center justify-center text-gold-500 hover:border-gold-500/40 transition-all hover:scale-110"
              aria-label="Back to top"
            >
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
