'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/lavish/Navbar'
import Footer from '@/components/lavish/Footer'
import PageHero from '@/components/lavish/PageHero'
import CTASection from '@/components/lavish/CTASection'

const values = [
  {
    title: 'Discreet Excellence',
    body: 'We operate in the shadows of our clients\' lives, making everything possible without ever being visible. The best service is the service you never had to ask for.',
  },
  {
    title: 'Cultural Reverence',
    body: 'Morocco is not a backdrop for our services — it is the protagonist. We celebrate its heritage, its craftsmen, and its people through everything we offer.',
  },
  {
    title: 'Genuine Relationships',
    body: 'We are not a transactional company. Every client becomes a relationship — a name, a story, a set of preferences we hold and honour across every interaction.',
  },
  {
    title: 'Unwavering Standards',
    body: 'We do not adjust our standards based on budget or complexity. Every request — from a restaurant booking to a private desert camp — receives the same absolute care.',
  },
]

const team = [
  {
    name: 'Yasmine Benali',
    title: 'Founder & Director',
    bio: 'Born in Agadir, educated in London and Geneva. Twelve years shaping luxury hospitality before founding Lavish Morocco with a singular vision: to make Morocco the world\'s most coveted destination.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80&auto=format&fit=crop&faces=1',
  },
  {
    name: 'Karim El-Fassi',
    title: 'Head of Experiences',
    bio: 'A Fez native with encyclopaedic knowledge of Morocco\'s hidden heritage. Former cultural liaison for the Ministry of Tourism, now exclusively dedicated to crafting Lavish Morocco\'s most extraordinary moments.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop',
  },
  {
    name: 'Sofia Amrani',
    title: 'Senior Concierge Manager',
    bio: 'With a background in private banking client services and hospitality management, Sofia ensures that every guest\'s experience is seamless from first contact to fond farewell.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80&auto=format&fit=crop',
  },
]

