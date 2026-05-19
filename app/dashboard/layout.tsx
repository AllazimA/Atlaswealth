'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ClipboardCheck, PieChart, LineChart, Eye,
  TrendingUp, Newspaper, BarChart3, FileText, Settings, Menu, X, ChevronRight
} from 'lucide-react'
import BrandLogo from '@/components/atlas/BrandLogo'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Clients', icon: Users, href: '/dashboard/clients' },
  { name: 'Client Assessment', icon: ClipboardCheck, href: '/dashboard/client-assessment' },
  { name: 'Portfolio Builder', icon: PieChart, href: '/dashboard/portfolio-builder' },
  { name: 'Virtual Portfolio', icon: LineChart, href: '/dashboard/virtual-portfolio' },
  { name: 'Advisor Toolkit', icon: Newspaper, href: '/dashboard/news-research' },
  { name: 'Stock Analysis', icon: BarChart3, href: '/dashboard/stock-analysis' },
  { name: 'Watchlist', icon: Eye, href: '/dashboard/watchlist' },
  { name: "Today's Market", icon: TrendingUp, href: '/dashboard/todays-market' },
  { name: 'Reports', icon: FileText, href: '/dashboard/reports' },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 border-b border-slate-700 flex items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-slate-900 font-bold text-lg">
              AW
            </div>
            {sidebarOpen && <span className="text-white font-semibold">Atlas Wealth</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title={item.name}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-16 border-t border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between">
          <h1 className="text-white font-semibold">Atlas Wealth</h1>
          <button className="text-slate-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-900">
          {children}
        </div>
      </main>
    </div>
  )
}
