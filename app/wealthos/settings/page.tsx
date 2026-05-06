'use client'

import { useState } from 'react'
import { useWealth } from '@/components/wealthos/WealthContext'
import { Settings, Trash2, Download, AlertTriangle, User, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { data, updateSettings } = useWealth()
  const settings = data.settings
  const [confirmReset, setConfirmReset] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currency, setCurrency] = useState(settings.currency || 'USD')
  const [displayName, setDisplayName] = useState(settings.displayName || 'A A')
  const [email, setEmail] = useState(settings.email || 'a.allazim@gmail.com')
  const [notifications, setNotifications] = useState(settings.notifications ?? true)

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'wealthos-backup.json'; a.click()
    URL.revokeObjectURL(url)
  }

  function resetData() {
    localStorage.removeItem('wealthos_data')
    window.location.reload()
  }

  function save() {
    updateSettings({ currency, displayName, email, notifications })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const CURRENCIES = [
    { code: 'USD', label: 'USD — US Dollar' },
    { code: 'AED', label: 'AED — UAE Dirham' },
    { code: 'EUR', label: 'EUR — Euro' },
    { code: 'GBP', label: 'GBP — British Pound' },
    { code: 'SAR', label: 'SAR — Saudi Riyal' },
    { code: 'QAR', label: 'QAR — Qatari Riyal' },
    { code: 'KWD', label: 'KWD — Kuwaiti Dinar' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your WealthOS preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" /> Profile
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold">
              {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-semibold text-lg">{displayName}</div>
              <div className="text-gray-400 text-sm">{email}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Display Name</label>
              <input
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Email</label>
              <input
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" /> Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Currency</label>
              <select
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              {currency !== (settings.currency || 'USD') && (
                <p className="text-amber-400 text-xs mt-1.5">⚠ Click "Save Changes" to apply the new currency across all pages.</p>
              )}
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-white text-sm font-medium">Budget Notifications</div>
                <div className="text-gray-500 text-xs">Alert when approaching budget limits</div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-amber-500' : 'bg-white/10'} relative`}
              >
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all" style={{ left: notifications ? '22px' : '2px' }} />
              </button>
            </div>
          </div>
          <button
            onClick={save}
            className={`mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${saved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500 text-black hover:bg-amber-400'}`}
          >
            {saved ? '✓ Saved — currency updated!' : 'Save Changes'}
          </button>
        </div>

        {/* Data */}
        <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Data & Privacy
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-[#111318] rounded-xl">
              <div>
                <div className="text-white text-sm font-medium">Export Data</div>
                <div className="text-gray-500 text-xs">Download all your WealthOS data as JSON</div>
              </div>
              <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-sm transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
              <div>
                <div className="text-white text-sm font-medium">Reset All Data</div>
                <div className="text-gray-500 text-xs">Permanently delete all WealthOS data</div>
              </div>
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm transition-colors">
                  <Trash2 className="w-4 h-4" /> Reset
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirmReset(false)} className="px-3 py-2 rounded-xl border border-white/10 text-gray-400 text-sm">Cancel</button>
                  <button onClick={resetData} className="px-3 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold">Confirm</button>
                </div>
              )}
            </div>
          </div>
          {confirmReset && (
            <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4" /> This action cannot be undone. All your data will be permanently deleted.
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-4">Data Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Income Sources', value: data.incomeSources.length },
              { label: 'Expenses', value: data.expenses.length },
              { label: 'Accounts', value: data.accounts.length },
              { label: 'Investments', value: data.investments.length },
              { label: 'Goals', value: data.goals.length },
              { label: 'Transactions', value: data.accounts.reduce((s, a) => s + a.transactions.length, 0) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#111318] rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">{value}</div>
                <div className="text-gray-500 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
