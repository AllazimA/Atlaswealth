'use client'

import AtlasWealthDashboardNavbar from '@/components/AtlasWealthDashboardNavbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-navy-900 min-h-screen">
      <AtlasWealthDashboardNavbar />
      {children}
    </main>
  )
}
