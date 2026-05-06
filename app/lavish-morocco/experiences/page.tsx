'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/lavish/Navbar'
import Footer from '@/components/lavish/Footer'
import PageHero from '@/components/lavish/PageHero'
import CTASection from '@/components/lavish/CTASection'

const experiences = [
  {
    id: 1,
    category: 'Desert',
    title: 'Desert Caravane Experience',
    tagline: 'Golden Dunes, Golden Hours',
    description: 'Arrive by private 4×4 convoy as the sun sets the Saharan sky ablaze. A luxury caravane camp awaits — bespoke furnishings, private butler, gourmet dinners beneath the Milky Way, and a sunrise camel ride that lives in memory forever.',
    duration: 'Customised to Request',
    guests: 'No Restriction',
    season: 'Oct – Apr (Peak)',
    image: '/lavish/Desert%20caravan%20at%20golden%20hour.png',
  },
  {
    id: 2,
    category: 'Mountains',
    title: 'Agafay Desert Retreat',
    tagline: 'The Rocky Desert Above Marrakech',
    description: 'Just 40 minutes from Marrakech, the Agafay desert plateau offers a dramatic lunar landscape of stone and silence. Your private lodge overlooks valleys of amber light — exclusive glamping, private dinners under the stars, and the Atlas as your backdrop.',
    duration: '1 Night',
    guests: 'No Restriction',
    season: 'Sep – Jun',
    image: '/lavish/Agafay%20desert%20Experience.jpg',
  },
  {
    id: 3,
    category: 'Coastal',
    title: 'Atlantic Coastal Escape',
    tagline: 'Morocco from the Atlantic',
    description: 'Charter a private yacht from Agadir along Morocco\'s dramatic Atlantic coastline. Anchor in hidden coves, dine on freshly caught seafood, and arrive in Essaouira by sea as the sun sets behind the ancient ramparts.',
    duration: '1–5 Days',
    guests: 'No Restriction',
    season: 'May – Oct',
    image: '/lavish/Yacht.jpg',
  },
  {
    id: 4,
    category: 'Heritage',
    title: 'Imperial Medina Tours',
    tagline: 'The Living Heart of Morocco',
    description: 'Explore Morocco\'s imperial medinas through closed doors — private after-hours access to the Menara Gardens, hidden fondouks, and master artisan workshops. Rooftop dinners above medinas that glow like embers at dusk.',
    duration: 'Half Day',
    guests: 'No Restriction',
    season: 'Oct – Apr',
    image: '/lavish/Menara%20Marrakech.jpg',
  },
  {
    id: 5,
    category: 'Riads',
    title: 'Private Riad Experience',
    tagline: 'Your Own Palace Within the Medina',
    description: 'Take exclusive possession of a centuries-old riad — courtyard fountains, zellige tilework, private rooftop terrace, and a dedicated household team who will serve you as the riad\'s private family once did.',
    duration: 'Customised to Request',
    guests: 'No Restriction',
    season: 'Year-Round',
    image: '/lavish/Riad%20pacio.jpg',
  },
  {
    id: 6,
    category: 'Culture',
    title: 'Souk & Artisan Experiences',
    tagline: 'The Art of the Marketplace',
    description: 'Step beyond the tourist trail into the living soul of Morocco\'s souks — private access to master craftsmen, bespoke leatherwork commissions, Berber jewellery specialists, and spice merchants whose families have traded for generations.',
    duration: '4 Hours – Half Day',
    guests: 'No Restriction',
    season: 'Year-Round',
    image: '/lavish/Souk%20Shop.jpg',
  },
]

export default function ExperiencesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Curated Experiences"
          title="Beyond the"
          titleItalic="Ordinary"
          subtitle="Each experience is designed as a singular chapter in your story — private, purposeful, and impossible to replicate."
          image="/lavish/Desert%20caravan%20at%20golden%20hour.png"
          height="65vh"
        />

        {/* Experiences grid */}
        <section style={{ background: '#080808', padding: '100px 0' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">

            {/* Intro */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{ maxWidth: 640, marginBottom: 72 }}
            >
              <p style={{ fontSize: 22, color: '#C8BFA8', lineHeight: 1.85, fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic', fontWeight: 300 }}>
                "Every experience we design begins with a conversation. We listen to who you are, what moves you, and what you have yet to discover."
              </p>
            </motion.div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {experiences.map((exp, i) => (
                <motion.article
                  key={exp.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.85, delay: (i % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group lv-card"
                  style={{ overflow: 'hidden' }}
                >
                  {/* Image */}
                  <div className="lv-img-zoom" style={{ aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={exp.image}
                      alt={exp.title}
                      style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover', display: 'block',
                        transition: 'transform 0.8s cubic-bezier(0.22,1,0.36,1), filter 0.5s ease',
                        filter: 'brightness(0.75)',
                      }}
                      className="group-hover:scale-[1.05] group-hover:brightness-[0.6]"
                    />
                    {/* Category badge */}
                    <div style={{
                      position: 'absolute', top: 20, left: 20,
                      padding: '6px 14px',
                      background: 'rgba(8,8,8,0.7)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(196,163,90,0.3)',
                      fontSize: 9,
                      letterSpacing: '0.4em',
                      textTransform: 'uppercase',
                      color: '#C4A35A',
                    }}>
                      {exp.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '32px' }}>
                    <p style={{ fontSize: 12, color: '#6B6355', fontStyle: 'italic', marginBottom: 10, letterSpacing: '0.04em' }}>
                      {exp.tagline}
                    </p>
                    <h3 style={{
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                      fontSize: 28, fontWeight: 400,
                      color: '#F5F0E8', marginBottom: 16,
                      lineHeight: 1.15,
                    }}>
                      {exp.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#C8BFA8', lineHeight: 1.75, marginBottom: 24 }}>
                      {exp.description}
                    </p>

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Duration', value: exp.duration },
                        { label: 'Guests', value: exp.guests },
                        { label: 'Season', value: exp.season },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#6B6355', marginBottom: 4 }}>
                            {label}
                          </div>
                          <div style={{ fontSize: 12, color: '#C8BFA8' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <Link href="/lavish-morocco/contact" className="lv-btn-gold"
                      style={{
                        display: 'inline-block',
                        padding: '11px 24px',
                        fontSize: 9,
                        letterSpacing: '0.38em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        textDecoration: 'none',
                      }}
                    >
                      <span>Request This Experience</span>
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  )
}
