import { Suspense } from 'react'
import { StockAnalysisContent } from './stock-analysis-content'

export const metadata = {
  title: 'Stock Analysis | Atlas Wealth',
  description: 'Research and analyze individual stocks with real-time data and technical analysis',
}

export default function StockAnalysisPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Stock Analysis</h1>
        <p className="text-slate-600 mt-1">Research and technical analysis tools</p>
      </div>

      <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
        <StockAnalysisContent />
      </Suspense>
    </div>
  )
}
