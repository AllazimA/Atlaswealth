'use client'

import { useState, useMemo, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, TrendingUp, TrendingDown, Star, Search, X } from 'lucide-react'
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { toast } from 'sonner'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high52Week: number
  low52Week: number
  volume: number
  marketCap: number
  pe: number | null
  dividendYield: number | null
  beta: number | null
  description: string
  industry: string
  website: string
  priceHistory: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
  technicalIndicators: {
    sma50: number
    sma200: number
    rsi: number
  }
}

interface NewsArticle {
  title: string
  source: string
  url: string
  publishedAt: string
  summary: string
}

function StockAnalysisInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramSymbol = searchParams.get('symbol')

  const [selectedSymbol, setSelectedSymbol] = useState(paramSymbol || 'AAPL')
  const [searchInput, setSearchInput] = useState('')
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M')
  const [inWatchlist, setInWatchlist] = useState(false)

  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ['stock', selectedSymbol, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/market-data/stocks/${selectedSymbol}?timeframe=${timeframe}`)
      if (!response.ok) throw new Error('Failed to fetch stock data')
      return response.json() as Promise<StockData>
    },
    enabled: !!selectedSymbol,
  })

  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ['stock-news', selectedSymbol],
    queryFn: async () => {
      const response = await fetch(`/api/market-data/stocks/${selectedSymbol}/news`)
      if (!response.ok) throw new Error('Failed to fetch news')
      return response.json() as Promise<{ articles: NewsArticle[] }>
    },
    enabled: !!selectedSymbol,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const symbol = searchInput.toUpperCase()
    if (symbol) {
      setSelectedSymbol(symbol)
      setSearchInput('')
      router.push(`/dashboard/stock-analysis?symbol=${symbol}`)
    }
  }

  const toggleWatchlist = () => {
    setInWatchlist(!inWatchlist)
    toast.success(inWatchlist ? 'Removed from watchlist' : 'Added to watchlist')
  }

  if (stockLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const upColor = '#22c55e'
  const downColor = '#ef4444'
  const stockColor = stockData && stockData.change >= 0 ? upColor : downColor

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{stockData?.name || selectedSymbol}</h1>
            <p className="text-gray-500">{selectedSymbol}</p>
          </div>
          <Button
            variant={inWatchlist ? 'default' : 'outline'}
            size="lg"
            onClick={toggleWatchlist}
            className="gap-2"
          >
            <Star className="w-4 h-4" fill={inWatchlist ? 'currentColor' : 'none'} />
            {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search symbol (e.g., AAPL, MSFT, GOOGL)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="lg" className="gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </form>
      </div>

      {/* Price Section */}
      {stockData && (
        <Card className="p-6">
          <div className="flex items-baseline gap-4">
            <div className="text-4xl font-bold">${stockData.price.toFixed(2)}</div>
            <div className={`text-2xl font-semibold flex items-center gap-2`} style={{ color: stockColor }}>
              {stockData.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {Math.abs(stockData.change).toFixed(2)} ({Math.abs(stockData.changePercent).toFixed(2)}%)
            </div>
          </div>
        </Card>
      )}

      {/* Chart */}
      {stockData && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stockData.priceHistory}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stockColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={stockColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: `1px solid ${stockColor}` }}
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={stockColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Fundamentals */}
      {stockData && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Key Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">P/E Ratio</p>
              <p className="text-lg font-semibold">{stockData.pe?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Market Cap</p>
              <p className="text-lg font-semibold">${(stockData.marketCap / 1e9).toFixed(1)}B</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dividend Yield</p>
              <p className="text-lg font-semibold">{stockData.dividendYield?.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">52W High</p>
              <p className="text-lg font-semibold">${stockData.high52Week.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">52W Low</p>
              <p className="text-lg font-semibold">${stockData.low52Week.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Beta</p>
              <p className="text-lg font-semibold">{stockData.beta?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* News */}
      {newsData && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Latest News</h2>
          <div className="space-y-4">
            {newsData.articles.slice(0, 5).map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-600 hover:underline">{article.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">{article.source}</div>
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export function StockAnalysisContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StockAnalysisInner />
    </Suspense>
  )
}
