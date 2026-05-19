'use client'

import { useState, useCallback } from 'react'
import { useWealth } from '@/components/wealthos/WealthContext'
import Modal from '@/components/wealthos/Modal'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector
} from 'recharts'
import { Plus, Pencil, Trash2, AlertTriangle, TrendingUp, Layers, Award, Info, ChevronRight } from 'lucide-react'
import type { Investment, AssetClass } from '@/components/wealthos/types'

// ─── Constants ──────────────────────────────────────────────────
const ASSET_CLASSES: AssetClass[] = ['Stocks', 'Bonds', 'Gold', 'ETF', 'Crypto', 'REITs', 'Cash', 'Other']

const ASSET_COLORS: Record<AssetClass, string> = {
  Stocks: '#818cf8',
  Bonds:  '#34d399',
  Gold:   '#fbbf24',
  ETF:    '#38bdf8',
  Crypto: '#c084fc',
  REITs:  '#fb7185',
  Cash:   '#2dd4bf',
  Other:  '#94a3b8',
}

const ASSET_ICONS: Record<AssetClass, string> = {
  Stocks: '📈', Bonds: '📊', Gold: '🥇', ETF: '🗂️',
  Crypto: '₿', REITs: '🏢', Cash: '💵', Other: '🔹',
}

// ─── Safe number coercion (fixes NaN from localStorage strings) ─
function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v)
  return isFinite(n) ? n : fallback
}

