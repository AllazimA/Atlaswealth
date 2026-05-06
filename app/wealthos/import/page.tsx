'use client'

import { useState } from 'react'
import { useWealth } from '@/components/wealthos/WealthContext'
import { Upload, FileText, CheckCircle, AlertCircle, Building2 } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

interface ParsedRow {
  description: string
  amount: number
  date: string
  type: 'credit' | 'debit'
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))
  const descIdx = header.findIndex(h => h.includes('desc') || h.includes('narr') || h.includes('detail') || h.includes('memo'))
  const amtIdx = header.findIndex(h => h.includes('amount') || h.includes('amt'))
  const dateIdx = header.findIndex(h => h.includes('date'))
  if (amtIdx === -1 || dateIdx === -1) return []

  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/"/g, ''))
    const amount = parseFloat(cols[amtIdx]?.replace(/[^-\d.]/g, '') || '0')
    return {
      description: descIdx >= 0 ? cols[descIdx] : `Transaction`,
      amount: Math.abs(amount),
      date: cols[dateIdx] || new Date().toISOString().split('T')[0],
      type: (amount >= 0 ? 'credit' : 'debit') as 'credit' | 'debit'
    }
  }).filter(r => !isNaN(r.amount) && r.amount > 0)
}

export default function ImportPage() {
  const { data, addTransaction } = useWealth()
  const [dragging, setDragging] = useState(false)
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [imported, setImported] = useState(false)
  const [error, setError] = useState('')

  function processFile(file: File) {
    if (!file.name.endsWith('.csv')) { setError('Please upload a CSV file'); return }
    setError('')
    setImported(false)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const rows = parseCSV(e.target?.result as string)
      if (rows.length === 0) setError('Could not parse CSV. Ensure it has Date, Amount, and Description columns.')
      else setParsed(rows)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleImport() {
    if (!parsed || !selectedAccount) return
    parsed.forEach(row => addTransaction(selectedAccount, { description: row.description, amount: row.amount, date: row.date, type: row.type }))
    setImported(true)
    setParsed(null)
    setFileName('')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Import Data</h1>
        <p className="text-gray-400 mt-1">Upload bank CSV exports to sync your transactions</p>
      </div>

      <div className="max-w-2xl">
        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors mb-6 ${dragging ? 'border-amber-500 bg-amber-500/5' : 'border-white/10 hover:border-white/20'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <div className="text-white font-medium mb-2">Drop your CSV file here</div>
          <div className="text-gray-500 text-sm mb-6">or click to browse</div>
          <label className="cursor-pointer px-6 py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-sm">
            Choose File
            <input type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
          </label>
          <div className="text-gray-600 text-xs mt-4">Supported: CSV files from any bank export</div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span className="text-rose-400 text-sm">{error}</span>
          </div>
        )}

        {imported && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-emerald-400 text-sm">Transactions imported successfully!</span>
          </div>
        )}

        {parsed && (
          <div className="bg-[#1a1f2e] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-white font-semibold">{fileName}</span>
                <span className="text-gray-500 text-sm">— {parsed.length} transactions</span>
              </div>
            </div>

            <div className="p-5 border-b border-white/5">
              <label className="text-gray-400 text-sm block mb-2">Import to Account</label>
              {data.accounts.length === 0 ? (
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <Building2 className="w-4 h-4" />
                  Please add an account first in the Accounts section
                </div>
              ) : (
                <select
                  className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  value={selectedAccount}
                  onChange={e => setSelectedAccount(e.target.value)}
                >
                  <option value="">Select an account...</option>
                  {data.accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} — {a.bank}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
              {parsed.slice(0, 20).map((row, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-white text-sm">{row.description}</div>
                    <div className="text-gray-500 text-xs">{row.date}</div>
                  </div>
                  <span className={`text-sm font-semibold ${row.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row.type === 'credit' ? '+' : '-'}{fmt(row.amount)}
                  </span>
                </div>
              ))}
              {parsed.length > 20 && (
                <div className="px-5 py-3 text-gray-500 text-sm">...and {parsed.length - 20} more</div>
              )}
            </div>

            <div className="p-5 border-t border-white/5">
              <button
                onClick={handleImport}
                disabled={!selectedAccount}
                className="w-full py-3 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Import {parsed.length} Transactions
              </button>
            </div>
          </div>
        )}

        {/* Format guide */}
        <div className="mt-6 bg-[#1a1f2e] rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-medium mb-3">CSV Format Guide</h3>
          <p className="text-gray-500 text-sm mb-3">Your CSV should include columns for:</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { col: 'Date', ex: '2026-05-01' },
              { col: 'Amount', ex: '-1500.00' },
              { col: 'Description', ex: 'Salary Payment' },
            ].map(({ col, ex }) => (
              <div key={col} className="bg-[#111318] rounded-xl p-3">
                <div className="text-amber-400 text-xs font-medium mb-1">{col}</div>
                <div className="text-gray-500 text-xs font-mono">{ex}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
