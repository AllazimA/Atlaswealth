'use client'

import { useState } from 'react'
import { useWealth } from '@/components/wealthos/WealthContext'
import Modal from '@/components/wealthos/Modal'
import { Plus, Pencil, Trash2, Target, CheckCircle, PauseCircle } from 'lucide-react'
import type { Goal, GoalStatus } from '@/components/wealthos/types'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#ec4899', '#f97316']

const BLANK = { name: '', target: '', current: '', deadline: '', category: 'Savings', status: 'active' as GoalStatus, color: COLORS[0] }

export default function GoalsPage() {
  const { data, addGoal, updateGoal, deleteGoal, fmt } = useWealth()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [form, setForm] = useState(BLANK)

  const active = data.goals.filter(g => g.status === 'active')
  const completed = data.goals.filter(g => g.status === 'completed')

  function openAdd() { setEditing(null); setForm(BLANK); setOpen(true) }
  function openEdit(g: Goal) {
    setEditing(g)
    setForm({ name: g.name, target: String(g.target), current: String(g.current), deadline: g.deadline, category: g.category, status: g.status, color: g.color })
    setOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { name: form.name.trim(), target: parseFloat(form.target), current: parseFloat(form.current || '0'), deadline: form.deadline, category: form.category, status: form.status, color: form.color }
    if (!payload.name || isNaN(payload.target)) return
    if (editing) updateGoal(editing.id, payload)
    else addGoal(payload)
    setOpen(false)
  }

  const GoalCard = ({ g }: { g: Goal }) => {
    const pct = Math.min((g.current / g.target) * 100, 100)
    const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000)
    return (
      <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: g.color + '20', border: `1px solid ${g.color}40` }}>
              <Target className="w-5 h-5" style={{ color: g.color }} />
            </div>
            <div>
              <div className="text-white font-semibold">{g.name}</div>
              <div className="text-gray-500 text-xs">{g.category}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openEdit(g)} className="text-gray-500 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => deleteGoal(g.id)} className="text-gray-500 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-2xl font-bold text-white">{fmt(g.current)}</div>
            <div className="text-gray-500 text-sm">of {fmt(g.target)}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: g.color }}>{pct.toFixed(0)}%</div>
            <div className="text-gray-500 text-xs">
              {g.status === 'completed' ? 'Completed!' : daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
            </div>
          </div>
        </div>

        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: g.color }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-gray-500 text-xs">Target: {new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div className="flex gap-2">
            {g.status !== 'completed' && (
              <button
                onClick={() => updateGoal(g.id, { status: 'completed', current: g.target })}
                className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                Mark Done
              </button>
            )}
            {g.status === 'active' && (
              <button
                onClick={() => updateGoal(g.id, { status: 'paused' })}
                className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
              >
                Pause
              </button>
            )}
            {g.status === 'paused' && (
              <button
                onClick={() => updateGoal(g.id, { status: 'active' })}
                className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                Resume
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Goals</h1>
          <p className="text-gray-400 mt-1">Track progress toward your financial milestones</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-400 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{active.length}</div>
            <div className="text-gray-400 text-sm">Active Goals</div>
          </div>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{completed.length}</div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <PauseCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{data.goals.filter(g => g.status === 'paused').length}</div>
            <div className="text-gray-400 text-sm">Paused</div>
          </div>
        </div>
      </div>

      {data.goals.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1f2e] rounded-2xl border border-white/5">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <div className="text-gray-400 text-lg font-medium mb-2">No goals yet</div>
          <div className="text-gray-600 text-sm mb-6">Set financial milestones to stay motivated</div>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-sm">+ Add First Goal</button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-purple-400" /> Active Goals</h2>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {active.map(g => <GoalCard key={g.id} g={g} />)}
              </div>
            </>
          )}
          {completed.length > 0 && (
            <>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Completed</h2>
              <div className="grid grid-cols-3 gap-4">
                {completed.map(g => <GoalCard key={g.id} g={g} />)}
              </div>
            </>
          )}
        </>
      )}

      {open && (
        <Modal title={editing ? 'Edit Goal' : 'Add Goal'} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Goal Name</label>
              <input
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                placeholder="e.g. Emergency Fund, Down Payment"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-sm block mb-1.5">Target Amount</label>
                <input
                  type="number" step="0.01" min="0"
                  className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="10000"
                  value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1.5">Current Amount</label>
                <input
                  type="number" step="0.01" min="0"
                  className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="0"
                  value={form.current}
                  onChange={e => setForm({ ...form, current: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-sm block mb-1.5">Deadline</label>
                <input
                  type="date"
                  className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1.5">Category</label>
                <input
                  className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="e.g. Savings, Travel"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Color</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent' }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-400 text-sm transition-colors">{editing ? 'Update' : 'Add'} Goal</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
