import Link from 'next/link'
import { Instagram, Facebook, Linkedin } from 'lucide-react'

const services = [
  'Bespoke Travel Planning',
  'VIP Airport Services',
  'Luxury Accommodations',
  'Private Experiences',
  'Chauffeur & Transport',
  'Events & Occasions',
]

const experiences = [
  'Sahara Luxury Camps',
  'Atlas Mountains Retreat',
  'Coastal Escapes',
  'Ancient Medina Tours',
  'Private Riad Experience',
  'Desert Wellness',
]

export default function Footer() {
  return (
    <footer
      style={{
        background: '#080808',
        borderTop: '1px solid rgba(196,163,90,0.12)',
        paddingTop: 80,
        paddingBottom: 48,
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 28, fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#F5F0E8', lineHeight: 1 }}
              >
                Lavish
              </div>
              <div
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.65em', textTransform: 'uppercase', color: '#C4A35A', marginTop: 4 }}
              >
                Morocco
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: '#C8BFA8', maxWidth: 240, marginBottom: 28 }}>
              Every detail, anticipated.<br />
              Every moment, elevated.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="mailto:contact@lavishmorocco.com"
                style={{ fontSize: 12, color: '#C8BFA8', textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.25s' }}
                className="hover:text-[#C4A35A]">
                contact@lavishmorocco.com
              </a>
              <span style={{ fontSize: 12, color: '#6B6355', letterSpacing: '0.05em' }}>
                Agadir, Morocco
              </span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500, marginBottom: 20 }}>
              Services
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {services.map(s => (
                <li key={s}>
                  <Link href="/lavish-morocco/services"
                    style={{ fontSize: 13, color: '#C8BFA8', textDecoration: 'none', transition: 'color 0.25s' }}
                    className="hover:text-[#C4A35A]">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <h4 style={{ fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500, marginBottom: 20 }}>
              Experiences
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {experiences.map(e => (
                <li key={e}>
                  <Link href="/lavish-morocco/experiences"
                    style={{ fontSize: 13, color: '#C8BFA8', textDecoration: 'none', transition: 'color 0.25s' }}
                    className="hover:text-[#C4A35A]">
                    {e}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Newsletter */}
          <div>
            <h4 style={{ fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500, marginBottom: 20 }}>
              Begin Your Journey
            </h4>
            <p style={{ fontSize: 13, color: '#C8BFA8', lineHeight: 1.7, marginBottom: 24 }}>
              Ready to experience Morocco at its most extraordinary?
            </p>
            <Link href="/lavish-morocco/contact" className="lv-btn-gold"
              style={{
                display: 'inline-block',
                padding: '11px 24px',
                fontSize: 10,
                letterSpacing: '0.38em',
                textTransform: 'uppercase',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <span>Make a Request</span>
            </Link>

            {/* Social */}
            <div style={{ marginTop: 32 }}>
              <h4 style={{ fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500, marginBottom: 14 }}>
                Follow
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {([
                  { label: 'Instagram', href: 'https://www.instagram.com/lavishmorocco2024/', Icon: Instagram },
                  { label: 'Facebook',  href: 'https://www.facebook.com/profile.php?id=61556491596473', Icon: Facebook },
                  { label: 'LinkedIn',  href: 'https://www.linkedin.com/company/lavishmorocco/about/', Icon: Linkedin },
                ] as const).map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 10,
                      fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: '#6B6355', textDecoration: 'none',
                      transition: 'color 0.3s ease-in-out',
                    }}
                    className="hover:text-[#C8A96A] group"
                  >
                    <Icon size={14} strokeWidth={1.5} style={{ flexShrink: 0, transition: 'color 0.3s ease-in-out' }} />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Gold divider ── */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.3), transparent)', marginBottom: 32 }} />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p style={{ fontSize: 11, color: '#4A4035', letterSpacing: '0.08em' }}>
            © 2024 Lavish Morocco. All rights reserved. Founded 2022 · Agadir, Morocco.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service'].map(item => (
              <a key={item} href="#"
                style={{ fontSize: 11, color: '#4A4035', letterSpacing: '0.08em', textDecoration: 'none', transition: 'color 0.25s' }}
                className="hover:text-[#C8BFA8]">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
