import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import App from './App'

supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session)
})

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session)
})

const root = document.getElementById('root')
if (!root) throw new Error('Missing <div id="root"> in index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
