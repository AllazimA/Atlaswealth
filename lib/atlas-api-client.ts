/**
 * Atlas Wealth API Client
 * Wrapper for calling Next.js API endpoints with Firebase authentication
 * Replaces the base44Client from the original Vite app
 */

import { getAuth } from 'firebase/auth'

const API_BASE = '/api'

/**
 * Get Firebase ID token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return null
    return await user.getIdToken()
  } catch (error) {
    console.error('Failed to get auth token:', error)
    return null
  }
}

/**
 * Generic API request wrapper with automatic token injection
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Atlas API Client - Provides methods for all data operations
 * Usage: atlasClient.clients.list(), atlasClient.portfolios.create(), etc.
 */
export const atlasClient = {
  /**
   * Client operations (wealth advisory clients)
   */
  clients: {
    list: async () => {
      const data = await apiRequest<{ clients: any[] }>('/clients')
      return data.clients || []
    },

    create: async (clientData: any) => {
      const data = await apiRequest<{ id: string; message: string }>(
        '/clients',
        { method: 'POST', body: JSON.stringify(clientData) }
      )
      return data
    },

    get: async (id: string) => {
      const data = await apiRequest<{ client: any }>(`/clients/${id}`)
      return data.client
    },

    update: async (id: string, updates: any) => {
      const data = await apiRequest<{ message: string }>(
        `/clients/${id}`,
        { method: 'PUT', body: JSON.stringify(updates) }
      )
      return data
    },

    delete: async (id: string) => {
      const data = await apiRequest<{ message: string }>(
        `/clients/${id}`,
        { method: 'DELETE' }
      )
      return data
    },
  },

  /**
   * Portfolio operations
   */
  portfolios: {
    list: async () => {
      const data = await apiRequest<{ portfolios: any[] }>('/portfolios')
      return data.portfolios || []
    },

    create: async (portfolioData: any) => {
      const data = await apiRequest<{ id: string; message: string }>(
        '/portfolios',
        { method: 'POST', body: JSON.stringify(portfolioData) }
      )
      return data
    },

    get: async (id: string) => {
      const data = await apiRequest<{ portfolio: any; holdings: any[] }>(
        `/portfolios/${id}`
      )
      return data
    },

    update: async (id: string, updates: any) => {
      const data = await apiRequest<{ message: string }>(
        `/portfolios/${id}`,
        { method: 'PUT', body: JSON.stringify(updates) }
      )
      return data
    },

    delete: async (id: string) => {
      const data = await apiRequest<{ message: string }>(
        `/portfolios/${id}`,
        { method: 'DELETE' }
      )
      return data
    },
  },

  /**
   * Watchlist operations
   */
  watchlist: {
    list: async () => {
      const data = await apiRequest<{ watchlist: any[] }>('/watchlist')
      return data.watchlist || []
    },

    add: async (itemData: any) => {
      const data = await apiRequest<{ id: string; message: string }>(
        '/watchlist',
        { method: 'POST', body: JSON.stringify(itemData) }
      )
      return data
    },

    remove: async (id: string) => {
      const data = await apiRequest<{ message: string }>(
        `/watchlist/${id}`,
        { method: 'DELETE' }
      )
      return data
    },
  },

  /**
   * Virtual Portfolio operations (paper trading simulator)
   */
  virtualPortfolios: {
    list: async () => {
      const data = await apiRequest<{ portfolios: any[] }>('/virtual-portfolios')
      return data.portfolios || []
    },

    create: async (portfolioData: any) => {
      const data = await apiRequest<{ id: string; message: string }>(
        '/virtual-portfolios',
        { method: 'POST', body: JSON.stringify(portfolioData) }
      )
      return data
    },

    get: async (id: string) => {
      const data = await apiRequest<{ portfolio: any; holdings: any[] }>(
        `/virtual-portfolios/${id}`
      )
      return data
    },

    addHolding: async (portfolioId: string, holdingData: any) => {
      const data = await apiRequest<{ id: string; message: string }>(
        `/virtual-portfolios/${portfolioId}/holdings`,
        { method: 'POST', body: JSON.stringify(holdingData) }
      )
      return data
    },

    updateHolding: async (portfolioId: string, holdingId: string, updates: any) => {
      const data = await apiRequest<{ message: string }>(
        `/virtual-portfolios/${portfolioId}/holdings/${holdingId}`,
        { method: 'PUT', body: JSON.stringify(updates) }
      )
      return data
    },

    removeHolding: async (portfolioId: string, holdingId: string) => {
      const data = await apiRequest<{ message: string }>(
        `/virtual-portfolios/${portfolioId}/holdings/${holdingId}`,
        { method: 'DELETE' }
      )
      return data
    },

    getHistory: async (portfolioId: string) => {
      const data = await apiRequest<{ history: any[] }>(
        `/virtual-portfolios/${portfolioId}/history`
      )
      return data.history || []
    },
  },

  /**
   * Health check
   */
  health: {
    check: async () => {
      try {
        const response = await fetch(`${API_BASE}/health`)
        return response.json()
      } catch (error) {
        console.error('Health check failed:', error)
        return { status: 'unhealthy' }
      }
    },
  },
}

export default atlasClient
