'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { atlasClient } from '@/lib/atlas-api-client'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Edit, Save, X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const [isEditing, setIsEditing] = useState(false)

  const queryClient = useQueryClient()

  // ── Fetch client details ───────────────────────────────────────────────────
  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => atlasClient.clients.get(clientId),
    enabled: !!clientId,
  })

  // ── Update client mutation ─────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: any) => atlasClient.clients.update(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setIsEditing(false)
      toast.success('Client updated successfully')
    },
    onError: () => toast.error('Failed to update client'),
  })

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const updates = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      netWorth: parseFloat((formData.get('netWorth') as string) || '0'),
      riskProfile: formData.get('riskProfile'),
      notes: formData.get('notes'),
    }

    updateMutation.mutate(updates)
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
        </div>
        <Card className="p-6 bg-red-50 border-red-200">
          <p className="text-red-900">Client not found</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading client details...</p>
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
            <p className="text-slate-600 mt-1">{client.email}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className={isEditing ? 'bg-slate-600' : 'bg-blue-600'}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4 mr-1" /> Cancel
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-1" /> Edit
            </>
          )}
        </Button>
      </div>

      {/* ── Status Badge ──────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          client.status === 'active'
            ? 'bg-green-100 text-green-800'
            : client.status === 'inactive'
              ? 'bg-slate-100 text-slate-800'
              : 'bg-yellow-100 text-yellow-800'
        }`}>
          {client.status?.charAt(0).toUpperCase() + (client.status?.slice(1) || '')}
        </span>
      </div>

      {/* ── Client Information ────────────────────────────────────────────── */}
      <Card className="p-8 bg-white border-slate-200">
        {isEditing ? (
          <form onSubmit={handleSaveChanges} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  name="name"
                  defaultValue={client.name}
                  className="bg-white border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  defaultValue={client.email}
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
                  defaultValue={client.phone}
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
                  defaultValue={client.netWorth}
                  className="bg-white border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Risk Profile
                </label>
                <select
                  name="riskProfile"
                  defaultValue={client.riskProfile}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  defaultValue={client.notes}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-1" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                  Email Address
                </p>
                <p className="text-lg text-slate-900 mt-1">{client.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                  Phone
                </p>
                <p className="text-lg text-slate-900 mt-1">{client.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                  Net Worth
                </p>
                <p className="text-lg text-slate-900 mt-1">
                  ${(client.netWorth || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                  Risk Profile
                </p>
                <p className="text-lg text-slate-900 mt-1 capitalize">
                  {client.riskProfile}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                  Status
                </p>
                <p className="text-lg text-slate-900 mt-1 capitalize">
                  {client.status}
                </p>
              </div>
              {client.notes && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
                    Notes
                  </p>
                  <p className="text-slate-900 mt-1">{client.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ── Created/Updated Info ──────────────────────────────────────────── */}
      <div className="text-xs text-slate-500 text-center">
        {client.createdAt && (
          <p>Created on {new Date(client.createdAt).toLocaleDateString()}</p>
        )}
        {client.updatedAt && (
          <p>Last updated on {new Date(client.updatedAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  )
}
