import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  withCredentials: true,
  timeout: 60000,
})

let isRefreshing = false

api.interceptors.response.use(
  res => res,
  async err => {
    // FIX 1: Avoid infinite refresh loop — only attempt once
    if (err.response?.status === 401 && !isRefreshing) {
      isRefreshing = true
      try {
        // FIX 2: Use the configured `api` instance (not raw axios)
        // so it uses the correct baseURL in production
        await api.post('/auth/refresh')
        isRefreshing = false
        return api.request(err.config)
      } catch {
        isRefreshing = false
        // FIX 3: Only redirect if not already on login/register page
        if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api
