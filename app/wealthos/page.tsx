'use client'

import { useState } from 'react'
import { useWealth } from '@/components/wealthos/WealthContext'
import {
  TrendingUp, TrendingDown, Wallet, Target, Building2,
  Briefcase, RefreshCw, Plus, Brain, Sparkles
} from 'lucide-react'
import Link from 'next/link'


export default function Dashboard() {
  const { data, totalMonthlyIncome, totalMonthlyExpenses, netBalance, fmt } = useWealth()
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState<string[]>([])

  const totalSavings = data.accounts.reduce((s, a) => s + a.balance, 0)
  const savingsPct = totalMonthlyIncome > 0
    ? ((totalMonthlyIncome - totalMonthlyExpenses) / totalMonthlyIncome * 100).toFixed(1)
    : '0.0'

  const largestExpense = data.expenses.length
    ? data.expenses.reduce((a, b) => a.amount > b.amount ? a : b)
    : null

  const activeGoals = data.goals.filter(g => g.status === 'active')

  const recentActivity = [
    ...data.incomeSources.map(s => ({ type: 'income' as const, name: s.name, category: s.category, date: s.createdAt, amount: s.amount })),
    ...data.expenses.map(e => ({ type: 'expense' as const, name: e.name, category: e.category, date: e.date, amount: -e.amount })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  function generateInsights() {
    setAiLoading(true)
    setTimeout(() => {
      const insights: string[] = []
      if (totalMonthlyIncome > 0) {
        const savingsRate = (totalMonthlyIncome - totalMonthlyExpenses) / totalMonthlyIncome * 100
        if (savingsRate > 20) insights.push(`Great job! You're saving ${savingsRate.toFixed(0)}% of your income, above the recommended 20%.`)
        else if (savingsRate < 10) insights.push(`Your savings rate is ${savingsRate.toFixed(0)}%. Consider reducing discretionary spending to reach 20%.`)
      }
      if (data.investments.length > 0) {
        const portfolioValue = data.investments.reduce((s, i) => s + (i.amount || 0), 0)
        const largest = [...data.investments].sort((a, b) => b.allocationPercentage - a.allocationPercentage)[0]
        insights.push(`Your portfolio covers ${data.investments.length} asset classes${portfolioValue > 0 ? ` worth ${fmt(portfolioValue)}` : ''}. Largest position: ${largest.assetClass} at ${largest.allocationPercentage}%.`)
      }
      if (data.goals.length > 0) {
        const closest = data.goals.filter(g => g.status === 'active').sort((a, b) => (b.current / b.target) - (a.current / a.target))[0]
        if (closest) insights.push(`Goal "${closest.name}" is ${((closest.current / closest.target) * 100).toFixed(0)}% complete. Keep it up!`)
      }
      if (insights.length === 0) insights.push('Add income sources, expenses, and goals to get personalized AI insights.')
      setAiInsights(insights)
      setAiLoading(false)
    }, 1200)
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time overview of your financial health</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateInsights}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors text-sm"
          >
            <Brain className="w-4 h-4" />
            AI Coach
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/wealthos/expenses"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Monthly Income</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{fmt(totalMonthlyIncome)}</div>
          <div className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {data.incomeSources.length} source{data.incomeSources.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Monthly Expenses</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{fmt(totalMonthlyExpenses)}</div>
          <div className={`text-xs mt-1 flex items-center gap-1 ${totalMonthlyExpenses === 0 ? 'text-gray-500' : 'text-rose-400'}`}>
            <TrendingDown className="w-3 h-3" />
            {data.expenses.length} transaction{data.expenses.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Net Balance</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{fmt(netBalance)}</div>
          <div className={`text-xs mt-1 flex items-center gap-1 ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <TrendingUp className="w-3 h-3" />
            {netBalance >= 0 ? 'Surplus' : 'Deficit'} this month
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Savings Progress</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{savingsPct}%</div>
          <div className="text-purple-400 text-xs mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            of income saved
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Link href="/wealthos/expenses" className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-rose-500 to-red-700 hover:opacity-90 transition-opacity">
          <div className="text-white/80 text-sm mb-1">Largest Expense</div>
          <div className="text-white font-bold text-xl">{largestExpense ? largestExpense.name : 'N/A'}</div>
          <div className="text-white/70 text-sm">{largestExpense ? fmt(largestExpense.amount) : '$0.00'}</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
        </Link>

        <Link href="/wealthos/goals" className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 hover:opacity-90 transition-opacity">
          <div className="text-white/80 text-sm mb-1">Active Goals</div>
          <div className="text-white font-bold text-xl">{activeGoals.length}</div>
          <div className="text-white/70 text-sm">Goals in progress</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
        </Link>

        <Link href="/wealthos/import" className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 hover:opacity-90 transition-opacity">
          <div className="text-white/80 text-sm mb-1">Bank Sync</div>
          <div className="text-white font-bold text-xl">Import Data</div>
          <div className="text-white/70 text-sm">Upload CSV files</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </Link>

        <Link href="/wealthos/investments" className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-700 hover:opacity-90 transition-opacity">
          <div className="text-white/80 text-sm mb-1">Portfolio</div>
          <div className="text-white font-bold text-xl">Investments</div>
          <div className="text-white/70 text-sm">Track holdings</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Budget Overview */}
        <div className="col-span-2 bg-[#1a1f2e] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-lg">Budget Overview</h2>
            {netBalance > 0 && (
              <span className="text-emerald-400 text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {fmt(netBalance)} surplus
              </span>
            )}
          </div>
          {data.budgets.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-500 mb-2">No budget data available</div>
              <div className="text-gray-600 text-sm">Set up your monthly budgets to see progress</div>
              <Link href="/wealthos/expenses" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors">
                <Plus className="w-4 h-4" /> Create Budget
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.budgets.map(b => {
                const spent = data.expenses.filter(e => e.category === b.expenseCategory).reduce((s, e) => s + e.amount, 0)
                const pct = Math.min((spent / b.limit) * 100, 100)
                return (
                  <div key={b.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{b.category}</span>
                      <span className="text-gray-400">{fmt(spent)} / {fmt(b.limit)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
            <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">No activity yet</div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.type === 'income' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                        {a.type === 'income'
                          ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                          : <TrendingDown className="w-4 h-4 text-rose-400" />}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{a.name}</div>
                        <div className="text-gray-500 text-xs">{a.category} · {new Date(a.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${a.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {a.amount >= 0 ? '+' : ''}{fmt(a.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                AI Insights
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={generateInsights}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-xs hover:bg-purple-500/20 transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Ask AI
                </button>
                <button onClick={generateInsights} className="text-gray-400 hover:text-white transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            {aiLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : aiInsights.length === 0 ? (
              <div className="text-center py-6">
                <Brain className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <div className="text-gray-500 text-sm">No insights available yet</div>
                <button onClick={generateInsights} className="mt-3 text-purple-400 text-xs hover:text-purple-300 transition-colors">
                  Generate insights →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {aiInsights.map((insight, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
