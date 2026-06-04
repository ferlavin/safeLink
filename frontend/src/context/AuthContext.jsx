import { createContext, useContext, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('safelink_user')
    return raw ? JSON.parse(raw) : null
  })

  const persist = (token, userData) => {
    localStorage.setItem('safelink_token', token)
    localStorage.setItem('safelink_user', JSON.stringify(userData))
    setUser(userData)
  }

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password })
    persist(data.access_token, data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await client.post('/auth/register', payload)
    persist(data.access_token, data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('safelink_token')
    localStorage.removeItem('safelink_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
