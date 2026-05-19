'use client'

import { useQuery } from '@tanstack/react-query'
import { atlasClient } from '@/lib/atlas-api-client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, DollarSign, Target, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

export default function DashboardPage() {
  // ── Fetch all data ─────────────────────────────────────────────────────────
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => atlasClient.clients.list(),
  })

  const { data: portfolios = [] } = useQuery({
    queryKey: ['portfolios'],
    queryFn: () => atlasClient.portfolios.list(),
  })

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => atlasClient.watchlist.list(),
  })

  // ── Calculate KPIs ─────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const activeClients = clients.filter((c: any) => c.status === 'active').length
    const activePortfolios = portfolios.filter((p: any) => p.status === 'active').length
    const totalAUM = portfolios.reduce((sum: number, p: any) => sum + (p.totalValue || 0), 0)
    const avgRiskScore = portfolios.length
      ? Math.round(portfolios.reduce((sum: number, p: any) => sum + (p.riskScore || 0), 0) / portfolios.length)
      : 0

    return {
      totalClients: clients.length,
      activeClients,
      totalPortfolios: portfolios.length,
      activePortfolios,
      totalAUM,
      avgRiskScore,
      watchlistItems: watchlist.length,
    }
  }, [clients, portfolios, watchlist])

  // ── Recent clients ─────────────────────────────────────────────────────────
  const recentClients = useMemo(
    () => [...(clients as any[])].reverse().slice(0, 5),
    [clients]
  )

  // ── Top portfolios by AUM ──────────────────────────────────────────────────
  const topPortfolios = useMemo(
    () => [...(portfolios as any[])]
      .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
      .slice(0, 5),
    [portfolios]
  )

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome to your wealth management platform</p>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Clients</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{kpis.totalClients}</p>
              <p className="text-xs text-green-600 mt-1">
                {kpis.activeClients} active
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-500/20" />
          </div>
        </Card>

        {/* Total Portfolios */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Portfolios</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{kpis.totalPortfolios}</p>
              <p className="text-xs text-green-600 mt-1">
                {kpis.activePortfolios} active
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500/20" />
          </div>
        </Card>

        {/* Total AUM */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total AUM</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ${(kpis.totalAUM / 1_000_000).toFixed(1)}M
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {kpis.totalPortfolios > 0 ? `$${(kpis.totalAUM / kpis.totalPortfolios / 1_000).toFixed(0)}K avg` : '—'}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500/20" />
          </div>
        </Card>

        {/* Watchlist Items */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Watchlist Items</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{kpis.watchlistItems}</p>
              <p className="text-xs text-slate-500 mt-1">Tracked stocks</p>
            </div>
            <Target className="w-10 h-10 text-blue-500/20" />
          </div>
        </Card>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Add Client */}
        <Link href="/dashboard/clients">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Add New Client</h3>
                <p className="text-sm text-blue-700 mt-1">Onboard a new wealth client</p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </div>
          </Card>
        </Link>

        {/* Create Portfolio */}
        <Link href="/dashboard/portfolios">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900">Create Portfolio</h3>
                <p className="text-sm text-green-700 mt-1">Build a new investment portfolio</p>
              </div>
              <ArrowRight className="w-5 h-5 text-green-600" />
            </div>
          </Card>
        </Link>
      </div>

      {/* ── Recent Activity ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Clients</h2>
            <Link href="/dashboard/clients">
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All
              </Button>
            </Link>
          </div>

          {recentClients.length === 0 ? (
            <p className="text-sm text-slate-500">No clients yet</p>
          ) : (
            <div className="space-y-3">
              {recentClients.map((client: any) => (
                <div key={client.id} className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{client.name}</p>
                    <p className="text-xs text-slate-600">{client.email}</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    ${(client.netWorth || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Portfolios */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Top Portfolios</h2>
            <Link href="/dashboard/portfolios">
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All
              </Button>
            </Link>
          </div>

          {topPortfolios.length === 0 ? (
            <p className="text-sm text-slate-500">No portfolios yet</p>
          ) : (
            <div className="space-y-3">
              {topPortfolios.map((portfolio: any) => (
                <div key={portfolio.id} className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{portfolio.name}</p>
                    <p className="text-xs text-slate-600">{portfolio.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      ${(portfolio.totalValue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600">Risk: {portfolio.riskScore}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Getting Started ───────────────────────────────────────────────── */}
      {kpis.totalClients === 0 && (
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Getting Started</h2>
          <p className="text-slate-700 mb-4">
            Welcome to Atlas Wealth! Here's how to get started:
          </p>
          <ol className="space-y-2 text-sm text-slate-700 mb-6">
            <li><span className="font-medium">1. Add Clients:</span> Start by adding your wealth management clients</li>
            <li><span className="font-medium">2. Create Portfolios:</span> Build investment portfolios for each client</li>
            <li><span className="font-medium">3. Track Watchlist:</span> Monitor stocks and securities of interest</li>
            <li><span className="font-medium">4. Generate Reports:</span> Create professional reports for clients</li>
          </ol>
          <Link href="/dashboard/clients">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Client
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
