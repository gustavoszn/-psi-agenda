import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/Sidebar/Sidebar'
import Header from '@/components/Header/Header'

const TITLES = {
  '/':              'Dashboard',
  '/agenda':        'Agenda',
  '/pacientes':     'Pacientes',
  '/configuracoes': 'Configurações',
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'PsiAgenda'

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <Sidebar />
      <Sidebar mobile open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
