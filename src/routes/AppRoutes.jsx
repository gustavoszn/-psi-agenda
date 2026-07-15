import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/layouts/AppLayout'

const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'))
const Agenda = lazy(() => import('@/pages/Agenda/Agenda'))
const Pacientes = lazy(() => import('@/pages/Pacientes/Pacientes'))
const Configuracoes = lazy(() => import('@/pages/Configuracoes/Configuracoes'))
const Login = lazy(() => import('@/pages/Login/Login'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

const Fallback = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
  </div>
)

export default function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
