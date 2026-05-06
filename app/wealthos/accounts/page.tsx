'use client'

import { useState } from 'react'
import { useWealth } from '@/components/wealthos/WealthContext'
import Modal from '@/components/wealthos/Modal'
import { Plus, Pencil, Trash2, Building2, Upload, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { Account, AccountType } from '@/components/wealthos/types'

const TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking', savings: 'Savings', credit_card: 'Credit Card',
  investment: 'Investment', other: 'Other'
}

const BLANK = { name: '', bank: '', type: 'checking' as AccountType, balance: '', lastUpdated: new Date().toISOString().split('T')[0] }

export default function AccountsPage() {
  const { data, addAccount, updateAccount, deleteAccount, fmt } = useWealth()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [form, setForm] = useState(BLANK)
  const [viewAccount, setViewAccount] = useState<Account | null>(null)

  const totalBalance = data.accounts.reduce((s, a) => s + a.balance, 0)

  function openAdd() { setEditing(null); setForm(BLANK); setOpen(true) }
  function openEdit(a: Account) {
    setEditing(a)
    setForm({ name: a.name, bank: a.bank, type: a.type, balance: String(a.balance), lastUpdated: a.lastUpdated })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { name: form.name.trim(), bank: form.bank.trim(), type: form.type, balance: parseFloat(form.balance), lastUpdated: form.lastUpdated }
    if (!payload.name || !payload.bank || isNaN(payload.balance)) return
    if (editing) updateAccount(editing.id, payload)
    else addAccount(payload)
    setOpen(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Accounts</h1>
          <p className="text-gray-400 mt-1">Manage your connected bank accounts</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {data.accounts.length > 0 && (
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5 mb-6 flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm mb-1">Total Balance Across All Accounts</div>
            <div className="text-3xl font-bold text-white">{fmt(totalBalance)}</div>
          </div>
          <Building2 className="w-10 h-10 text-gray-600" />
        </div>
      )}

      {data.accounts.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1f2e] rounded-2xl border border-white/5">
          <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <div className="text-gray-400 text-lg font-medium mb-2">No accounts yet</div>
          <div className="text-gray-600 text-sm mb-6">Add your bank accounts to track balances</div>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm">
            + Add Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {data.accounts.map(a => (
            <div key={a.id} className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{a.name}</div>
                    <div className="text-gray-500 text-xs">{a.bank}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(a)} className="text-gray-500 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteAccount(a.id)} className="text-gray-500 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="text-gray-400 text-xs mb-1">Balance</div>
              <div className={`text-3xl font-bold mb-1 ${a.balance >= 0 ? 'text-white' : 'text-rose-400'}`}>{fmt(a.balance)}</div>
              <div className="text-gray-500 text-xs mb-4">Last updated: {new Date(a.lastUpdated).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{TYPE_LABELS[a.type]}</span>
              </div>

              {a.transactions.length > 0 && (
                <div className="pt-3 border-t border-white/5 space-y-2">
                  {a.transactions.slice(-3).reverse().map(t => (
                    <div key={t.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {t.type === 'credit'
                          ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                          : <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />}
                        <span className="text-gray-400 text-xs truncate max-w-[120px]">{t.description}</span>
                      </div>
                      <span className={`text-xs font-medium ${t.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setViewAccount(a)}
                className="w-full mt-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> Import Transactions
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title={editing ? 'Edit Account' : 'Add Account'} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Account Name</label>
              <input
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                placeholder="e.g. Premier Account, Main Checking"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Bank Name</label>
              <input
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                placeholder="e.g. HSBC, Chase, FAB"
                value={form.bank}
                onChange={e => setForm({ ...form, bank: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Account Type</label>
              <select
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as AccountType })}
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit_card">Credit Card</option>
                <option value="investment">Investment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Current Balance</label>
              <input
                type="number" step="0.01"
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                placeholder="0.00"
                value={form.balance}
                onChange={e => setForm({ ...form, balance: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Last Updated</label>
              <input
                type="date"
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                value={form.lastUpdated}
                onChange={e => setForm({ ...form, lastUpdated: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 text-sm transition-colors">{editing ? 'Update' : 'Add'} Account</button>
            </div>
          </form>
        </Modal>
      )}

      {viewAccount && (
        <Modal title={`${viewAccount.name} — Import Transactions`} onClose={() => setViewAccount(null)}>
          <div className="text-center py-8">
            <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 mb-2">CSV Import</div>
            <p className="text-gray-600 text-sm mb-6">Upload a CSV file from your bank to import transactions automatically.</p>
            <label className="cursor-pointer px-6 py-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm border border-amber-500/20">
              Choose CSV File
              <input type="file" accept=".csv" className="hidden" onChange={() => setViewAccount(null)} />
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
