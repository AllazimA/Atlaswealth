'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { atlasClient } from '@/lib/atlas-api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface PortfolioHolding {
  symbol: string
  shares: number
  purchasePrice: number
  sector: string
}

export default function PortfolioBuilderPage() {
  const [step, setStep] = useState<'basic' | 'holdings' | 'review'>('basic')
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [newHolding, setNewHolding] = useState<PortfolioHolding>({
    symbol: '',
    shares: 0,
    purchasePrice: 0,
    sector: '',
  })
  const [portfolioData, setPortfolioData] = useState({
    name: '',
    clientId: '',
    type: 'equity' as const,
    description: '',
    riskScore: 50,
  })

  const queryClient = useQueryClient()

  // ── Fetch clients for selection ────────────────────────────────────────────
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => atlasClient.clients.list(),
  })

  // ── Create portfolio mutation ──────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: any) => atlasClient.portfolios.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      toast.success('Portfolio created successfully!')
      // Reset form
      setStep('basic')
      setPortfolioData({ name: '', clientId: '', type: 'equity', description: '', riskScore: 50 })
      setHoldings([])
    },
    onError: () => toast.error('Failed to create portfolio'),
  })

  const handleAddHolding = () => {
    if (!newHolding.symbol || !newHolding.shares || !newHolding.purchasePrice) {
      toast.error('Please fill in all holding fields')
      return
    }

    setHoldings([...holdings, newHolding])
    setNewHolding({ symbol: '', shares: 0, purchasePrice: 0, sector: '' })
  }

  const handleRemoveHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index))
  }

  const calculateAllocationAndValue = () => {
    const totalValue = holdings.reduce((sum, h) => sum + h.shares * h.purchasePrice, 0)
    const byAsset: { [key: string]: number } = {}

    holdings.forEach(h => {
      const type = h.sector || 'Other'
      byAsset[type] = (byAsset[type] || 0) + h.shares * h.purchasePrice
    })

    return { totalValue, allocation: byAsset }
  }

  const { totalValue, allocation } = calculateAllocationAndValue()

  const handleCreatePortfolio = () => {
    if (!portfolioData.name) {
      toast.error('Portfolio name is required')
      return
    }

    // Calculate allocation percentages
    const allocationPct: { [key: string]: number } = {}
    if (totalValue > 0) {
      Object.entries(allocation).forEach(([asset, value]) => {
        allocationPct[asset] = Math.round((value / totalValue) * 100)
      })
    }

    const createData = {
      ...portfolioData,
      totalValue,
      allocation: {
        stocks: allocationPct['Technology'] || allocationPct['Financials'] ? 60 : 0,
        bonds: 20,
        crypto: allocationPct['Crypto'] ? 10 : 0,
        cash: 10,
      },
    }

    createMutation.mutate(createData)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Portfolio Builder</h1>
        <p className="text-slate-600 mt-1">Create and customize investment portfolios</p>
      </div>

      {/* ── Step Indicator ────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {(['basic', 'holdings', 'review'] as const).map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s)}
              className={`px-4 py-2 rounded-md font-medium transition ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {idx + 1}. {s === 'basic' ? 'Portfolio Info' : s === 'holdings' ? 'Holdings' : 'Review'}
            </button>
            {idx < 2 && <div className="w-4 h-0.5 bg-slate-300" />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Basic Information ─────────────────────────────────────── */}
      {step === 'basic' && (
        <Card className="p-8 bg-white border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Portfolio Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Portfolio Name *
              </label>
              <Input
                type="text"
                value={portfolioData.name}
                onChange={(e) => setPortfolioData({ ...portfolioData, name: e.target.value })}
                placeholder="e.g., Growth Portfolio 2024"
                className="bg-white border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client (Optional)
              </label>
              <select
                value={portfolioData.clientId}
                onChange={(e) => setPortfolioData({ ...portfolioData, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
              >
                <option value="">Select a client...</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Portfolio Type
              </label>
              <select
                value={portfolioData.type}
                onChange={(e) => setPortfolioData({ ...portfolioData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
              >
                <option value="equity">Equity (Growth Focused)</option>
                <option value="balanced">Balanced (Growth & Income)</option>
                <option value="fixed-income">Fixed Income (Conservative)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Risk Score: {portfolioData.riskScore}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={portfolioData.riskScore}
                onChange={(e) => setPortfolioData({ ...portfolioData, riskScore: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={portfolioData.description}
                onChange={(e) => setPortfolioData({ ...portfolioData, description: e.target.value })}
                placeholder="Investment strategy and objectives..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
              />
            </div>

            <Button
              onClick={() => setStep('holdings')}
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              Next: Add Holdings
            </Button>
          </div>
        </Card>
      )}

      {/* ── STEP 2: Holdings ──────────────────────────────────────────────── */}
      {step === 'holdings' && (
        <Card className="p-8 bg-white border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Add Holdings</h2>

          {holdings.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-900">
                <strong>Portfolio Value:</strong> ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
              {Object.entries(allocation).length > 0 && (
                <p className="text-sm text-blue-800 mt-2">
                  <strong>Assets:</strong> {Object.entries(allocation).map(([asset, val]) =>
                    `${asset} (${Math.round((val/totalValue)*100)}%)`
                  ).join(', ')}
                </p>
              )}
            </div>
          )}

          {/* ── Add holding form ──────────────────────────────────────── */}
          <div className="mb-6 p-6 bg-slate-50 rounded-md border border-slate-200">
            <h3 className="font-medium text-slate-900 mb-4">Add New Holding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ticker Symbol
                </label>
                <Input
                  type="text"
                  value={newHolding.symbol}
                  onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value.toUpperCase() })}
                  placeholder="AAPL"
                  className="bg-white border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Shares
                </label>
                <Input
                  type="number"
                  value={newHolding.shares || ''}
                  onChange={(e) => setNewHolding({ ...newHolding, shares: parseFloat(e.target.value) })}
                  placeholder="100"
                  className="bg-white border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Purchase Price per Share
                </label>
                <Input
                  type="number"
                  value={newHolding.purchasePrice || ''}
                  onChange={(e) => setNewHolding({ ...newHolding, purchasePrice: parseFloat(e.target.value) })}
                  placeholder="150.00"
                  className="bg-white border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sector
                </label>
                <Input
                  type="text"
                  value={newHolding.sector}
                  onChange={(e) => setNewHolding({ ...newHolding, sector: e.target.value })}
                  placeholder="Technology"
                  className="bg-white border-slate-300"
                />
              </div>
            </div>
            <Button
              onClick={handleAddHolding}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Holding
            </Button>
          </div>

          {/* ── Holdings list ────────────────────────────────────────────── */}
          {holdings.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-slate-900 mb-3">Portfolio Holdings</h3>
              <div className="space-y-2">
                {holdings.map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">{h.symbol}</p>
                      <p className="text-xs text-slate-600">
                        {h.shares} shares @ ${h.purchasePrice.toFixed(2)} = ${(h.shares * h.purchasePrice).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </p>
                      {h.sector && <p className="text-xs text-slate-500">{h.sector}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveHolding(idx)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => setStep('basic')}
              variant="outline"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep('review')}
              disabled={holdings.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Review Portfolio
            </Button>
          </div>
        </Card>
      )}

      {/* ── STEP 3: Review ────────────────────────────────────────────────── */}
      {step === 'review' && (
        <Card className="p-8 bg-white border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Review Portfolio</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Portfolio Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="text-slate-900 font-medium">{portfolioData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Type</p>
                  <p className="text-slate-900 font-medium capitalize">{portfolioData.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Value</p>
                  <p className="text-slate-900 font-medium">${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Risk Score</p>
                  <p className="text-slate-900 font-medium">{portfolioData.riskScore}/100</p>
                </div>
              </div>
              {portfolioData.description && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600">Description</p>
                  <p className="text-slate-900">{portfolioData.description}</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="font-medium text-slate-900 mb-3">Holdings ({holdings.length})</h3>
              <div className="space-y-2">
                {holdings.map((h, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-700">{h.symbol}</span>
                    <span className="text-slate-900 font-medium">${(h.shares * h.purchasePrice).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-900">
                ✓ Portfolio is ready to be created. You can update holdings later if needed.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep('holdings')}
                variant="outline"
              >
                Back
              </Button>
              <Button
                onClick={handleCreatePortfolio}
                disabled={createMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-1" />
                {createMutation.isPending ? 'Creating...' : 'Create Portfolio'}
              </Button>
            </div>

            <Link href="/dashboard/portfolios">
              <Button variant="ghost" className="w-full">
                Back to Portfolios
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
