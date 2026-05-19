'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Search, Loader2, Clock } from 'lucide-react'
import Link from 'next/link'

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface TopMover {
  symbol: string
  name: string
  price: number
  changePercent: number
  volume: number
  industry: string
}

interface MarketData {
  lastUpdated: string
  marketStatus: {
    isOpen: boolean
    openTime: string
    closeTime: string
    hoursRemaining: number
  }
  indices: MarketIndex[]
  topGainers: TopMover[]
  topLosers: TopMover[]
  mostActive: TopMover[]
}

export default function TodaysMarketPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [selectedTab, setSelectedTab] = useState<'gainers' | 'losers' | 'active'>('gainers')

  // ── Fetch market data ────────────────────────────────────────────────────────
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['market-today'],
    queryFn: async () => {
      const response = await fetch('/api/market-data/today')
      if (!response.ok) throw new Error('Failed to fetch market data')
      return response.json() as Promise<MarketData>
    },
    refetchInterval: 60000, // Refresh every minute during market hours
  })

  // ── Handle search ──────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      // Navigate to stock analysis page
      router.push(`/dashboard/stock-analysis?symbol=${searchInput.toUpperCase()}`)
    }
  }

  // ── Format percentage ──────────────────────────────────────────────────────
  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  // ── Format volume ──────────────────────────────────────────────────────────
  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`
    return volume.toString()
  }

  if (isLoading || !marketData) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Today's Market</h1>
          <p className="text-slate-600 mt-1">Real-time market overview and top movers</p>
        </div>

        <div className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading market data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Today's Market</h1>
          <p className="text-slate-600 mt-1">Real-time market overview and top movers</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${marketData.marketStatus.isOpen ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm font-medium ${marketData.marketStatus.isOpen ? 'text-green-600' : 'text-red-600'}`}>
              {marketData.marketStatus.isOpen ? 'Market Open' : 'Market Closed'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Last updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────── */}
      <Card className="p-4 bg-white border-slate-200">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search stock symbol (e.g., AAPL, MSFT, TSLA)"
              className="bg-white border-slate-300"
            />
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </Card>

      {/* ── Market Indices ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Market Indices</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketData.indices.map((index) => (
            <Card key={index.symbol} className="p-6 bg-white border-slate-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">{index.name}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{index.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {index.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-semibold">
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({formatPercent(index.changePercent)})
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Top Movers Tabs ───────────────────────────────────────────────── */}
      <div>
        <div className="flex gap-2 mb-4 border-b border-slate-200">
          {(['gainers', 'losers', 'active'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                selectedTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'gainers' ? '🚀 Top Gainers' : tab === 'losers' ? '📉 Top Losers' : '📊 Most Active'}
            </button>
          ))}
        </div>

        {/* ── Gainers Table ───────────────────────────────────────────────── */}
        {selectedTab === 'gainers' && (
          <Card className="p-6 bg-white border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Symbol</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Company</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Change</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {marketData.topGainers.map((stock, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{stock.symbol}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{stock.name}</div>
                      <div className="text-xs text-slate-500">{stock.industry}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-slate-900">${stock.price.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="flex items-center justify-end gap-1 text-green-600 font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        {formatPercent(stock.changePercent)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/stock-analysis?symbol=${stock.symbol}`}>
                        <Button size="sm" variant="outline" className="border-slate-300">
                          Analyze
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ── Losers Table ──────────────────────────────────────────────── */}
        {selectedTab === 'losers' && (
          <Card className="p-6 bg-white border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Symbol</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Company</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Change</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {marketData.topLosers.map((stock, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{stock.symbol}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{stock.name}</div>
                      <div className="text-xs text-slate-500">{stock.industry}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-slate-900">${stock.price.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="flex items-center justify-end gap-1 text-red-600 font-semibold">
                        <TrendingDown className="w-4 h-4" />
                        {formatPercent(stock.changePercent)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/stock-analysis?symbol=${stock.symbol}`}>
                        <Button size="sm" variant="outline" className="border-slate-300">
                          Analyze
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ── Most Active Table ─────────────────────────────────────────── */}
        {selectedTab === 'active' && (
          <Card className="p-6 bg-white border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Symbol</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Company</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Volume</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Change</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {marketData.mostActive.map((stock, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{stock.symbol}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{stock.name}</div>
                      <div className="text-xs text-slate-500">{stock.industry}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-slate-900">${stock.price.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-slate-700">{formatVolume(stock.volume)}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`flex items-center justify-end gap-1 font-semibold ${
                          stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stock.changePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {formatPercent(stock.changePercent)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/stock-analysis?symbol=${stock.symbol}`}>
                        <Button size="sm" variant="outline" className="border-slate-300">
                          Analyze
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* ── Info Section ──────────────────────────────────────────────────── */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> Click "Analyze" to view detailed charts, technical indicators, company information, and news for any stock.
        </p>
      </Card>
    </div>
  )
}
