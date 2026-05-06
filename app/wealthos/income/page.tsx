'use client'

import { useState } from 'react'
import { useWealth } from '@/components/wealthos/WealthContext'
import Modal from '@/components/wealthos/Modal'
import { Plus, Pencil, Trash2, TrendingUp, Calendar } from 'lucide-react'
import type { IncomeSource, IncomeFrequency, IncomeCategory } from '@/components/wealthos/types'

function toMonthly(amount: number, frequency: IncomeFrequency): number {
  switch (frequency) {
    case 'weekly': return amount * 52 / 12
    case 'biweekly': return amount * 26 / 12
    case 'monthly': return amount
    case 'annual': return amount / 12
  }
}

const FREQ_LABELS: Record<IncomeFrequency, string> = {
  weekly: 'weekly', biweekly: 'bi-weekly', monthly: 'monthly', annual: 'annual'
}

const CAT_COLORS: Record<IncomeCategory, string> = {
  primary: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  secondary: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  passive: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  bonus: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
}

const BLANK = { name: '', amount: '', frequency: 'monthly' as IncomeFrequency, category: 'primary' as IncomeCategory, description: '' }

export default function IncomePage() {
  const { data, addIncomeSource, updateIncomeSource, deleteIncomeSource, totalMonthlyIncome, fmt } = useWealth()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<IncomeSource | null>(null)
  const [form, setForm] = useState(BLANK)

  function openAdd() { setEditing(null); setForm(BLANK); setOpen(true) }
  function openEdit(s: IncomeSource) {
    setEditing(s)
    setForm({ name: s.name, amount: String(s.amount), frequency: s.frequency, category: s.category, description: s.description || '' })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { name: form.name.trim(), amount: parseFloat(form.amount), frequency: form.frequency, category: form.category, description: form.description.trim() }
    if (!payload.name || isNaN(payload.amount)) return
    if (editing) updateIncomeSource(editing.id, payload)
    else addIncomeSource(payload)
    setOpen(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Income Sources</h1>
          <p className="text-gray-400 mt-1">Track and manage all your income streams</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Income Source
        </button>
      </div>

      {/* Total card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 mb-8 flex items-center justify-between">
        <div>
          <div className="text-emerald-100 text-sm mb-2">Total Monthly Income</div>
          <div className="text-5xl font-bold text-white">{fmt(totalMonthlyIncome)}</div>
          <div className="text-emerald-200 text-sm mt-2">From {data.incomeSources.length} active source{data.incomeSources.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Income source cards */}
      {data.incomeSources.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1f2e] rounded-2xl border border-white/5">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <div className="text-gray-400 text-lg font-medium mb-2">No income sources yet</div>
          <div className="text-gray-600 text-sm mb-6">Add your first income stream to get started</div>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm">
            + Add Income Source
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {data.incomeSources.map(s => (
            <div key={s.id} className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <span className="text-emerald-400 text-lg">$</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{s.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CAT_COLORS[s.category]}`}>{s.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-gray-500 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteIncomeSource(s.id)} className="text-gray-500 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{fmt(s.amount)}</div>
              <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
                <Calendar className="w-3.5 h-3.5" /> {FREQ_LABELS[s.frequency]}
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="text-gray-500 text-xs mb-1">Monthly equivalent</div>
                <div className="text-emerald-400 font-semibold">{fmt(toMonthly(s.amount, s.frequency))}</div>
              </div>
              {s.description && <p className="text-gray-500 text-xs mt-3">{s.description}</p>}
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title={editing ? 'Edit Income Source' : 'Add Income Source'} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Source Name</label>
              <input
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                placeholder="e.g. Salary, Freelance, Dividends"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Frequency</label>
              <select
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                value={form.frequency}
                onChange={e => setForm({ ...form, frequency: e.target.value as IncomeFrequency })}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Category</label>
              <select
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as IncomeCategory })}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="passive">Passive</option>
                <option value="bonus">Bonus</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Description (optional)</label>
              <input
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                placeholder="Brief description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 text-sm transition-colors">
                {editing ? 'Update' : 'Add'} Source
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
