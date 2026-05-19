'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { atlasClient } from '@/lib/atlas-api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Search, Loader2, Trash2, Edit, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  // ── Fetch clients ──────────────────────────────────────────────────────────
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => atlasClient.clients.list(),
  })

  // ── Delete client ──────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => atlasClient.clients.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client deleted')
    },
    onError: () => toast.error('Failed to delete client'),
  })

  // ── Add client ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: any) => atlasClient.clients.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setShowAddForm(false)
      toast.success('Client added successfully')
    },
    onError: () => toast.error('Failed to add client'),
  })

  // ── Filter clients ─────────────────────────────────────────────────────────
  const filtered = clients.filter((client: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      client.name?.toLowerCase().includes(q) ||
      client.email?.toLowerCase().includes(q) ||
      client.phone?.toLowerCase().includes(q)
    )
  })

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const clientData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || '',
      status: 'active',
      netWorth: parseFloat((formData.get('netWorth') as string) || '0'),
      riskProfile: formData.get('riskProfile') || 'moderate',
      notes: formData.get('notes') || '',
    }

    createMutation.mutate(clientData)
    ;(e.target as HTMLFormElement).reset()
  }

  const activeClients = clients.filter((c: any) => c.status === 'active').length
  const totalAUM = clients.reduce((sum: number, c: any) => sum + (c.netWorth || 0), 0)

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-600 mt-1">Manage your client relationships</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Client
        </Button>
      </div>

      {/* ── Stats Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white border-slate-200">
          <div className="text-sm text-slate-600">Total Clients</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{clients.length}</div>
        </Card>
        <Card className="p-6 bg-white border-slate-200">
          <div className="text-sm text-slate-600">Active Clients</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{activeClients}</div>
        </Card>
        <Card className="p-6 bg-white border-slate-200">
          <div className="text-sm text-slate-600">Total AUM</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            ${(totalAUM / 1_000_000).toFixed(1)}M
          </div>
        </Card>
      </div>

      {/* ── Add Form ──────────────────────────────────────────────────────── */}
      {showAddForm && (
        <Card className="p-6 bg-slate-50 border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Client</h3>
          <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name *
              </label>
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                required
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                name="email"
                placeholder="john@example.com"
                required
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Net Worth ($)
              </label>
              <Input
                type="number"
                name="netWorth"
                placeholder="1000000"
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Risk Profile
              </label>
              <select
                name="riskProfile"
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <Input
                type="text"
                name="notes"
                placeholder="Additional information..."
                className="bg-white border-slate-300"
              />
            </div>
            <div className="col-span-full flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Client'}
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

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-slate-300"
        />
      </div>

      {/* ── Clients Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Loading clients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="text-slate-400 text-4xl mb-2">👥</div>
            <p className="text-sm text-slate-500">
              {searchQuery ? 'No clients match your search' : 'No clients yet'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Add your first client
              </Button>
            )}
          </div>
        ) : (
          filtered.map((client: any) => (
            <Card key={client.id} className="p-6 bg-white border-slate-200 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{client.name}</h3>
                  <p className="text-sm text-slate-600">{client.email}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {client.phone && <p className="text-slate-600"><span className="font-medium">Phone:</span> {client.phone}</p>}
                <p className="text-slate-600"><span className="font-medium">Net Worth:</span> ${(client.netWorth || 0).toLocaleString()}</p>
                <p className="text-slate-600"><span className="font-medium">Risk:</span> <span className="capitalize">{client.riskProfile}</span></p>
                {client.notes && <p className="text-slate-600 italic">{client.notes}</p>}
              </div>

              <div className="flex gap-2">
                <Link href={`/dashboard/clients/${client.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(client.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
