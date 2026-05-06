import { WealthProvider } from '@/components/wealthos/WealthContext'
import Sidebar from '@/components/wealthos/Sidebar'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const AuthGate = dynamic(() => import('@/components/wealthos/AuthGate'), { ssr: false })

export const metadata = { title: 'WealthOS — Premium Finance Suite' }

const USER = { name: 'A A', email: 'a.allazim@gmail.com' }

export default function WealthOSLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <WealthProvider>
        <div className="flex min-h-screen bg-[#111318] text-white" data-wealthos="true">
          <Sidebar user={USER} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </WealthProvider>
    </AuthGate>
  )
}
