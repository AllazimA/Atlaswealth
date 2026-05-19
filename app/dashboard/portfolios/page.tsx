'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { atlasClient } from '@/lib/atlas-api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Search, Loader2, Trash2, Eye, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function PortfoliosPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const queryClient = useQueryClient()

  // ── Fetch portfolios ───────────────────────────────────────────────────────
  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ['portfolios'],
    queryFn: () => atlasClient.portfolios.list(),
  })

  // ── Delete portfolio ───────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => atlasClient.portfolios.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      toast.success('Portfolio deleted')
    },
    onError: () => toast.error('Failed to delete portfolio'),
  })

  // ── Create portfolio ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: any) => atlasClient.portfolios.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      setShowAddForm(false)
      toast.success('Portfolio created successfully')
    },
    onError: () => toast.error('Failed to create portfolio'),
  })

  // ── Filter portfolios ──────────────────────────────────────────────────────
  const filtered = portfolios.filter((p: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  })

  const handleAddPortfolio = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const portfolioData = {
      clientId: formData.get('clientId') || 'default',
      name: formData.get('name'),
      type: formData.get('type') || 'equity',
      totalValue: parseFloat((formData.get('totalValue') as string) || '0'),
      allocation: {
        stocks: parseFloat((formData.get('stocks') as string) || '60'),
        bonds: parseFloat((formData.get('bonds') as string) || '30'),
        crypto: parseFloat((formData.get('crypto') as string) || '5'),
        cash: parseFloat((formData.get('cash') as string) || '5'),
      },
      riskScore: parseFloat((formData.get('riskScore') as string) || '50'),
      description: formData.get('description') || '',
    }

    createMutation.mutate(portfolioData)
    ;(e.target as HTMLFormElement).reset()
  }

  const totalValue = portfolios.reduce((sum: number, p: any) => sum + (p.totalValue || 0), 0)
  const avgRiskScore = portfolios.length
    ? Math.round(portfolios.reduce((sum: number, p: any) => sum + (p.riskScore || 0), 0) / portfolios.length)
    : 0

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Portfolios</h1>
          <p className="text-sm text-slate-600 mt-1">Manage investment portfolios</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Portfolio
        </Button>
      </div>

      {/* ── Stats Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white border-slate-200">
          <div className="text-sm text-slate-600">Total Portfolios</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{portfolios.length}</div>
        </Card>
        <Card className="p-6 bg-white border-slate-200">
          <div className="text-sm text-slate-600">Total AUM</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            ${(totalValue / 1_000_000).toFixed(1)}M
          </div>
        </Card>
        <Card className="p-6 bg-white border-slate-200">
          <div className="text-sm text-slate-600">Avg Risk Score</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{avgRiskScore}</div>
        </Card>
      </div>

      {/* ── Create Form ───────────────────────────────────────────────────── */}
      {showAddForm && (
        <Card className="p-6 bg-slate-50 border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Portfolio</h3>
          <form onSubmit={handleAddPortfolio} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Portfolio Name *
              </label>
              <Input
                type="text"
                name="name"
                placeholder="Growth Portfolio"
                required
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <select
                name="type"
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
              >
                <option value="equity">Equity</option>
                <option value="balanced">Balanced</option>
                <option value="fixed-income">Fixed Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Total Value ($)
              </label>
              <Input
                type="number"
                name="totalValue"
                placeholder="500000"
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Risk Score (1-100)
              </label>
              <Input
                type="number"
                name="riskScore"
                min="1"
                max="100"
                placeholder="50"
                className="bg-white border-slate-300"
              />
            </div>

            {/* ── Allocation section ────────────────────────────────────── */}
            <div className="col-span-full border-t pt-4">
              <h4 className="font-medium text-slate-900 mb-3">Asset Allocation (%)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Stocks</label>
                  <Input
                    type="number"
                    name="stocks"
                    min="0"
                    max="100"
                    placeholder="60"
                    className="bg-white border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Bonds</label>
                  <Input
                    type="number"
                    name="bonds"
                    min="0"
                    max="100"
                    placeholder="30"
                    className="bg-white border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Crypto</label>
                  <Input
                    type="number"
                    name="crypto"
                    min="0"
                    max="100"
                    placeholder="5"
                    className="bg-white border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Cash</label>
                  <Input
                    type="number"
                    name="cash"
                    min="0"
                    max="100"
                    placeholder="5"
                    className="bg-white border-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <Input
                type="text"
                name="description"
                placeholder="Portfolio description..."
                className="bg-white border-slate-300"
              />
            </div>

            <div className="col-span-full flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Portfolio'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search portfolios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-slate-300"
        />
      </div>

      {/* ── Portfolios Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Loading portfolios...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              {searchQuery ? 'No portfolios match your search' : 'No portfolios yet'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Create your first portfolio
              </Button>
            )}
          </div>
        ) : (
          filtered.map((portfolio: any) => (
            <Card key={portfolio.id} className="p-6 bg-white border-slate-200 hover:shadow-lg transition">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-900">{portfolio.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{portfolio.type}</p>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <p className="text-slate-600">
                  <span className="font-medium">Value:</span> ${(portfolio.totalValue || 0).toLocaleString()}
                </p>
                <p className="text-slate-600">
                  <span className="font-medium">Risk:</span> {portfolio.riskScore}/100
                </p>
                {portfolio.description && (
                  <p className="text-slate-600 italic text-xs">{portfolio.description}</p>
                )}
              </div>

              {/* ── Allocation preview ────────────────────────────────── */}
              {portfolio.allocation && (
                <div className="mb-4 p-3 bg-slate-50 rounded">
                  <p className="text-xs font-medium text-slate-700 mb-2">Allocation</p>
                  <div className="space-y-1 text-xs">
                    {portfolio.allocation.stocks > 0 && (
                      <p className="text-slate-600">📈 Stocks: {portfolio.allocation.stocks}%</p>
                    )}
                    {portfolio.allocation.bonds > 0 && (
                      <p className="text-slate-600">🏦 Bonds: {portfolio.allocation.bonds}%</p>
                    )}
                    {portfolio.allocation.crypto > 0 && (
                      <p className="text-slate-600">₿ Crypto: {portfolio.allocation.crypto}%</p>
                    )}
                    {portfolio.allocation.cash > 0 && (
                      <p className="text-slate-600">💰 Cash: {portfolio.allocation.cash}%</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Link href={`/dashboard/portfolios/${portfolio.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(portfolio.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
