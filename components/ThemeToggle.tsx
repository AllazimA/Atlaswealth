'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-12 h-6 rounded-full p-1 transition-colors duration-300 border border-gold-500/30"
      style={{ background: isDark ? 'rgba(201,169,110,0.15)' : 'rgba(201,169,110,0.3)' }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-4 h-4 rounded-full flex items-center justify-center"
        animate={{ x: isDark ? 0 : 24, backgroundColor: isDark ? '#c9a96e' : '#0d1b3e' }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {isDark
          ? <Moon size={10} className="text-navy-900" />
          : <Sun size={10} className="text-gold-300" />
        }
      </motion.div>
    </motion.button>
  )
}
