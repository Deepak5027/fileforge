import { create } from 'zustand'
import api from '../api/axios'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  token: null,

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data.user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    // FIX: Guard against missing user in response
    if (!res.data?.user) throw new Error('Invalid response from server')
    set({ user: res.data.user })
    return res.data
  },

  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    // FIX: Guard against missing user in response
    if (!res.data?.user) throw new Error('Invalid response from server')
    set({ user: res.data.user })
    return res.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // FIX: Clear user even if logout API call fails
    } finally {
      set({ user: null })
    }
  },

  updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),
}))
