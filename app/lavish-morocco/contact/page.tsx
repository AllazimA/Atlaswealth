'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/lavish/Navbar'
import Footer from '@/components/lavish/Footer'
import PageHero from '@/components/lavish/PageHero'

const services = [
  'Bespoke Travel Planning',
  'VIP Airport Services',
  'Luxury Accommodations',
  'Private Experiences',
  'Chauffeur & Transport',
  'Fine Dining & Events',
  'Personal Shopping',
  'Lifestyle Management',
  'Other',
]

type FormState = {
  name: string
  email: string
  phone: string
  nationality: string
  arrivalDate: string
  departureDate: string
  guests: string
  service: string
  message: string
}

const initialForm: FormState = {
  name: '', email: '', phone: '', nationality: '',
  arrivalDate: '', departureDate: '', guests: '',
  service: '', message: '',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(196,163,90,0.2)',
  color: '#F5F0E8',
  padding: '14px 18px',
  fontSize: 13,
  letterSpacing: '0.04em',
  outline: 'none',
  transition: 'border-color 0.25s ease',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 9,
  letterSpacing: '0.45em',
  textTransform: 'uppercase',
  color: '#C4A35A',
  marginBottom: 8,
  fontWeight: 500,
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } catch (_) {}
    setSubmitting(false)
    setSubmitted(true)
  }


  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Contact Us"
          title="Begin Your"
          titleItalic="Journey"
          subtitle="Every extraordinary experience begins with a conversation. Our concierge team responds within the hour."
          image="/lavish/Luxury%20Stay.jpg"
          height="55vh"
        />

        <section style={{ background: '#080808', padding: '100px 0' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-20">

              {/* ── Left: Info ── */}
              <div className="lg:col-span-2">
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div style={{ width: 40, height: 1, background: '#C4A35A' }} />
                    <span style={{ fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>Get In Touch</span>
                  </div>

                  <h2 style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 'clamp(32px, 4vw, 52px)',
                    fontWeight: 300, color: '#F5F0E8', lineHeight: 1.1,
                    letterSpacing: '0.02em', marginBottom: 24,
                  }}>
                    Your Wish Is<br />
                    <em style={{ fontStyle: 'italic', color: '#DFC08A' }}>Our Command</em>
                  </h2>

                  <p style={{ fontSize: 14, color: '#C8BFA8', lineHeight: 1.8, marginBottom: 48 }}>
                    Whether you have a detailed brief or simply a desire to experience Morocco at its finest, we are here. Reach out by form or email — we respond to every message personally.
                  </p>

                  {/* Contact methods */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {[
                      {
                        label: 'Email',
                        value: 'info@lavishmorocco.com',
                        href: 'mailto:info@lavishmorocco.com',
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                        ),
                        external: false,
                      },
                      {
                        label: 'Office',
                        value: 'Agadir, Morocco',
                        href: '#',
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                        ),
                        external: false,
                      },
                    ].map(({ label, value, href, icon, external }) => (
                      <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ color: '#C4A35A', marginTop: 2, flexShrink: 0 }}>{icon}</div>
                        <div>
                          <div style={{ fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#6B6355', marginBottom: 6 }}>{label}</div>
                          <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
                            style={{ fontSize: 14, color: '#C8BFA8', textDecoration: 'none', transition: 'color 0.25s', letterSpacing: '0.03em' }}
                            className="hover:text-[#C4A35A]">
                            {value}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Availability note */}
                  <div style={{
                    marginTop: 48,
                    padding: '20px 24px',
                    border: '1px solid rgba(196,163,90,0.2)',
                    background: 'rgba(196,163,90,0.04)',
                  }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#C4A35A', marginBottom: 8 }}>Response Time</div>
                    <p style={{ fontSize: 13, color: '#C8BFA8', lineHeight: 1.7 }}>
                      We respond to every enquiry within <strong style={{ color: '#F5F0E8' }}>60 minutes</strong> during business hours.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* ── Right: Form ── */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        padding: '80px 48px',
                        border: '1px solid rgba(196,163,90,0.25)',
                        textAlign: 'center',
                        background: 'rgba(196,163,90,0.04)',
                      }}
                    >
                      <div style={{
                        fontFamily: 'Cormorant Garamond, Georgia, serif',
                        fontSize: 56, color: '#C4A35A', lineHeight: 1, marginBottom: 24,
                      }}>✦</div>
                      <h3 style={{
                        fontFamily: 'Cormorant Garamond, Georgia, serif',
                        fontSize: 36, fontWeight: 300, color: '#F5F0E8',
                        marginBottom: 16, letterSpacing: '0.02em',
                      }}>
                        Request Received
                      </h3>
                      <p style={{ fontSize: 14, color: '#C8BFA8', lineHeight: 1.75, maxWidth: 360, margin: '0 auto 32px' }}>
                        Your concierge manager will be in touch within the hour. We look forward to crafting your extraordinary experience.
                      </p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="lv-btn-gold"
                        style={{
                          padding: '12px 28px',
                          fontSize: 10,
                          letterSpacing: '0.38em',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          background: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span>Send Another Request</span>
                      </button>
                    </motion.div>
                  ) : (
                    <form name="concierge-request" onSubmit={handleSubmit} data-netlify="true" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <input type="hidden" name="form-name" value="concierge-request" />
                      <div style={{
                        border: '1px solid rgba(196,163,90,0.15)',
                        padding: '48px',
                        background: 'rgba(255,255,255,0.02)',
                      }}>
                        <h3 style={{
                          fontFamily: 'Cormorant Garamond, Georgia, serif',
                          fontSize: 26, fontWeight: 300, color: '#F5F0E8',
                          marginBottom: 36, letterSpacing: '0.03em',
                        }}>
                          Concierge Request
                        </h3>

                        {/* Row 1: Name + Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ marginBottom: 20 }}>
                          <div>
                            <label style={labelStyle}>Full Name *</label>
                            <input type="text" name="name" required placeholder="Your full name"
                              value={form.name} onChange={handleChange}
                              onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                              style={{ ...inputStyle, borderColor: focusedField === 'name' ? 'rgba(196,163,90,0.6)' : 'rgba(196,163,90,0.2)' }}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Email Address *</label>
                            <input type="email" name="email" required placeholder="your@email.com"
                              value={form.email} onChange={handleChange}
                              onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                              style={{ ...inputStyle, borderColor: focusedField === 'email' ? 'rgba(196,163,90,0.6)' : 'rgba(196,163,90,0.2)' }}
                            />
                          </div>
                        </div>

                        {/* Row 2: Phone + Nationality */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ marginBottom: 20 }}>
                          <div>
                            <label style={labelStyle}>Phone / WhatsApp</label>
                            <input type="tel" name="phone" placeholder="+1 234 567 890"
                              value={form.phone} onChange={handleChange}
                              onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                              style={{ ...inputStyle, borderColor: focusedField === 'phone' ? 'rgba(196,163,90,0.6)' : 'rgba(196,163,90,0.2)' }}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Nationality / Country</label>
                            <input type="text" name="nationality" placeholder="United Kingdom"
                              value={form.nationality} onChange={handleChange}
                              onFocus={() => setFocusedField('nationality')} onBlur={() => setFocusedField(null)}
                              style={{ ...inputStyle, borderColor: focusedField === 'nationality' ? 'rgba(196,163,90,0.6)' : 'rgba(196,163,90,0.2)' }}
                            />
                          </div>
                        </div>

                        {/* Row 3: Dates + Guests */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ marginBottom: 20 }}>
                          <div>
                            <label style={labelStyle}>Arrival Date</label>
                            <input type="date" name="arrivalDate"
                              value={form.arrivalDate} onChange={handleChange}
                              onFocus={() => setFocusedField('arrivalDate')} onBlur={() => setFocusedField(null)}
                              style={{ ...inputStyle, borderColor: focusedField === 'arrivalDate' ? 'rgba(196,163,90,0.6)' : 'rgba(196,163,90,0.2)', colorScheme: 'dark' }}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Departure Date</label>
                            <input type="date" name="departureDate"
                              value={form.departureDate} onChange={handleChange}
                              onFocus={() => setFocusedField('departureDate')} onBlur={() => setFocusedField(null)}
                              style={{ ...inputStyle, borderColor: focusedField === 'departureDate' ? 'rgba(196,163,90,0.6)' : 'rgba(196,163,90,0.2)', colorScheme: 'dark' }}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>No. of Guests</label>
                            <input type="number" name="guests" placeholder="2" min="1"
                              value={form.guests} onChange={handleChange}
                              onFocus={() => setFocusedField('guests')} onBlur={() => setFocusedField(null)}
                              style={{ ...inputStyle, borderColor: focusedField === 'guests' ? 'rgba(196,163,90,0.6)' : 'rgba(196,163,90,0.2)' }}
                            />
                          </div>
                        </div>

                        {/* Row 4: Service */}
                        <div style={{ marginBottom: 20 }}>
                          <label style={labelStyle}>Service Required</label>
                          <select name="service" value={form.service} onChange={handleChange}
                            onFocus={() => setFocusedField('service')} onBlur={() => setFocusedField(null)}
                            style={{
                              ...inputStyle,
                              borderColor: focusedField === 'service' ? 'rgba(196,163,90,0.6)' : 'rgba(196,163,90,0.2)',
                              cursor: 'pointer',
                              appearance: 'none',
                              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C4A35A' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 16px center',
                              paddingRight: 40,
                            }}
                          >
                            <option value="" style={{ background: '#111' }}>Select a service</option>
                            {services.map(s => (
                              <option key={s} value={s} style={{ background: '#111' }}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* Row 5: Message */}
                        <div style={{ marginBottom: 36 }}>
                          <label style={labelStyle}>Your Request</label>
                          <textarea name="message" rows={6} required
                            placeholder="Tell us about your vision — the more detail you share, the better we can serve you."
                            value={form.message} onChange={handleChange}
                            onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
                            style={{
                              ...inputStyle,
                              borderColor: focusedField === 'message' ? 'rgba(196,163,90,0.6)' : 'rgba(196,163,90,0.2)',
                              resize: 'vertical',
                              minHeight: 140,
                            }}
                          />
                        </div>

                        {/* Submit + WhatsApp */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                          <button type="submit" disabled={submitting} className="lv-btn-gold"
                            style={{
                              padding: '15px 40px',
                              fontSize: 11,
                              letterSpacing: '0.42em',
                              textTransform: 'uppercase',
                              fontWeight: 500,
                              cursor: submitting ? 'wait' : 'pointer',
                              background: 'none',
                              flexShrink: 0,
                              opacity: submitting ? 0.6 : 1,
                            }}
                          >
                            <span>{submitting ? 'Sending…' : 'Submit Request'}</span>
                          </button>

                        </div>

                        <p style={{ marginTop: 20, fontSize: 11, color: '#4A4035', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                          Your information is held in strict confidence and never shared with third parties.
                        </p>
                      </div>
                    </form>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
