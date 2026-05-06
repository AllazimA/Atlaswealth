'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { WealthData, WealthSettings, IncomeSource, Expense, Account, Investment, Goal, Budget, Transaction } from './types'

const STORAGE_KEY = 'wealthos_data'

const defaultSettings: WealthSettings = {
  currency: 'USD',
  displayName: 'A A',
  email: 'a.allazim@gmail.com',
  notifications: true,
}

const defaultData: WealthData = {
  incomeSources: [],
  expenses: [],
  accounts: [],
  investments: [],
  goals: [],
  budgets: [],
  settings: defaultSettings,
}

interface WealthContextType {
  data: WealthData
  addIncomeSource: (s: Omit<IncomeSource, 'id' | 'createdAt'>) => void
  updateIncomeSource: (id: string, s: Partial<IncomeSource>) => void
  deleteIncomeSource: (id: string) => void
  addExpense: (e: Omit<Expense, 'id'>) => void
  updateExpense: (id: string, e: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  addAccount: (a: Omit<Account, 'id' | 'transactions'>) => void
  updateAccount: (id: string, a: Partial<Account>) => void
  deleteAccount: (id: string) => void
  addTransaction: (accountId: string, t: Omit<Transaction, 'id'>) => void
  addInvestment: (i: Omit<Investment, 'id'>) => void
  updateInvestment: (id: string, i: Partial<Investment>) => void
  deleteInvestment: (id: string) => void
  addGoal: (g: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, g: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addBudget: (b: Omit<Budget, 'id'>) => void
  updateBudget: (id: string, b: Partial<Budget>) => void
  deleteBudget: (id: string) => void
  updateSettings: (s: Partial<WealthSettings>) => void
  totalMonthlyIncome: number
  totalMonthlyExpenses: number
  netBalance: number
  fmt: (n: number) => string
}

const WealthContext = createContext<WealthContextType | null>(null)

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function toMonthly(amount: number, frequency: IncomeSource['frequency']): number {
  switch (frequency) {
    case 'weekly': return amount * 52 / 12
    case 'biweekly': return amount * 26 / 12
    case 'monthly': return amount
    case 'annual': return amount / 12
  }
}

function makeFmt(currency: string) {
  return (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

export function WealthProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WealthData>(() => {
    if (typeof window === 'undefined') return defaultData
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...defaultData,
          ...parsed,
          settings: { ...defaultSettings, ...(parsed.settings || {}) },
        }
      }
    } catch {}
    return defaultData
  })

  function save(next: WealthData) {
    setData(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  const totalMonthlyIncome = data.incomeSources.reduce(
    (sum, s) => sum + toMonthly(s.amount, s.frequency), 0
  )
  const totalMonthlyExpenses = data.expenses
    .filter(e => {
      const d = new Date(e.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, e) => sum + e.amount, 0)
  const netBalance = totalMonthlyIncome - totalMonthlyExpenses

  const fmt = makeFmt(data.settings?.currency || 'USD')

  return (
    <WealthContext.Provider value={{
      data,
      totalMonthlyIncome,
      totalMonthlyExpenses,
      netBalance,
      fmt,

      addIncomeSource: (s) => save({ ...data, incomeSources: [...data.incomeSources, { ...s, id: uid(), createdAt: new Date().toISOString() }] }),
      updateIncomeSource: (id, s) => save({ ...data, incomeSources: data.incomeSources.map(x => x.id === id ? { ...x, ...s } : x) }),
      deleteIncomeSource: (id) => save({ ...data, incomeSources: data.incomeSources.filter(x => x.id !== id) }),

      addExpense: (e) => save({ ...data, expenses: [...data.expenses, { ...e, id: uid() }] }),
      updateExpense: (id, e) => save({ ...data, expenses: data.expenses.map(x => x.id === id ? { ...x, ...e } : x) }),
      deleteExpense: (id) => save({ ...data, expenses: data.expenses.filter(x => x.id !== id) }),

      addAccount: (a) => save({ ...data, accounts: [...data.accounts, { ...a, id: uid(), transactions: [] }] }),
      updateAccount: (id, a) => save({ ...data, accounts: data.accounts.map(x => x.id === id ? { ...x, ...a } : x) }),
      deleteAccount: (id) => save({ ...data, accounts: data.accounts.filter(x => x.id !== id) }),
      addTransaction: (accountId, t) => save({
        ...data,
        accounts: data.accounts.map(a => a.id === accountId
          ? { ...a, transactions: [...a.transactions, { ...t, id: uid() }] }
          : a)
      }),

      addInvestment: (i) => save({ ...data, investments: [...data.investments, { ...i, id: uid() }] }),
      updateInvestment: (id, i) => save({ ...data, investments: data.investments.map(x => x.id === id ? { ...x, ...i } : x) }),
      deleteInvestment: (id) => save({ ...data, investments: data.investments.filter(x => x.id !== id) }),

      addGoal: (g) => save({ ...data, goals: [...data.goals, { ...g, id: uid() }] }),
      updateGoal: (id, g) => save({ ...data, goals: data.goals.map(x => x.id === id ? { ...x, ...g } : x) }),
      deleteGoal: (id) => save({ ...data, goals: data.goals.filter(x => x.id !== id) }),

      addBudget: (b) => save({ ...data, budgets: [...data.budgets, { ...b, id: uid() }] }),
      updateBudget: (id, b) => save({ ...data, budgets: data.budgets.map(x => x.id === id ? { ...x, ...b } : x) }),
      deleteBudget: (id) => save({ ...data, budgets: data.budgets.filter(x => x.id !== id) }),

      updateSettings: (s) => save({ ...data, settings: { ...(data.settings || defaultSettings), ...s } }),
    }}>
      {children}
    </WealthContext.Provider>
  )
}

export function useWealth() {
  const ctx = useContext(WealthContext)
  if (!ctx) throw new Error('useWealth must be used inside WealthProvider')
  return ctx
}
