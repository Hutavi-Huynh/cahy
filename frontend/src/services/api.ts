import axios from 'axios'
import type { ApiResponse } from '@/types'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export async function apiGet<T>(url: string, params?: Record<string, unknown>) {
  const res = await api.get<ApiResponse<T>>(url, { params })
  return res.data.data
}

export async function apiPost<T>(url: string, data?: unknown) {
  const res = await api.post<ApiResponse<T>>(url, data)
  return res.data.data
}

export async function apiPatch<T>(url: string, data?: unknown) {
  const res = await api.patch<ApiResponse<T>>(url, data)
  return res.data.data
}

export async function apiDelete<T>(url: string) {
  const res = await api.delete<ApiResponse<T>>(url)
  return res.data.data
}

export default api
