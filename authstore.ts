import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<string | null>
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
  setSession: (session: Session | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  initialized: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null, initialized: true })
    if (session?.user) {
      get().fetchProfile(session.user.id)
    }
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) set({ profile: data as Profile })
    } catch {
      // Supabase not connected — use demo profile
      set({
        profile: {
          id: userId,
          full_name: 'Demo Agent',
          avatar_url: null,
          phone: null,
          role: 'agent',
          created_at: new Date().toISOString(),
        }
      })
    }
  },

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return error.message
      set({ user: data.user, session: data.session })
      if (data.user) await get().fetchProfile(data.user.id)
      return null
    } catch {
      return 'Connection error — check your Supabase configuration.'
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email, password, fullName, role = 'buyer') => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      })
      if (error) return error.message
      set({ user: data.user, session: data.session })
      return null
    } catch {
      return 'Connection error — check your Supabase configuration.'
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null })
  },
}))
