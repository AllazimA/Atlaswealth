'use client'

import { useWealth } from '@/components/wealthos/WealthContext'
import { BarChart3, TrendingUp, TrendingDown, PieChart, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  const { data, totalMonthlyIncome, totalMonthlyExpenses, fmt } = useWealth()

  const expByCategory = data.expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  const expBySubcat = data.expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.subcategory] = (acc[e.subcategory] || 0) + e.amount
    return acc
  }, {})

  const topSubcats = Object.entries(expBySubcat).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const totalExp = data.expenses.reduce((s, e) => s + e.amount, 0)

  const savingsRate = totalMonthlyIncome > 0
    ? ((totalMonthlyIncome - totalMonthlyExpenses) / totalMonthlyIncome * 100)
    : 0

  const portfolioValue = data.investments.reduce((s, i) => s + (i.amount || 0), 0)
  const portfolioReturn = 0

  const CAT_COLORS: Record<string, string> = {
    needs: '#3b82f6', wants: '#8b5cf6', savings: '#22c55e'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Deep insights into your financial patterns</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Monthly Income', value: fmt(totalMonthlyIncome), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Monthly Expenses', value: fmt(totalMonthlyExpenses), icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, icon: PieChart, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Portfolio Return', value: `${portfolioReturn >= 0 ? '+' : ''}${portfolioReturn.toFixed(2)}%`, icon: BarChart3, color: portfolioReturn >= 0 ? 'text-emerald-400' : 'text-rose-400', bg: portfolioReturn >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-gray-400 text-sm">{label}</span>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Expense by category */}
        <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" /> Spending by Category
          </h2>
          {totalExp === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">No expense data</div>
          ) : (
            <div className="space-y-4">
              {['needs', 'wants', 'savings'].map(cat => {
                const amt = expByCategory[cat] || 0
                const pct = totalExp > 0 ? (amt / totalExp * 100) : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: CAT_COLORS[cat] }} />
                        <span className="text-gray-300 text-sm capitalize">{cat}</span>
                      </div>
                      <div className="text-gray-400 text-sm">{fmt(amt)} <span className="text-gray-600">({pct.toFixed(1)}%)</span></div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: CAT_COLORS[cat] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top spending subcategories */}
        <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/5">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" /> Top Spending Areas
          </h2>
          {topSubcats.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">No expense data</div>
          ) : (
            <div className="space-y-3">
              {topSubcats.map(([subcat, amt], i) => {
                const pct = totalExp > 0 ? (amt / totalExp * 100) : 0
                const colors = ['#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#14b8a6']
                return (
                  <div key={subcat}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300 text-sm capitalize">{subcat}</span>
                      <span className="text-gray-400 text-sm">{fmt(amt)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Net worth summary */}
      <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-white/5">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" /> Financial Summary
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-gray-500 text-xs mb-1">Total Account Balances</div>
            <div className="text-xl font-bold text-white">{fmt(data.accounts.reduce((s, a) => s + a.balance, 0))}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Investment Portfolio</div>
            <div className="text-xl font-bold text-white">{fmt(portfolioValue)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Estimated Net Worth</div>
            <div className="text-xl font-bold text-emerald-400">
              {fmt(data.accounts.reduce((s, a) => s + a.balance, 0) + portfolioValue)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Income Sources</div>
            <div className="text-xl font-bold text-white">{data.incomeSources.length}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Total Expenses Recorded</div>
            <div className="text-xl font-bold text-white">{data.expenses.length}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Goals Progress</div>
            <div className="text-xl font-bold text-white">
              {data.goals.filter(g => g.status === 'completed').length} / {data.goals.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
