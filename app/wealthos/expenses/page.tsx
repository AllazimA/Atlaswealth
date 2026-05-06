'use client'

import { useState } from 'react'
import { useWealth } from '@/components/wealthos/WealthContext'
import Modal from '@/components/wealthos/Modal'
import { Plus, Pencil, Trash2, Search, SlidersHorizontal, TrendingDown } from 'lucide-react'
import type { Expense, ExpenseCategory } from '@/components/wealthos/types'

const SUBCATEGORIES = [
  'housing', 'transportation', 'food', 'utilities', 'healthcare',
  'insurance', 'clothing', 'entertainment', 'dining', 'travel',
  'education', 'subscriptions', 'shopping', 'savings', 'investment', 'other'
]

const EMOJI_MAP: Record<string, string> = {
  housing: '🏠', transportation: '🚗', food: '🛒', utilities: '💡',
  healthcare: '🏥', insurance: '🛡️', clothing: '👕', entertainment: '🎬',
  dining: '🍽️', travel: '✈️', education: '📚', subscriptions: '📱',
  shopping: '🛍️', savings: '💰', investment: '📈', other: '📦'
}

const BLANK = {
  name: '', amount: '', category: 'needs' as ExpenseCategory,
  subcategory: 'other', date: new Date().toISOString().split('T')[0], notes: ''
}

type Tab = 'all' | ExpenseCategory

export default function ExpensesPage() {
  const { data, addExpense, updateExpense, deleteExpense, fmt } = useWealth()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState(BLANK)
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = data.expenses.filter(e => {
    const matchTab = tab === 'all' || e.category === tab
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.subcategory.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0)
  const needs = data.expenses.filter(e => e.category === 'needs').reduce((s, e) => s + e.amount, 0)
  const wants = data.expenses.filter(e => e.category === 'wants').reduce((s, e) => s + e.amount, 0)
  const savings = data.expenses.filter(e => e.category === 'savings').reduce((s, e) => s + e.amount, 0)

  function openAdd() { setEditing(null); setForm(BLANK); setOpen(true) }
  function openEdit(e: Expense) {
    setEditing(e)
    setForm({ name: e.name, amount: String(e.amount), category: e.category, subcategory: e.subcategory, date: e.date, notes: e.notes || '' })
    setOpen(true)
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const payload: Omit<Expense, 'id'> = {
      name: form.name.trim(), amount: parseFloat(form.amount),
      category: form.category, subcategory: form.subcategory,
      date: form.date, notes: form.notes.trim(),
      emoji: EMOJI_MAP[form.subcategory] || '📦'
    }
    if (!payload.name || isNaN(payload.amount)) return
    if (editing) updateExpense(editing.id, payload)
    else addExpense(payload)
    setOpen(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Expenses</h1>
          <p className="text-gray-400 mt-1">Track and categorize all your spending</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-400 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-rose-600 to-red-800 rounded-2xl p-5">
          <div className="text-rose-200 text-sm mb-2">Total Expenses</div>
          <div className="text-2xl font-bold text-white">{fmt(totalExpenses)}</div>
          <TrendingDown className="w-5 h-5 text-rose-300 mt-2" />
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-gray-400 text-sm">Needs</span>
          </div>
          <div className="text-2xl font-bold text-white">{fmt(needs)}</div>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-gray-400 text-sm">Wants</span>
          </div>
          <div className="text-2xl font-bold text-white">{fmt(wants)}</div>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-gray-400 text-sm">Savings</span>
          </div>
          <div className="text-2xl font-bold text-white">{fmt(savings)}</div>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 placeholder-gray-600"
            placeholder="Search expenses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-colors ${showFilters ? 'border-amber-500/50 text-amber-400' : 'border-white/10 text-gray-400 hover:text-white'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {tab !== 'all' && <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-bold">1</span>}
        </button>
      </div>

      {/* Expense table */}
      <div className="bg-[#1a1f2e] rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-gray-400" />
            <span className="text-white font-semibold">Expense History ({filtered.length})</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {(['all', 'needs', 'wants', 'savings'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <TrendingDown className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <div className="text-gray-500">No expenses found</div>
            <button onClick={openAdd} className="mt-4 text-rose-400 text-sm hover:text-rose-300 transition-colors">
              + Add your first expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(e => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-transparent accent-amber-500" />
                <div className="w-9 h-9 rounded-xl bg-[#111318] flex items-center justify-center text-lg flex-shrink-0">
                  {e.emoji || EMOJI_MAP[e.subcategory] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm">{e.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      e.category === 'needs' ? 'bg-blue-500/10 text-blue-400' :
                      e.category === 'wants' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>{e.category}</span>
                    <span className="text-gray-500 text-xs">{e.subcategory}</span>
                    <span className="text-gray-600 text-xs flex items-center gap-1">
                      📅 {new Date(e.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="text-rose-400 font-semibold">-{fmt(e.amount)}</div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(e)} className="text-gray-600 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteExpense(e.id)} className="text-gray-600 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add expense FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:bg-rose-400 transition-colors"
      >
        <Plus className="w-5 h-5" />
      </button>

      {open && (
        <Modal title={editing ? 'Edit Expense' : 'Add Expense'} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Expense Name</label>
              <input
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/50"
                placeholder="e.g. Rent, Groceries, Netflix"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Amount</label>
              <input
                type="number" step="0.01" min="0"
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/50"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-sm block mb-1.5">Category</label>
                <select
                  className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/50"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as ExpenseCategory })}
                >
                  <option value="needs">Needs</option>
                  <option value="wants">Wants</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1.5">Subcategory</label>
                <select
                  className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/50"
                  value={form.subcategory}
                  onChange={e => setForm({ ...form, subcategory: e.target.value })}
                >
                  {SUBCATEGORIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Date</label>
              <input
                type="date"
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/50"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Notes (optional)</label>
              <input
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500/50"
                placeholder="Optional notes"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-400 text-sm transition-colors">{editing ? 'Update' : 'Add'} Expense</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
