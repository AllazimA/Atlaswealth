'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the Vite Dashboard component to avoid SSR issues
const OriginalDashboard = dynamic(
  () => import('@/components/atlas/pages/Dashboard').catch(() => {
    return { default: () => <div>Dashboard Component Loading...</div> }
  }),
  { ssr: false }
)

export default function DashboardPage() {
  return <OriginalDashboard />
}
