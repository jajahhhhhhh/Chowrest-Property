import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Home from '@/pages/Home'
import Auth from '@/pages/Auth'
import Listings from '@/pages/Listings'
import PropertyDetail from '@/pages/PropertyDetail'
import Dashboard from '@/pages/Dashboard'

function AgentRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, initialized } = useAuthStore()
  if (!initialized) return null
  if (!user || profile?.role !== 'agent') return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/auth"         element={<Auth />} />
        <Route path="/listings"     element={<Listings />} />
        <Route path="/listings/:id" element={<PropertyDetail />} />
        <Route path="/dashboard"    element={<AgentRoute><Dashboard /></AgentRoute>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
