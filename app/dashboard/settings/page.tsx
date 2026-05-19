'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LogOut, User, Lock, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, logoutUser } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logoutUser()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
      console.error(error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* ── Account Information ───────────────────────────────────────────── */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">Account Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="px-4 py-2 bg-slate-50 rounded-md border border-slate-300">
              <p className="text-slate-900">{user?.email}</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">Cannot be changed</p>
          </div>

          {user?.displayName && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Display Name
              </label>
              <div className="px-4 py-2 bg-slate-50 rounded-md border border-slate-300">
                <p className="text-slate-900">{user.displayName}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Account Created
            </label>
            <div className="px-4 py-2 bg-slate-50 rounded-md border border-slate-300">
              <p className="text-slate-900">
                {user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Last Sign-In
            </label>
            <div className="px-4 py-2 bg-slate-50 rounded-md border border-slate-300">
              <p className="text-slate-900">
                {user?.metadata?.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Security ──────────────────────────────────────────────────────── */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-slate-900">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              Your account is secured with Firebase Authentication. To change your password, please use Firebase's password reset functionality.
            </p>
          </div>

          <Button
            variant="outline"
            className="border-slate-300"
            disabled
          >
            Change Password (Not Available Yet)
          </Button>
        </div>
      </Card>

      {/* ── Preferences ───────────────────────────────────────────────────── */}
      <Card className="p-6 bg-white border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Default Currency
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900">
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
              <option>GBP - British Pound</option>
              <option>AED - UAE Dirham</option>
              <option>SAR - Saudi Riyal</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-medium text-slate-900">
                Email notifications for portfolio updates
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-medium text-slate-900">
                Daily market summary
              </span>
            </label>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700 mt-4">
            Save Preferences
          </Button>
        </div>
      </Card>

      {/* ── Data & Privacy ────────────────────────────────────────────────── */}
      <Card className="p-6 bg-white border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Data & Privacy</h2>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Your data is stored securely in Firestore with end-to-end encryption. You can:
          </p>

          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start border-slate-300">
              📥 Export My Data
            </Button>
            <Button variant="outline" className="w-full justify-start border-slate-300">
              📋 Download Data Report
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Danger Zone ───────────────────────────────────────────────────── */}
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-red-900 mb-2">Log Out</h3>
            <p className="text-sm text-red-800 mb-3">
              Sign out of your account on this device.
            </p>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? 'Logging Out...' : 'Log Out'}
            </Button>
          </div>

          <div className="border-t border-red-200 pt-4">
            <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
            <p className="text-sm text-red-800 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              disabled
              className="border-red-300 text-red-600"
            >
              Delete My Account (Not Available)
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Help & Support ────────────────────────────────────────────────── */}
      <Card className="p-6 bg-slate-50 border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Help & Support</h2>
        <p className="text-sm text-slate-600 mb-4">
          Need help? Check out our resources:
        </p>
        <div className="space-y-2">
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">
            → Documentation & Guides
          </a>
          <br />
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">
            → Contact Support
          </a>
          <br />
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">
            → Frequently Asked Questions
          </a>
        </div>
      </Card>
    </div>
  )
}
