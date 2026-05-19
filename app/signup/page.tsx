'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signupWithEmail } from '@/lib/auth'
import AtlasWealthNavbar from '@/components/AtlasWealthNavbar'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signupWithEmail(email, password, displayName)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-navy-900 min-h-screen">
      <AtlasWealthNavbar />

      <div className="flex items-center justify-center min-h-screen px-6 pt-20 pb-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-navy-900 font-bold text-lg">
                AW
              </div>
              <span className="text-white font-semibold text-lg">Atlas Wealth</span>
            </div>
            <h1 className="text-3xl font-light text-white text-center mb-2">Create Account</h1>
            <p className="text-gray-400 text-center">Join thousands of investors managing their wealth</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg bg-navy-800 border border-gold-500/20 text-white placeholder-gray-500 focus:border-gold-500/50 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg bg-navy-800 border border-gold-500/20 text-white placeholder-gray-500 focus:border-gold-500/50 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-navy-800 border border-gold-500/20 text-white placeholder-gray-500 focus:border-gold-500/50 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-navy-800 border border-gold-500/20 text-white placeholder-gray-500 focus:border-gold-500/50 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Terms & Security */}
          <div className="mt-8 space-y-4 text-center">
            <p className="text-gray-500 text-xs">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-gold-400 hover:text-gold-300">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-gold-400 hover:text-gold-300">
                Privacy Policy
              </Link>
            </p>
            <p className="text-gray-400 text-xs">
              🔒 Your account is protected by enterprise-grade Firebase authentication
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
