import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api2.diarioinfo.com'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Add auth token if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api