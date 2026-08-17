import { CalendarDays, HeartHandshake, Home, LogOut, UserRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Avatar from '@/components/UI/Avatar'

const links = [{ to: '/cliente', label: 'Início', icon: Home, end: true }, { to: '/cliente/consultas', label: 'Consultas', icon: CalendarDays }, { to: '/cliente/perfil', label: 'Meu perfil', icon: UserRound }]

export default function ClienteLayout() {
  const { user, logout } = useAuth(); const navigate = useNavigate()
  const exit = async () => { await logout(); navigate('/cliente/login') }
  return (
    <div className="min-h-screen bg-base pb-20 md:pb-0">
      <header className="sticky top-0 z-30 h-16 border-b border-token bg-surface/95 backdrop-blur flex items-center px-4 sm:px-6">
        <div className="w-full max-w-6xl mx-auto flex items-center gap-3"><span className="h-9 w-9 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--brand)' }}><HeartHandshake size={18} /></span><strong className="text-primary">PsiAgenda</strong><nav className="hidden md:flex items-center gap-1 ml-8">{links.map(({ icon: Icon, ...link }) => <NavLink key={link.to} {...link} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isActive ? 'bg-active font-semibold' : 'text-secondary hover:bg-hover'}`}><Icon size={16} />{link.label}</NavLink>)}</nav><div className="ml-auto flex items-center gap-3"><div className="hidden sm:block text-right"><p className="text-xs font-semibold text-primary">{user?.name}</p><p className="text-xs text-muted">Paciente</p></div><Avatar name={user?.name} photo={user?.photo} size="sm" /><button onClick={exit} aria-label="Sair" className="p-2 rounded-xl text-muted hover:bg-hover"><LogOut size={17} /></button></div></div>
      </header>
      <Outlet />
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-token grid grid-cols-3 px-2 pb-[env(safe-area-inset-bottom)]">{links.map(({ icon: Icon, ...link }) => <NavLink key={link.to} {...link} className={({ isActive }) => `min-h-16 flex flex-col items-center justify-center gap-1 text-xs ${isActive ? 'font-semibold' : 'text-muted'}`} style={({ isActive }) => ({ color: isActive ? 'var(--brand-text)' : undefined })}><Icon size={19} />{link.label}</NavLink>)}</nav>
    </div>
  )
}