const milestones = [
  { year: '2022', event: 'Lavish Morocco founded by Ahmed Allazim, setting the foundation for a new standard in bespoke lifestyle and concierge services.' },
  { year: '2023', event: 'Completed the operational prototype and established a trusted network of over 150 premium partners and service providers across Morocco.' },
  { year: '2023', event: 'Entered the sandbox phase, successfully curating and delivering services to VVIP clientele.' },
  { year: '2024', event: 'Delivered over 100 curated experiences to an international clientele spanning 15+ nationalities.' },
  { year: '2025', event: 'Launched an exclusive lifestyle management retainer tailored for UHNW clients, offering end-to-end bespoke services and privileged access.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.85, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label="Our Story"
          title="Born of"
          titleItalic="Morocco"
          subtitle="A love for this extraordinary country, and an unwillingness to accept anything less than its finest expression."
          image="/lavish/Menara%20Marrakech.jpg"
          height="65vh"
        />

        {/* Founder story */}
        <section style={{ background: '#080808', padding: '64px 0' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                className="lv-img-zoom"
                style={{ position: 'relative' }}
              >
                <div style={{ aspectRatio: '3/4', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src="/lavish/Morocco%20desert%20%26%20sand.jpg"
                    alt="Morocco landscape"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(196,163,90,0.2)', pointerEvents: 'none' }} />
                </div>
                {/* Gold corner accents */}
                <div style={{ position: 'absolute', top: -12, left: -12, width: 48, height: 48, borderTop: '2px solid rgba(196,163,90,0.5)', borderLeft: '2px solid rgba(196,163,90,0.5)' }} />
                <div style={{ position: 'absolute', bottom: -12, right: -12, width: 48, height: 48, borderBottom: '2px solid rgba(196,163,90,0.5)', borderRight: '2px solid rgba(196,163,90,0.5)' }} />
              </motion.div>

              <div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} custom={0}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 1, background: '#C4A35A' }} />
                  <span style={{ fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>Founded 2022</span>
                </motion.div>

                <motion.h2
                  initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} custom={1}
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 'clamp(32px, 4vw, 52px)',
                    fontWeight: 300, color: '#F5F0E8', lineHeight: 1.1,
                    letterSpacing: '0.02em', marginBottom: 24,
                  }}
                >
                  A Vision<br />
                  <em style={{ fontStyle: 'italic', color: '#DFC08A' }}>Unapologetically Elevated</em>
                </motion.h2>

                <motion.p initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} custom={2}
                  style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.85, marginBottom: 20 }}>
                  Lavish Morocco was born from a simple observation: Morocco, with its extraordinary landscapes, imperial heritage, and unparalleled hospitality, was being experienced by most visitors in the most ordinary way.
                </motion.p>
                <motion.p initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} custom={3}
                  style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.85, marginBottom: 20 }}>
                  Our founder, Ahmed Allazim, brings over a decade of experience at the intersection of luxury hospitality, lifestyle management, and finance — with leadership roles at Quintessentially and Aspire Lifestyles — to build a concierge service that would show Morocco as it truly deserves to be seen.
                </motion.p>
                <motion.p initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} custom={4}
                  style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.85, marginBottom: 40 }}>
                  Founded in 2022, hundreds of bespoke journeys have since been delivered — each crafted with precision and discretion, entirely through private networks and word-of-mouth.
                </motion.p>

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} custom={5}>
                  <Link href="/lavish-morocco/contact" className="lv-btn-gold"
                    style={{
                      display: 'inline-block', padding: '13px 32px',
                      fontSize: 10, letterSpacing: '0.42em', textTransform: 'uppercase',
                      fontWeight: 500, textDecoration: 'none',
                    }}>
                    <span>Begin Your Journey</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ background: '#0f0f0f', padding: '64px 0' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.5)' }} />
                <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>Our Principles</span>
                <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.5)' }} />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 300, color: '#F5F0E8', letterSpacing: '0.02em' }}>
                What We Stand For
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'rgba(196,163,90,0.08)' }}>
              {values.map((v, i) => (
                <motion.div key={v.title}
                  initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="group"
                  style={{ background: '#0f0f0f', padding: '36px 32px', transition: 'background 0.4s ease' }}
                >
                  <div style={{ width: 32, height: 1, background: '#C4A35A', marginBottom: 24, transition: 'width 0.4s ease' }} className="group-hover:w-12" />
                  <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 24, fontWeight: 400, color: '#F5F0E8', marginBottom: 16, lineHeight: 1.2 }}>{v.title}</h3>
                  <p style={{ fontSize: 13, color: '#6B6355', lineHeight: 1.8, transition: 'color 0.4s ease' }} className="group-hover:text-[#C8BFA8]">{v.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Symbol */}
        <section style={{ background: '#080808', padding: '100px 0', borderTop: '1px solid rgba(196,163,90,0.08)' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

              {/* Logo image */}
              <motion.div
                initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <div style={{ position: 'relative', maxWidth: 420, width: '100%' }}>
                  <div style={{
                    position: 'absolute', inset: -1,
                    background: 'radial-gradient(ellipse at center, rgba(196,163,90,0.08) 0%, transparent 70%)',
                    borderRadius: 4,
                  }} />
                  <img
                    src="/lavish/lm-logo.png"
                    alt="Lavish Morocco — The Symbol"
                    style={{ width: '100%', height: 'auto', mixBlendMode: 'lighten', display: 'block' }}
                  />
                </div>
              </motion.div>

              {/* Story text */}
              <div>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 1, background: '#C4A35A' }} />
                  <span style={{ fontSize: 10, letterSpacing: '0.5em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>The Symbol</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 'clamp(28px, 3.5vw, 46px)',
                    fontWeight: 300, color: '#F5F0E8', lineHeight: 1.15,
                    letterSpacing: '0.02em', marginBottom: 32,
                  }}
                >
                  The Deer Was Never<br />
                  <em style={{ fontStyle: 'italic', color: '#DFC08A' }}>Chosen by Accident</em>
                </motion.h2>

                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.9, marginBottom: 20 }}>
                  The stag embodies everything LavishMorocco stands for — elegance without arrogance, quiet authority, and a presence that never demands attention yet is impossible to overlook.
                </motion.p>

                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.9, marginBottom: 20 }}>
                  Across cultures, the deer symbolises nobility, grace, and the confidence to move through uncharted paths. In Morocco — where ancient tradition meets timeless luxury — that symbolism felt deeply personal.
                </motion.p>

                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.9, marginBottom: 40 }}>
                  The antlers speak of growth and prestige. The floral crown reflects Morocco itself — a land of artistry, beauty, and timeless elegance woven into every experience we create.
                </motion.p>

                {/* Closing quote */}
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    borderLeft: '2px solid #C4A35A',
                    paddingLeft: 24,
                    marginTop: 8,
                  }}
                >
                  <p style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 20, fontWeight: 300, fontStyle: 'italic',
                    color: '#DFC08A', lineHeight: 1.7, letterSpacing: '0.02em',
                  }}>
                    True luxury is not loud.<br />
                    It is graceful. Intentional. Unforgettable.
                  </p>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* Founder Bio */}
        <section style={{ background: '#080808', padding: '64px 0' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.5)' }} />
                <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>The Founder</span>
                <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.5)' }} />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 300, color: '#F5F0E8', letterSpacing: '0.02em' }}>
                The Vision Behind<br /><em style={{ fontStyle: 'italic', color: '#DFC08A' }}>Lavish Morocco</em>
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 lg:gap-24 items-start">
              {/* Portrait */}
              <motion.div initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="lv-img-zoom" style={{ position: 'relative' }}>
                <div style={{ aspectRatio: '3/4', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src="/ahmed.png"
                    alt="Ahmed Allazim — Founder & Director"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block', filter: 'brightness(0.88) saturate(0.9)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(8,8,8,0.78) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 28, left: 28 }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase', color: '#C4A35A', marginBottom: 6 }}>Founder & Director</div>
                    <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 26, fontWeight: 300, color: '#F5F0E8', letterSpacing: '0.02em' }}>Ahmed Allazim</div>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: -10, left: -10, width: 44, height: 44, borderTop: '2px solid rgba(196,163,90,0.45)', borderLeft: '2px solid rgba(196,163,90,0.45)' }} />
                <div style={{ position: 'absolute', bottom: -10, right: -10, width: 44, height: 44, borderBottom: '2px solid rgba(196,163,90,0.45)', borderRight: '2px solid rgba(196,163,90,0.45)' }} />
              </motion.div>

              {/* Bio text */}
              <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ paddingTop: 8 }}>
                <p style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.9, marginBottom: 20 }}>
                  Born with a global outlook and a deep appreciation for refined living, Ahmed Allazim brings over a decade of experience at the intersection of luxury hospitality, lifestyle management, and finance. His career spans leading international concierge and lifestyle brands such as Quintessentially and Aspire Lifestyles, where he curated bespoke experiences for high-net-worth individuals across Europe and the Middle East.
                </p>
                <p style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.9, marginBottom: 20 }}>
                  Throughout his journey, Ahmed has developed an instinct for discretion, personalisation, and excellence — managing complex client portfolios, orchestrating seamless global travel, and delivering highly tailored lifestyle solutions. Complementing this is his strong financial background, providing him with a strategic understanding of wealth, investment priorities, and the expectations of sophisticated clientele.
                </p>
                <p style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.9, marginBottom: 20 }}>
                  What inspired Lavish Morocco was not just opportunity — but perspective. Having experienced the highest standards of service globally, Ahmed recognised that Morocco's richness — its culture, landscapes, and heritage — was often presented without the level of refinement it truly deserves. He envisioned a new standard: one that merges authentic Moroccan experiences with world-class execution.
                </p>
                <p style={{ fontSize: 15, color: '#C8BFA8', lineHeight: 1.9, marginBottom: 36 }}>
                  Founded in 2022, Lavish Morocco is built on a singular philosophy: to redefine how Morocco is experienced by the world's most discerning travellers. In a short time, the company has delivered hundreds of bespoke journeys, each crafted with precision, discretion, and an unwavering commitment to excellence — entirely through private networks and word-of-mouth.
                </p>

                <div style={{ display: 'flex', gap: 48, paddingTop: 32, borderTop: '1px solid rgba(196,163,90,0.15)' }}>
                  {[
                    { stat: '10+', label: 'Years of Expertise' },
                    { stat: 'UHNW', label: 'Client Focus' },
                    { stat: '2022', label: 'Founded' },
                  ].map(({ stat, label }) => (
                    <div key={label}>
                      <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 36, fontWeight: 300, color: '#C4A35A', lineHeight: 1 }}>{stat}</div>
                      <div style={{ fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#6B6355', marginTop: 6 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section style={{ background: '#0a0a0a', padding: '64px 0', borderTop: '1px solid rgba(196,163,90,0.08)' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
            <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.5)' }} />
                <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>Our Mission</span>
                <div style={{ width: 40, height: 1, background: 'rgba(196,163,90,0.5)' }} />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 300, color: '#F5F0E8', letterSpacing: '0.02em', lineHeight: 1.15, marginBottom: 32 }}>
                To reveal Morocco in its<br /><em style={{ fontStyle: 'italic', color: '#DFC08A' }}>most extraordinary form</em>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.85, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 16, color: '#C8BFA8', lineHeight: 1.9, marginBottom: 20 }}>
                We exist to connect the world's most discerning travellers with the true depth of Morocco — its landscapes, its heritage, its people, and its quietly extraordinary way of life. Not as tourists. As honoured guests.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.85, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 16, color: '#C8BFA8', lineHeight: 1.9 }}>
                Every experience we design is an act of curation — removing the ordinary, amplifying the remarkable, and ensuring that every moment is entirely, unmistakably yours.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section style={{ background: '#0f0f0f', padding: '64px 0' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px' }} className="px-6 lg:px-12">
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7 }}
                style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 40, height: 1, background: '#C4A35A' }} />
                <span style={{ fontSize: 10, letterSpacing: '0.55em', textTransform: 'uppercase', color: '#C4A35A', fontWeight: 500 }}>Our Journey</span>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 300, color: '#F5F0E8', letterSpacing: '0.02em', marginBottom: 28 }}>
                From Vision to Legacy
              </motion.h2>

              <div style={{ borderLeft: '1px solid rgba(196,163,90,0.25)', paddingLeft: 40, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {milestones.map((m, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: 'relative', paddingBottom: 36 }}
                  >
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', left: -49,
                      top: 4, width: 10, height: 10,
                      borderRadius: '50%',
                      background: '#C4A35A',
                      border: '2px solid #080808',
                    }} />
                    <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#C4A35A', marginBottom: 8 }}>{m.year}</div>
                    <p style={{ fontSize: 14, color: '#C8BFA8', lineHeight: 1.7 }}>{m.event}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  )
}
