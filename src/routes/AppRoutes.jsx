import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/layouts/AppLayout'
import ClienteLayout from '@/layouts/ClienteLayout'

const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'))
const Agenda = lazy(() => import('@/pages/Agenda/Agenda'))
const Pacientes = lazy(() => import('@/pages/Pacientes/Pacientes'))
const PacienteDetalhe = lazy(() => import('@/pages/Pacientes/PacienteDetalhe'))
const Configuracoes = lazy(() => import('@/pages/Configuracoes/Configuracoes'))
const Login = lazy(() => import('@/pages/Login/Login'))
const ClienteLogin = lazy(() => import('@/pages/Cliente/ClienteLogin'))
const ClienteHome = lazy(() => import('@/pages/Cliente/ClienteHome'))
const ClienteConsultas = lazy(() => import('@/pages/Cliente/ClienteConsultas'))
const ClientePerfil = lazy(() => import('@/pages/Cliente/ClientePerfil'))

function ProtectedRoute({ children, role = 'professional' }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" /></div>
  if (!user) return <Navigate to={role === 'patient' ? '/cliente/login' : '/login'} replace />
  if (user.role !== role) return <Navigate to={user.role === 'patient' ? '/cliente' : '/'} replace />
  return children
}

const Fallback = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
  </div>
)

const NotFound = () => (
  <main className="min-h-screen flex items-center justify-center p-6 bg-base">
    <div className="max-w-md text-center"><p className="text-sm font-semibold" style={{ color: 'var(--brand-text)' }}>Erro 404</p><h1 className="text-3xl font-bold text-primary mt-2">Página não encontrada</h1><p className="text-sm text-muted mt-3 mb-6">O endereço pode ter mudado ou não existe.</p><Link to="/" className="inline-flex px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'var(--brand)' }}>Voltar ao Dashboard</Link></div>
  </main>
)

export default function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cliente/login" element={<ClienteLogin />} />
        <Route path="/" element={<ProtectedRoute role="professional"><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="pacientes/:id" element={<PacienteDetalhe />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
        <Route path="/cliente" element={<ProtectedRoute role="patient"><ClienteLayout /></ProtectedRoute>}>
          <Route index element={<ClienteHome />} />
          <Route path="consultas" element={<ClienteConsultas />} />
          <Route path="perfil" element={<ClientePerfil />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
