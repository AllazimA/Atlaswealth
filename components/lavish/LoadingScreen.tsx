'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#080808',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Logo reveal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <div
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 48,
                fontWeight: 300,
                letterSpacing: '0.5em',
                textTransform: 'uppercase',
                color: '#F5F0E8',
                lineHeight: 1,
              }}
            >
              Lavish
            </div>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.9em',
                textTransform: 'uppercase',
                color: '#C4A35A',
                marginTop: 8,
              }}
            >
              Morocco
            </div>
          </motion.div>

          {/* Gold line sweep */}
          <div style={{ position: 'relative', width: 180, height: 1, background: 'rgba(196,163,90,0.2)', overflow: 'hidden' }}>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.5 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)',
              }}
            />
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.4 }}
            style={{
              marginTop: 28,
              fontSize: 10,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: '#6B6355',
            }}
          >
            Your Wish Is Our Command
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
