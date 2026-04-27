'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext({ user: null, profile: null, loading: true, signOut: () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (uid) => {
    if (!uid) { setProfile(null); return }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    if (error) { console.error('Profile load error:', error); setProfile(null); return }
    setProfile(data)
  }

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user || null)
      await loadProfile(session?.user?.id)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null)
      await loadProfile(session?.user?.id)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  const signOut = async () => { await supabase.auth.signOut() }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile: () => loadProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
