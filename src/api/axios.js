import axios from 'axios'

// ── BASE INSTANCE ──────────────────────────────────────────
// All API calls go through this instance.
// baseURL reads from .env file — falls back to localhost for dev.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── REQUEST INTERCEPTOR ────────────────────────────────────
// Automatically attaches JWT token to every protected request.
// Token is read from Zustand store (in memory — NOT localStorage).
api.interceptors.request.use(
  (config) => {
    // dynamically import to avoid circular dep
    const token = sessionStorage.getItem('skai_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── RESPONSE INTERCEPTOR ───────────────────────────────────
// If backend returns 401 (token expired/invalid) → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('skai_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api