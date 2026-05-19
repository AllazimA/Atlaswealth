'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { atlasClient } from '@/lib/atlas-api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as PieChartComponent,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { toast } from 'sonner'

// Sample portfolio history data
const PORTFOLIO_HISTORY = [
  { date: 'Jan', value: 25000 },
  { date: 'Feb', value: 26500 },
  { date: 'Mar', value: 25800 },
  { date: 'Apr', value: 29500 },
  { date: 'May', value: 31200 },
  { date: 'Jun', value: 32800 },
  { date: 'Jul', value: 34100 },
  { date: 'Aug', value: 35500 },
  { date: 'Sep', value: 36800 },
  { date: 'Oct', value: 38500 },
]

interface VirtualHolding {
  id: string
  symbol: string
  name: string
  quantity: number
  avgCost: number
  purchaseDate: string
  sector?: string
}

interface VirtualPortfolio {
  id: string
  name: string
  initialCash: number
  currentCash: number
  holdings: VirtualHolding[]
  createdAt: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

export default function VirtualPortfolioPage() {
  const queryClient = useQueryClient()

  // State
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'Holdings' | 'Analytics' | 'Risk & AI' | 'Activity'>('Holdings')
  const [showAddHolding, setShowAddHolding] = useState(false)
  const [editingHolding, setEditingHolding] = useState<VirtualHolding | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    avgCost: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  })

  // Fetch virtual portfolios
  const { data: portfolios = [] } = useQuery({
    queryKey: ['virtualPortfolios'],
    queryFn: () => atlasClient.virtualPortfolios.list(),
  })

  // Set default portfolio
  const portfolio = portfolios.find((p: any) => p.id === selectedPortfolioId) || portfolios[0]

  if (!selectedPortfolioId && portfolios.length > 0) {
    setSelectedPortfolioId(portfolios[0].id)
  }

  // Add holding mutation
  const addHoldingMutation = useMutation({
    mutationFn: (data: VirtualHolding) =>
      atlasClient.virtualPortfolios.addHolding(selectedPortfolioId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtualPortfolios'] })
      toast.success('Holding added successfully')
      setShowAddHolding(false)
      setFormData({
        symbol: '',
        name: '',
        quantity: '',
        avgCost: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      })
    },
    onError: () => toast.error('Failed to add holding'),
  })

  // Update holding mutation
  const updateHoldingMutation = useMutation({
    mutationFn: (data: VirtualHolding) =>
      atlasClient.virtualPortfolios.updateHolding(selectedPortfolioId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtualPortfolios'] })
      toast.success('Holding updated successfully')
      setShowAddHolding(false)
      setEditingHolding(null)
      setFormData({
        symbol: '',
        name: '',
        quantity: '',
        avgCost: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      })
    },
    onError: () => toast.error('Failed to update holding'),
  })

  // Delete holding mutation
  const deleteHoldingMutation = useMutation({
    mutationFn: (holdingId: string) =>
      atlasClient.virtualPortfolios.deleteHolding(selectedPortfolioId!, holdingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtualPortfolios'] })
      toast.success('Holding removed successfully')
    },
    onError: () => toast.error('Failed to delete holding'),
  })

  // Calculate metrics
  const metrics = useMemo(() => {
    const holdings = portfolio?.holdings || []
    const totalCost = holdings.reduce((sum, h) => sum + h.quantity * h.avgCost, 0)
    const totalValue = holdings.reduce((sum, h) => sum + h.quantity * (prices[h.symbol] || h.avgCost), 0)
    const totalReturn = totalValue - totalCost
    const totalReturnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0
    const dailyChange = totalValue * 0.0125

    const sortedByGain = [...holdings].sort((a, b) => {
      const gainA = (prices[a.symbol] || a.avgCost - a.avgCost) * a.quantity
      const gainB = (prices[b.symbol] || b.avgCost - b.avgCost) * b.quantity
      return gainB - gainA
    })

    return {
      totalValue,
      totalCost,
      totalReturn,
      totalReturnPct,
      dailyPnL: dailyChange,
      dailyPnLPct: (dailyChange / (totalValue || 1)) * 100,
      cashPosition: portfolio?.currentCash || 0,
      numHoldings: holdings.length,
      bestPerformer: sortedByGain[0],
      worstPerformer: sortedByGain[sortedByGain.length - 1],
    }
  }, [portfolio, prices])

  // Filter holdings
  const filteredHoldings = useMemo(
    () =>
      (portfolio?.holdings || []).filter(
        (h) =>
          h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [portfolio, searchTerm]
  )

  // Refresh prices
  const refreshPrices = useCallback(async () => {
    setRefreshing(true)
    const holdings = portfolio?.holdings || []
    const newPrices: Record<string, number> = {}

    // Simulate price fetch (in production, would call market data API)
    for (const holding of holdings) {
      // Mock price between 80-120% of average cost
      const mockPrice = holding.avgCost * (0.8 + Math.random() * 0.4)
      newPrices[holding.symbol] = parseFloat(mockPrice.toFixed(2))
    }

    setPrices(newPrices)
    toast.success(`Updated ${holdings.length} prices`)
    setRefreshing(false)
  }, [portfolio])

  // Handle add holding
  const handleAddHolding = useCallback(async () => {
    if (!formData.symbol?.trim() || !formData.quantity || !formData.avgCost) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    const newHolding: VirtualHolding = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || formData.symbol,
      quantity: parseFloat(formData.quantity),
      avgCost: parseFloat(formData.avgCost),
      purchaseDate: formData.purchaseDate,
    }

    try {
      await addHoldingMutation.mutateAsync(newHolding)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, addHoldingMutation])

  // Handle update holding
  const handleUpdateHolding = useCallback(async () => {
    if (!editingHolding || !formData.quantity || !formData.avgCost) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    const updatedHolding: VirtualHolding = {
      ...editingHolding,
      symbol: formData.symbol.toUpperCase(),
      name: formData.name,
      quantity: parseFloat(formData.quantity),
      avgCost: parseFloat(formData.avgCost),
      purchaseDate: formData.purchaseDate,
    }

    try {
      await updateHoldingMutation.mutateAsync(updatedHolding)
    } finally {
      setIsSubmitting(false)
    }
  }, [editingHolding, formData, updateHoldingMutation])

  // Handle edit holding
  const handleEditHolding = (holding: VirtualHolding) => {
    setEditingHolding(holding)
    setFormData({
      symbol: holding.symbol,
      name: holding.name,
      quantity: holding.quantity.toString(),
      avgCost: holding.avgCost.toString(),
      purchaseDate: holding.purchaseDate,
    })
    setShowAddHolding(true)
  }

  // Handle delete holding
  const handleDeleteHolding = (holdingId: string) => {
    if (confirm('Are you sure you want to remove this holding?')) {
      deleteHoldingMutation.mutate(holdingId)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const csv = [
      ['Symbol', 'Quantity', 'Avg Cost', 'Current Price', 'Market Value', 'Gain/Loss', 'Return %'],
      ...filteredHoldings.map((h) => {
        const currentPrice = prices[h.symbol] || h.avgCost
        const marketValue = h.quantity * currentPrice
        const gainLoss = marketValue - h.quantity * h.avgCost
        const returnPct = ((currentPrice - h.avgCost) / h.avgCost) * 100
        return [
          h.symbol,
          h.quantity,
          h.avgCost.toFixed(2),
          currentPrice.toFixed(2),
          marketValue.toFixed(2),
          gainLoss.toFixed(2),
          returnPct.toFixed(2),
        ]
      }),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No virtual portfolios found. Create one to get started.</p>
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Create Portfolio</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Virtual Portfolio</h1>
          <p className="text-slate-600 mt-1">Paper trading & portfolio simulation</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshPrices}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh Prices'}
          </Button>
          <Button
            onClick={() => {
              setEditingHolding(null)
              setShowAddHolding(true)
              setFormData({
                symbol: '',
                name: '',
                quantity: '',
                avgCost: '',
                purchaseDate: new Date().toISOString().split('T')[0],
              })
            }}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Holding
          </Button>
        </div>
      </div>

      {/* Portfolio Selector */}
      <div className="flex items-center gap-4">
        <div className="text-sm font-semibold text-slate-700">Portfolios:</div>
        <div className="flex gap-2">
          {portfolios.map((p: any) => (
            <button
              key={p.id}
              onClick={() => setSelectedPortfolioId(p.id)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                selectedPortfolioId === p.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 bg-white border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Cash Balance</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.cashPosition)}</p>
          <p className="text-xs text-slate-500 mt-1">Available for trading</p>
        </Card>

        <Card className="p-6 bg-white border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalValue)}</p>
          <p className={`text-xs mt-1 ${metrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.totalReturn >= 0 ? '+' : ''}{formatCurrency(metrics.totalReturn)}
          </p>
        </Card>

        <Card className="p-6 bg-white border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Return %</p>
          <p className={`text-2xl font-bold ${metrics.totalReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.totalReturnPct >= 0 ? '+' : ''}{metrics.totalReturnPct.toFixed(2)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">{metrics.numHoldings} holdings</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          {(['Holdings', 'Analytics', 'Risk & AI', 'Activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Holdings Tab */}
      {activeTab === 'Holdings' && (
        <Card className="p-6 bg-white border-slate-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search ticker or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 bg-slate-50 border-slate-300"
              />
            </div>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">SYMBOL</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-medium">QTY</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-medium">PRICE</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-medium">VALUE</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-medium">RETURN %</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-medium">ALLOC %</th>
                  <th className="text-center py-3 px-4 text-slate-600 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredHoldings.map((holding) => {
                  const currentPrice = prices[holding.symbol] || holding.avgCost
                  const marketValue = holding.quantity * currentPrice
                  const gainLoss = marketValue - holding.quantity * holding.avgCost
                  const returnPct = ((currentPrice - holding.avgCost) / holding.avgCost) * 100
                  const allocation = (marketValue / metrics.totalValue) * 100

                  return (
                    <tr key={holding.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{holding.symbol}</div>
                        <div className="text-xs text-slate-500">{holding.name}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900">{holding.quantity}</td>
                      <td className="py-3 px-4 text-right text-slate-900">${currentPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(marketValue)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-semibold ${
                          returnPct >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900">{allocation.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditHolding(holding)}
                            className="text-slate-600 hover:text-blue-600 transition-colors p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHolding(holding.id)}
                            className="text-slate-600 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredHoldings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">No holdings found</p>
            </div>
          )}
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'Analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-slate-900 font-semibold mb-4">Portfolio Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={PORTFOLIO_HISTORY}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-slate-900 font-semibold mb-4">Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChartComponent>
                <Pie
                  data={filteredHoldings.map((holding) => {
                    const marketValue = holding.quantity * (prices[holding.symbol] || holding.avgCost)
                    const allocation = (marketValue / metrics.totalValue) * 100
                    return {
                      name: holding.symbol,
                      value: parseFloat(allocation.toFixed(1)),
                    }
                  })}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {filteredHoldings.map((_, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
              </PieChartComponent>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Risk & AI Tab */}
      {activeTab === 'Risk & AI' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-900 font-semibold text-sm">Concentration Risk</p>
                <p className="text-amber-700 text-sm mt-1">Largest position exceeds 30% threshold</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-semibold text-sm">Rebalancing Suggested</p>
                <p className="text-blue-700 text-sm mt-1">Portfolio drifting from target allocation</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-900 font-semibold text-sm">Portfolio Health</p>
                <p className="text-green-700 text-sm mt-1">12 months positive performance</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'Activity' && (
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-slate-900 font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[...filteredHoldings].reverse().slice(0, 5).map((holding, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-200 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-medium">{holding.symbol} purchase</p>
                  <p className="text-slate-500 text-sm">{holding.purchaseDate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-slate-900 font-medium">
                    {formatCurrency(holding.quantity * holding.avgCost)}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {holding.quantity} shares @ ${holding.avgCost}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add/Edit Holding Dialog */}
      <Dialog open={showAddHolding} onOpenChange={setShowAddHolding}>
        <DialogContent className="bg-white border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              {editingHolding ? 'Edit Holding' : 'Add Holding'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ticker Symbol *
              </label>
              <Input
                placeholder="e.g., AAPL"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="bg-white border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Asset Name
              </label>
              <Input
                placeholder="Company name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantity *
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="bg-white border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Avg Cost ($) *
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.avgCost}
                  onChange={(e) => setFormData({ ...formData, avgCost: e.target.value })}
                  className="bg-white border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Purchase Date
              </label>
              <Input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="bg-white border-slate-300"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={editingHolding ? handleUpdateHolding : handleAddHolding}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingHolding ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  `${editingHolding ? 'Update' : 'Add'} Holding`
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowAddHolding(false)
                  setEditingHolding(null)
                  setFormData({
                    symbol: '',
                    name: '',
                    quantity: '',
                    avgCost: '',
                    purchaseDate: new Date().toISOString().split('T')[0],
                  })
                }}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
