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
    set({ user: res.data.user })
    return res.data
  },

  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    set({ user: res.data.user })
    return res.data
  },

  logout: async () => {
    await api.post('/auth/logout')
    set({ user: null })
  },

  updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),
}))
