'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { atlasClient } from '@/lib/atlas-api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Plus, Search, ArrowUpDown, TrendingUp, TrendingDown,
  AlertCircle, Calendar, DollarSign, Eye, Sparkles,
  RefreshCw, Target, Loader2, Trash2
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function WatchlistPage() {
  const [activeView, setActiveView] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('symbol')
  const [sortDir, setSortDir] = useState('asc')
  const [showAddForm, setShowAddForm] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const queryClient = useQueryClient()

  // ── Fetch watchlist items ──────────────────────────────────────────────────
  const { data: watchlist = [], isLoading: loadingWatchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => atlasClient.watchlist.list(),
    refetchInterval: 60000, // Refetch every minute
  })

  // ── Delete from watchlist ──────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => atlasClient.watchlist.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      toast.success('Removed from watchlist')
    },
    onError: (error) => {
      toast.error('Failed to remove from watchlist')
      console.error(error)
    },
  })

  // ── Add to watchlist ───────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (itemData: any) => atlasClient.watchlist.add(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      setShowAddForm(false)
      toast.success('Added to watchlist')
    },
    onError: (error) => {
      toast.error('Failed to add to watchlist')
      console.error(error)
    },
  })

  // ── Handle quick add form ──────────────────────────────────────────────────
  const handleQuickAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const itemData = {
      symbol: (formData.get('symbol') as string).toUpperCase(),
      name: formData.get('name') as string,
      sector: formData.get('sector') as string || '',
      notes: formData.get('notes') as string || '',
    }

    if (!itemData.symbol || !itemData.name) {
      toast.error('Symbol and name are required')
      return
    }

    addMutation.mutate(itemData)
    ;(e.target as HTMLFormElement).reset()
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalCount = watchlist.length

  // ── Search and filter ──────────────────────────────────────────────────────
  const filtered = watchlist.filter((item: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      item.symbol?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.sector?.toLowerCase().includes(q)
    )
  })

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sorted = [...filtered].sort((a: any, b: any) => {
    let av = a[sortBy]
    let bv = b[sortBy]

    if (['symbol', 'name', 'sector'].includes(sortBy)) {
      av = (av || '').toLowerCase()
      bv = (bv || '').toLowerCase()
    } else {
      av = parseFloat(av) || 0
      bv = parseFloat(bv) || 0
    }

    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Watchlist</h1>
          <p className="text-sm text-slate-600 mt-1">Monitor stocks and securities</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Stock
        </Button>
      </div>

      {/* ── Add Form (conditional) ────────────────────────────────────────── */}
      {showAddForm && (
        <Card className="p-6 bg-slate-50 border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add to Watchlist</h3>
          <form onSubmit={handleQuickAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Symbol *
              </label>
              <Input
                type="text"
                name="symbol"
                placeholder="AAPL"
                required
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Name *
              </label>
              <Input
                type="text"
                name="name"
                placeholder="Apple Inc."
                required
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sector
              </label>
              <Input
                type="text"
                name="sector"
                placeholder="Technology"
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <Input
                type="text"
                name="notes"
                placeholder="Investment thesis..."
                className="bg-white border-slate-300"
              />
            </div>
            <div className="col-span-full flex gap-2">
              <Button
                type="submit"
                disabled={addMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {addMutation.isPending ? 'Adding...' : 'Add to Watchlist'}
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

      {/* ── Search Bar ────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search by symbol, company, or sector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-slate-300"
        />
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      {totalCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-slate-200">
            <div className="text-sm text-slate-600">Total Items</div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          </Card>
          <Card className="p-4 bg-white border-slate-200">
            <div className="text-sm text-slate-600">Items Added</div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          </Card>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort('symbol')}>
                  <div className="flex items-center gap-2">
                    Symbol {sortBy === 'symbol' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Company {sortBy === 'name' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loadingWatchlist ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Loading watchlist...</p>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Eye className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      {searchQuery ? 'No stocks match your search' : 'No stocks on your watchlist'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => setShowAddForm(true)}
                        variant="outline"
                        size="sm"
                        className="mt-4"
                      >
                        Add your first stock
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                sorted.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{item.symbol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700">{item.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{item.sector || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{item.notes || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      {sorted.length > 0 && (
        <div className="text-xs text-slate-500 text-center">
          Showing {sorted.length} of {totalCount} items
        </div>
      )}
    </div>
  )
}
