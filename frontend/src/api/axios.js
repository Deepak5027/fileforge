import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  withCredentials: true,
  timeout: 60000,
})

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        return api.request(err.config)
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
