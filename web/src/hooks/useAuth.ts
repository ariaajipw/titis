import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'

export default function useAuth(): {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
} {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const initSession = async (): Promise<void> => {
      const { data } = await supabase.auth.getSession()
      if (active) {
        setUser(data.session?.user ?? null)
        setLoading(false)
      }
    }

    void initSession()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
  }

  return { user, loading, signOut }
}