// ─── Recharts active shape (fmt passed as extra prop via render fn) ─
function ActiveShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius,
    startAngle, endAngle, fill, payload, percent, value, fmt: fmtFn
  } = props

  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 10px ${fill}80)` }}
      />
      <text x={cx} y={cy - 20} textAnchor="middle" fill={fill} fontSize={13} fontWeight={600}>
        {payload.assetClass}
      </text>
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#ffffff" fontSize={26} fontWeight={800}>
        {(percent * 100).toFixed(1)}%
      </text>
      {value > 0 && fmtFn && (
        <text x={cx} y={cy + 24} textAnchor="middle" fill="#64748b" fontSize={12}>
          {fmtFn(value)}
        </text>
      )}
    </g>
  )
}

// ─── Custom tooltip ──────────────────────────────────────────────
function CustomTooltip({ active, payload, fmt: fmtFn }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: ASSET_COLORS[d.assetClass as AssetClass] }} />
        <span className="text-white text-sm font-semibold">{d.assetClass}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color: ASSET_COLORS[d.assetClass as AssetClass] }}>
        {d.allocation}%
      </div>
      {d.amount > 0 && fmtFn && <div className="text-gray-400 text-xs mt-0.5">{fmtFn(d.amount)}</div>}
    </div>
  )
}

// ─── Center label (when nothing is hovered) ─────────────────────
function CenterLabel({ cx, cy, totalValue, totalAllocated, fmt: fmtFn }: any) {
  return (
    <g>
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#64748b" fontSize={11} fontWeight={500} letterSpacing={1}>
        PORTFOLIO
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#ffffff" fontSize={totalValue > 0 ? 22 : 18} fontWeight={800}>
        {totalValue > 0 && fmtFn ? fmtFn(totalValue) : `${totalAllocated}%`}
      </text>
      <text x={cx} y={cy + 32} textAnchor="middle" fill="#475569" fontSize={10}>
        {totalValue > 0 ? 'total value' : 'allocated'}
      </text>
    </g>
  )
}

// ─── Diversification score ───────────────────────────────────────
function divScore(investments: Investment[]): number {
  if (investments.length === 0) return 0
  const hhi = investments.reduce((s, i) => s + (safeNum(i.allocationPercentage) / 100) ** 2, 0)
  return Math.round((1 - hhi) * 100)
}

function scoreLabel(score: number) {
  if (score >= 70) return { label: 'Well Diversified', color: '#34d399' }
  if (score >= 40) return { label: 'Moderate', color: '#fbbf24' }
  return { label: 'Concentrated', color: '#fb7185' }
}

// ─── Form blank ──────────────────────────────────────────────────
const BLANK = { assetClass: 'Stocks' as AssetClass, allocationPercentage: '', amount: '', notes: '' }

// ─── Main page ───────────────────────────────────────────────────
export default function InvestmentsPage() {
  const { data, addInvestment, updateInvestment, deleteInvestment, fmt } = useWealth()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Investment | null>(null)
  const [form, setForm] = useState(BLANK)

  // Normalize stored data — guard against string values from localStorage
  const investments: Investment[] = data.investments.map(i => ({
    ...i,
    allocationPercentage: safeNum(i.allocationPercentage),
    amount: i.amount != null ? safeNum(i.amount) : undefined,
  }))

  const totalAllocated = investments.reduce((s, i) => s + i.allocationPercentage, 0)
  const remaining      = Math.max(0, 100 - totalAllocated)
  const totalValue     = investments.reduce((s, i) => s + (i.amount ?? 0), 0)
  const largest        = [...investments].sort((a, b) => b.allocationPercentage - a.allocationPercentage)[0]
  const score          = divScore(investments)
  const { label: scoreText, color: scoreColor } = scoreLabel(score)
  const overExposed    = investments.filter(i => i.allocationPercentage > 40)

  // Recharts data: merge duplicate asset classes by summing allocation + amount
  const mergedMap = new Map<string, { assetClass: AssetClass; allocation: number; amount: number }>()
  for (const i of investments) {
    const existing = mergedMap.get(i.assetClass)
    if (existing) {
      existing.allocation += i.allocationPercentage
      existing.amount     += (i.amount ?? 0)
    } else {
      mergedMap.set(i.assetClass, {
        assetClass: i.assetClass,
        allocation: i.allocationPercentage,
        amount:     i.amount ?? 0,
      })
    }
  }
  const rawChartData = Array.from(mergedMap.values()).filter(d => d.allocation > 0)

  // If over 100%, scale segments proportionally so chart always fills 100%
  const chartData = totalAllocated > 100
    ? rawChartData.map(d => ({ ...d, allocation: parseFloat(((d.allocation / totalAllocated) * 100).toFixed(2)) }))
    : rawChartData

  // Add unallocated slice only when under 100%
  const chartDataWithGap = remaining > 0.5 && totalAllocated <= 100
    ? [...chartData, { assetClass: 'Other' as AssetClass, allocation: remaining, amount: 0, isUnallocated: true }]
    : chartData

  function openAdd() { setEditing(null); setForm(BLANK); setOpen(true) }
  function openEdit(i: Investment) {
    setEditing(i)
    setForm({
      assetClass: i.assetClass,
      allocationPercentage: String(i.allocationPercentage),
      amount: i.amount != null ? String(i.amount) : '',
      notes: i.notes || '',
    })
    setOpen(true)
  }

  const allocatedInModal = useCallback(() => {
    return editing
      ? totalAllocated - safeNum(editing.allocationPercentage)
      : totalAllocated
  }, [editing, totalAllocated])

  const wouldExceed = useCallback(() => {
    return allocatedInModal() + safeNum(form.allocationPercentage) > 100
  }, [form.allocationPercentage, allocatedInModal])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const pct = safeNum(form.allocationPercentage)
    if (pct <= 0) return
    const payload: Omit<Investment, 'id'> = {
      assetClass: form.assetClass,
      allocationPercentage: pct,
      amount: form.amount ? safeNum(form.amount) : undefined,
      notes: form.notes.trim() || undefined,
    }
    if (editing) updateInvestment(editing.id, payload)
    else addInvestment(payload)
    setOpen(false)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolio Allocation</h1>
          <p className="text-gray-400 mt-1">Visualize and manage your asset class distribution</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Asset Class
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Total Portfolio</div>
            <div className="text-2xl font-bold text-white">{totalValue > 0 ? fmt(totalValue) : '—'}</div>
            <div className="text-gray-500 text-xs mt-1">{totalAllocated.toFixed(1)}% allocated</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Asset Classes</div>
            <div className="text-2xl font-bold text-white">{investments.length}</div>
            <div className="text-gray-500 text-xs mt-1">{remaining.toFixed(1)}% remaining</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div className="bg-[#1a1f2e] rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs mb-1 uppercase tracking-wide">Largest Position</div>
            {largest ? (
              <>
                <div className="text-2xl font-bold text-white">{largest.allocationPercentage}%</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span>{ASSET_ICONS[largest.assetClass]}</span>
                  <span className="text-gray-400 text-xs">{largest.assetClass}</span>
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-600">—</div>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Over-allocated warning */}
      {totalAllocated > 100 && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 mb-4">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="text-rose-300 text-sm">
            <strong>Over-allocated by {(totalAllocated - 100).toFixed(1)}%.</strong>{' '}
            Total exceeds 100%. Edit or remove asset classes to rebalance.
          </span>
        </div>
      )}

      {/* Overexposure warning */}
      {overExposed.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 text-sm">
            <strong>High concentration:</strong>{' '}
            {overExposed.map(i => `${i.assetClass} (${i.allocationPercentage}%)`).join(', ')}{' '}
            exceed{overExposed.length === 1 ? 's' : ''} 40%. Consider diversifying to reduce risk.
          </span>
        </div>
      )}

      {investments.length === 0 ? (
        <div className="bg-[#1a1f2e] rounded-2xl border border-white/5 flex flex-col items-center justify-center py-24">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-5">
            <Layers className="w-9 h-9 text-amber-400" />
          </div>
          <div className="text-white font-semibold text-lg mb-2">No asset classes yet</div>
          <div className="text-gray-500 text-sm mb-6 text-center max-w-xs">
            Add your first asset class to start visualizing your portfolio allocation
          </div>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm border border-amber-500/20" type="button">
            + Add First Asset Class
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-6 mb-6">
            {/* ── Donut Chart ── */}
            <div className="col-span-3 bg-[#1a1f2e] rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Allocation Breakdown</h2>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(totalAllocated, 100)}%`,
                        background: totalAllocated > 100 ? '#fb7185' : totalAllocated >= 90 ? '#fbbf24' : '#f59e0b',
                      }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs tabular-nums">{totalAllocated.toFixed(1)}%</span>
                </div>
              </div>

              {/* Recharts PieChart */}
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartDataWithGap}
                      cx="50%"
                      cy="50%"
                      innerRadius={88}
                      outerRadius={130}
                      paddingAngle={chartDataWithGap.length > 1 ? 2 : 0}
                      dataKey="allocation"
                      startAngle={90}
                      endAngle={-270}
                      animationBegin={0}
                      animationDuration={800}
                      {...(activeIndex !== null ? { activeIndex } : {})}
                      activeShape={(props: any) => <ActiveShape {...props} fmt={fmt} />}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {chartDataWithGap.map((entry, index) => {
                        const isUnalloc = (entry as any).isUnallocated
                        const color = isUnalloc ? '#0f172a' : ASSET_COLORS[entry.assetClass]
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={color}
                            stroke={isUnalloc ? '#1e293b' : color}
                            strokeWidth={1}
                            style={{ cursor: isUnalloc ? 'default' : 'pointer', outline: 'none' }}
                          />
                        )
                      })}
                    </Pie>

                    {/* Static center label (only when no segment is active) */}
                    {activeIndex === null && (
                      <Pie
                        data={[{ value: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={0}
                        dataKey="value"
                        label={(props: any) => <CenterLabel {...props} totalValue={totalValue} totalAllocated={totalAllocated.toFixed(0)} fmt={fmt} />}
                        labelLine={false}
                        isAnimationActive={false}
                      >
                        <Cell fill="transparent" />
                      </Pie>
                    )}

                    <Tooltip content={(props: any) => <CustomTooltip {...props} fmt={fmt} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {chartData.map((d, i) => (
                  <button
                    key={d.assetClass + i}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                      activeIndex === i ? 'bg-white/8' : 'hover:bg-white/5'
                    }`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: ASSET_COLORS[d.assetClass] }} />
                    <span className="text-gray-300 text-sm flex-1 truncate">{d.assetClass}</span>
                    <span className="text-gray-400 text-xs font-medium tabular-nums">{d.allocation}%</span>
                  </button>
                ))}
                {remaining > 0.5 && (
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
                    <div className="w-3 h-3 rounded-full bg-white/10 flex-shrink-0" />
                    <span className="text-gray-600 text-sm flex-1">Unallocated</span>
                    <span className="text-gray-600 text-xs tabular-nums">{remaining.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Allocation List ── */}
            <div className="col-span-2 bg-[#1a1f2e] rounded-2xl border border-white/5 p-6 flex flex-col">
              <h2 className="text-white font-semibold mb-4">Asset Classes</h2>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[540px] pr-1">
                {[...investments]
                  .sort((a, b) => b.allocationPercentage - a.allocationPercentage)
                  .map((i, listIdx) => {
                    const chartIdx = chartData.findIndex(d => d.assetClass === i.assetClass)
                    const isActive = activeIndex === chartIdx
                    return (
                      <div
                        key={i.id}
                        className={`group rounded-xl p-4 border transition-all cursor-default ${
                          isActive ? 'bg-white/6 border-white/10' : 'bg-[#111318] border-transparent hover:border-white/5'
                        }`}
                        onMouseEnter={() => setActiveIndex(chartIdx >= 0 ? chartIdx : null)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{ASSET_ICONS[i.assetClass]}</span>
                            <div>
                              <div className="text-white text-sm font-medium">{i.assetClass}</div>
                              {i.amount != null && i.amount > 0 && (
                                <div className="text-gray-500 text-xs">{fmt(i.amount)}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold tabular-nums" style={{ color: ASSET_COLORS[i.assetClass] }}>
                              {i.allocationPercentage}%
                            </span>
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(i)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteInvestment(i.id)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${i.allocationPercentage}%`,
                              background: ASSET_COLORS[i.assetClass],
                              boxShadow: isActive ? `0 0 8px ${ASSET_COLORS[i.assetClass]}60` : 'none',
                            }}
                          />
                        </div>
                        {i.notes && (
                          <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                            <Info className="w-3 h-3" />{i.notes}
                          </p>
                        )}
                      </div>
                    )
                  })}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Total allocated</span>
                  <span className={totalAllocated > 100 ? 'text-rose-400 font-semibold' : 'text-gray-300'}>
                    {totalAllocated.toFixed(1)} / 100%
                  </span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(totalAllocated, 100)}%`,
                      background: totalAllocated > 100 ? '#fb7185' : totalAllocated >= 90 ? '#fbbf24'
                        : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Insights row ── */}
          <div className="grid grid-cols-2 gap-6">
            {/* Diversification score */}
            <div className="bg-[#1a1f2e] rounded-2xl border border-white/5 p-6">
              <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Diversification Score
              </h2>
              <div className="flex items-end gap-4 mb-5">
                <div>
                  <div className="text-5xl font-bold" style={{ color: scoreColor }}>{score}</div>
                  <div className="text-xs mt-1" style={{ color: scoreColor }}>{scoreText}</div>
                </div>
                <div className="flex-1 pb-1">
                  <div className="h-3 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${score}%`, background: scoreColor }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Concentrated</span><span>Diversified</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { range: '0–33', label: 'Concentrated', color: '#fb7185' },
                  { range: '34–66', label: 'Moderate', color: '#fbbf24' },
                  { range: '67–100', label: 'Diversified', color: '#34d399' },
                ].map(({ range, label, color }) => (
                  <div key={label} className="bg-[#111318] rounded-xl p-3 text-center">
                    <div className="w-2 h-2 rounded-full mx-auto mb-1.5" style={{ background: color }} />
                    <div className="text-white text-xs font-medium">{label}</div>
                    <div className="text-gray-600 text-xs">{range}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio insights */}
            <div className="bg-[#1a1f2e] rounded-2xl border border-white/5 p-6">
              <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-amber-400" /> Portfolio Insights
              </h2>
              <div className="space-y-3">
                {generateInsights(investments, totalAllocated, score).map((insight, i) => (
                  <div key={i} className={`flex gap-3 p-3 rounded-xl border ${
                    insight.type === 'warn' ? 'bg-amber-500/8 border-amber-500/15' :
                    insight.type === 'error' ? 'bg-rose-500/8 border-rose-500/15' :
                    'bg-amber-500/8 border-amber-500/10'}`}>
                    <span className="text-base mt-0.5 flex-shrink-0">{insight.icon}</span>
                    <p className={`text-sm leading-relaxed ${
                      insight.type === 'warn' ? 'text-amber-300' :
                      insight.type === 'error' ? 'text-rose-300' : 'text-amber-200'
                    }`}>{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Modal ── */}
      {open && (
        <Modal title={editing ? 'Edit Asset Class' : 'Add Asset Class'} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Asset Class</label>
              <div className="grid grid-cols-4 gap-2">
                {ASSET_CLASSES.map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setForm({ ...form, assetClass: cls })}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all"
                    style={form.assetClass === cls ? {
                      borderColor: ASSET_COLORS[cls] + '80',
                      backgroundColor: ASSET_COLORS[cls] + '15',
                      color: ASSET_COLORS[cls],
                    } : { borderColor: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}
                  >
                    <span className="text-lg">{ASSET_ICONS[cls]}</span>
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-400 text-sm">Allocation %</label>
                <span className="text-gray-500 text-xs">
                  {allocatedInModal().toFixed(1)}% used · {(100 - allocatedInModal()).toFixed(1)}% available
                </span>
              </div>
              <div className="relative">
                <input
                  type="number" step="0.1" min="0.1" max="100"
                  className={`w-full bg-[#111318] border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none pr-10 ${
                    wouldExceed() ? 'border-rose-500/50' : 'border-white/10 focus:border-amber-500/50'
                  }`}
                  placeholder="e.g. 25"
                  value={form.allocationPercentage}
                  onChange={e => setForm({ ...form, allocationPercentage: e.target.value })}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
              <div className="mt-2 h-1 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(allocatedInModal() + safeNum(form.allocationPercentage), 100)}%`,
                    background: wouldExceed() ? '#fb7185' : ASSET_COLORS[form.assetClass],
                  }}
                />
              </div>
              {wouldExceed() && (
                <div className="flex items-center gap-1.5 mt-2 text-amber-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" /> Will exceed 100% — you can still save and rebalance later
                </div>
              )}
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Amount <span className="text-gray-600">(optional)</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number" step="any" min="0"
                  className="w-full bg-[#111318] border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1.5">Notes <span className="text-gray-600">(optional)</span></label>
              <input
                className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                placeholder="e.g. Vanguard S&P 500 index"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors"
                style={{ background: ASSET_COLORS[form.assetClass] + 'cc' }}
              >
                {editing ? 'Update' : 'Add'} {form.assetClass}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ─── Insight generator ───────────────────────────────────────────
function generateInsights(investments: Investment[], totalAllocated: number, score: number) {
  const out: { text: string; type: 'info' | 'warn' | 'error'; icon: string }[] = []
  if (investments.length === 0) return out

  if (totalAllocated < 100) {
    out.push({ text: `${(100 - totalAllocated).toFixed(1)}% of your portfolio is unallocated. Assign it to maximize your plan.`, type: 'info', icon: '💡' })
  }

  investments.filter(i => i.allocationPercentage > 40).forEach(i => {
    out.push({ text: `${i.assetClass} is at ${i.allocationPercentage}% — above the 40% threshold. This concentration increases portfolio volatility.`, type: 'warn', icon: '⚠️' })
  })

  if (score >= 70) {
    out.push({ text: `Diversification score of ${score} — excellent spread across asset classes. Keep rebalancing periodically.`, type: 'info', icon: '✅' })
  } else if (score < 33) {
    out.push({ text: `Low diversification (${score}). Adding uncorrelated asset classes like Bonds or REITs can reduce drawdown risk.`, type: 'error', icon: '🔴' })
  }

  const cryptoPct = investments.filter(i => i.assetClass === 'Crypto').reduce((s, i) => s + i.allocationPercentage, 0)
  if (cryptoPct > 20) {
    out.push({ text: `Crypto exposure at ${cryptoPct}%. Most advisors cap speculative assets at 5–10% for balanced portfolios.`, type: 'warn', icon: '₿' })
  }

  const hasBonds = investments.some(i => i.assetClass === 'Bonds')
  const hasEquity = investments.some(i => i.assetClass === 'Stocks' || i.assetClass === 'ETF')
  if (hasEquity && !hasBonds && totalAllocated > 50) {
    out.push({ text: 'No bond allocation detected. Adding bonds typically reduces volatility during equity market downturns.', type: 'info', icon: '📊' })
  }

  if (out.length === 0) {
    out.push({ text: 'Your portfolio looks balanced. Review allocations quarterly as market values shift.', type: 'info', icon: '🎯' })
  }
  return out.slice(0, 4)
}
