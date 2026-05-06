'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, TrendingDown, Building2,
  Briefcase, Upload, BarChart3, Target, Settings, DollarSign
} from 'lucide-react'

const nav = [
  { label: 'Dashboard', href: '/wealthos', icon: LayoutDashboard },
  { label: 'Income', href: '/wealthos/income', icon: TrendingUp },
  { label: 'Expenses', href: '/wealthos/expenses', icon: TrendingDown },
  { label: 'Accounts', href: '/wealthos/accounts', icon: Building2 },
  { label: 'Investments', href: '/wealthos/investments', icon: Briefcase },
  { label: 'Import', href: '/wealthos/import', icon: Upload },
  { label: 'Analytics', href: '/wealthos/analytics', icon: BarChart3 },
  { label: 'Goals', href: '/wealthos/goals', icon: Target },
  { label: 'Settings', href: '/wealthos/settings', icon: Settings },
]

export default function Sidebar({ user }: { user?: { name: string; email: string } }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-[#0d0d0d] border-r border-white/5 flex flex-col">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">WealthOS</div>
            <div className="text-amber-500/70 text-[10px]">Premium Finance Suite</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = href === '/wealthos' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-amber-500/15 text-amber-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="mb-2 px-3 py-1.5 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs">Synced</span>
        </div>
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{user.name}</div>
              <div className="text-gray-500 text-[10px] truncate">{user.email}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
