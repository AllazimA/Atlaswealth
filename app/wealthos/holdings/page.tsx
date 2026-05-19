'use client'

import { useState, useEffect } from 'react'
import { useWealth, Holding } from '@/components/wealthos/WealthContext'
import Modal from '@/components/wealthos/Modal'
import { Plus, Trash2, TrendingUp, TrendingDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

export default function HoldingsPage() {
  const {
    holdings,
    addHolding,
    deleteHolding,
    refreshHoldings,
    holdingsLoading,
    holdingsError,
    clearHoldingsError,
    fmt
  } = useWealth()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    avgCost: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    sector: '',
    industry: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Calculate portfolio metrics
  const totalCostBasis = holdings.reduce((sum, h) => sum + (h.quantity * h.avgCost), 0)
  const totalCurrentValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || h.avgCost)), 0)
  const unrealizedPL = totalCurrentValue - totalCostBasis
  const unrealizedPLPct = totalCostBasis > 0 ? (unrealizedPL / totalCostBasis) * 100 : 0

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.symbol || !formData.name || !formData.quantity || !formData.avgCost) {
        throw new Error('Please fill in all required fields')
      }

      const quantity = parseFloat(formData.quantity)
      const avgCost = parseFloat(formData.avgCost)

      if (isNaN(quantity) || isNaN(avgCost) || quantity <= 0 || avgCost <= 0) {
        throw new Error('Quantity and Average Cost must be positive numbers')
      }

      await addHolding({
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        quantity,
        avgCost,
        purchaseDate: formData.purchaseDate,
        sector: formData.sector || undefined,
        industry: formData.industry || undefined,
        currentPrice: avgCost, // Start with avgCost as current price
        priceSource: 'pending',
        notes: formData.notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Reset form
      setFormData({
        symbol: '',
        name: '',
        quantity: '',
        avgCost: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        sector: '',
        industry: '',
        notes: '',
      })
      setIsModalOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add holding'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteHolding = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this holding?')) return
    try {
      await deleteHolding(id)
    } catch (err) {
      alert('Failed to delete holding')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Holdings</h1>
        <p className="text-slate-400 text-sm">Track your individual stock and crypto holdings with real-time prices</p>
      </div>

      {/* Error Banner */}
      {(holdingsError || submitError) && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-200 text-sm">{holdingsError || submitError}</p>
          </div>
          <button
            onClick={() => {
              clearHoldingsError()
              setSubmitError(null)
            }}
            className="text-red-400 hover:text-red-300 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Holdings</p>
          <p className="text-2xl sm:text-3xl font-bold">{holdings.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Cost Basis</p>
          <p className="text-2xl sm:text-3xl font-bold">{fmt(totalCostBasis)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Current Value</p>
          <p className="text-2xl sm:text-3xl font-bold">{fmt(totalCurrentValue)}</p>
        </div>
        <div className={`bg-white/5 border rounded-lg p-4 sm:p-6 ${unrealizedPL >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Unrealized P&L</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl sm:text-3xl font-bold ${unrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {unrealizedPL >= 0 ? '+' : ''}{fmt(unrealizedPL)}
            </p>
            <span className={`text-xs font-semibold ${unrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {unrealizedPL >= 0 ? '+' : ''}{unrealizedPLPct.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Holding</span>
        </button>
        <button
          onClick={() => refreshHoldings()}
          disabled={holdingsLoading}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {holdingsLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              <span>Refresh Prices</span>
            </>
          )}
        </button>
      </div>

      {/* Holdings Table */}
      {holdingsLoading && holdings.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : holdings.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
          <p className="text-slate-400 text-lg mb-4">No holdings yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Holding
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Symbol</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Company</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Quantity</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Avg Cost</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Current Price</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Value</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Gain/Loss</th>
                <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => {
                const currentPrice = holding.currentPrice || holding.avgCost
                const currentValue = holding.quantity * currentPrice
                const costBasis = holding.quantity * holding.avgCost
                const gainLoss = currentValue - costBasis
                const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0
                const isProfit = gainLoss >= 0

                return (
                  <tr key={holding.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-bold text-lg">{holding.symbol}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{holding.name}</p>
                        {holding.sector && <p className="text-xs text-slate-400">{holding.sector}</p>}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">{holding.quantity.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right">${holding.avgCost.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right">
                      <div>
                        <p>${currentPrice.toFixed(2)}</p>
                        <span className={`text-xs font-semibold ${holding.priceSource === 'twelvedata' || holding.priceSource === 'coingecko' ? 'text-green-400' : 'text-slate-400'}`}>
                          {holding.priceSource === 'twelvedata' ? '🔴 LIVE' : holding.priceSource === 'coingecko' ? '🟢 LIVE' : '📊 MOCK'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">{fmt(currentValue)}</td>
                    <td className="py-4 px-4 text-right">
                      <div className={`font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}{fmt(gainLoss)}
                      </div>
                      <span className={`text-xs font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}{gainLossPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleDeleteHolding(holding.id)}
                        className="inline-flex items-center justify-center p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Holding Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Holding">
        <form onSubmit={handleAddHolding} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Symbol *</label>
              <input
                type="text"
                placeholder="e.g., AAPL"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Name *</label>
              <input
                type="text"
                placeholder="e.g., Apple Inc."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Quantity *</label>
              <input
                type="number"
                placeholder="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Average Cost *</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.avgCost}
                onChange={(e) => setFormData({ ...formData, avgCost: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Purchase Date</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Sector</label>
              <input
                type="text"
                placeholder="e.g., Technology"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
            <textarea
              placeholder="Any notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Holding'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
