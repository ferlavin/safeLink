import axios from 'axios'
import { getClientApiBaseUrl } from '../config/env.js'

const client = axios.create({
  baseURL: getClientApiBaseUrl(),
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('safelink_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('safelink_token')
      localStorage.removeItem('safelink_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default client
