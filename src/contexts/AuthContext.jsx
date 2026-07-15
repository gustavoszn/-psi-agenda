import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/services/supabase'
import { login as apiLogin } from '@/services/api'

const AuthContext = createContext(null)

const toUser = (supabaseUser) => supabaseUser ? {
  id:                     supabaseUser.id,
  email:                  supabaseUser.email,
  name:                   supabaseUser.user_metadata?.name                   ?? 'Dra. Isabela Pedrozo Silva',
  crp:                    supabaseUser.user_metadata?.crp                    ?? '',
  photo:                  supabaseUser.user_metadata?.photo                  ?? null,
  phone:                  supabaseUser.user_metadata?.phone                  ?? '',
  bio:                    supabaseUser.user_metadata?.bio                    ?? '',
  birthDate:              supabaseUser.user_metadata?.birthDate              ?? '',
  homeAddress:            supabaseUser.user_metadata?.homeAddress            ?? '',
  workAddress:            supabaseUser.user_metadata?.workAddress            ?? '',
  specialty:              supabaseUser.user_metadata?.specialty              ?? '',
  education:              supabaseUser.user_metadata?.education              ?? '',
  sessionPrice:           supabaseUser.user_metadata?.sessionPrice           ?? '',
  defaultSessionDuration: supabaseUser.user_metadata?.defaultSessionDuration ?? '',
  instagram:              supabaseUser.user_metadata?.instagram              ?? '',
  site:                   supabaseUser.user_metadata?.site                   ?? '',
} : null

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(toUser(session?.user ?? null))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user ?? null))
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const u = await apiLogin(email, password)
    setUser(u)
    return u
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateProfile = async (metadata) => {
    const { data, error } = await supabase.auth.updateUser({ data: metadata })
    if (error) throw new Error(error.message)
    setUser(toUser(data.user))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
