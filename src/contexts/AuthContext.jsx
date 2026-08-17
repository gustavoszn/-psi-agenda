import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { setUser(api.getStoredSession()); setLoading(false) }, [])
  const value = useMemo(() => ({
    user, loading,
    login: async (email, password, remember) => { const result = await api.login(email, password, remember); setUser(result); return result },
    loginPatient: async (email, password, remember) => { const result = await api.loginPatient(email, password, remember); setUser(result); return result },
    logout: async () => { await api.logout(); setUser(null) },
    updateProfile: async data => { const result = await api.updateUser(data); setUser(result); return result },
  }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
