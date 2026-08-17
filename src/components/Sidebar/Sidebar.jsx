import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Calendar, Users, Settings, X, Leaf, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Avatar from '@/components/UI/Avatar'

const NAV = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/agenda',        icon: Calendar,        label: 'Agenda'       },
  { to: '/pacientes',     icon: Users,           label: 'Pacientes'    },
  { to: '/configuracoes', icon: Settings,        label: 'Configurações'},
]

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink to={to} end={to === '/'} onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-active font-semibold'
            : 'hover:bg-hover'
        }`
      }
      style={({ isActive }) => ({
        color: isActive ? 'var(--brand-text)' : 'var(--text-secondary)',
      })}
    >
      {({ isActive }) => (
        <>
          <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

function SidebarContent({ onClose, mobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-token">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ background: 'var(--brand)' }}>
            <Leaf size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-primary leading-tight">PsiAgenda</p>
            <p className="text-xs leading-tight" style={{ color: 'var(--brand)' }}>Psicologia</p>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose}
            className="p-1.5 rounded-xl transition-colors hover:bg-hover"
            style={{ color: 'var(--text-muted)' }}>
            <X size={17} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <NavItem key={item.to} {...item} onClick={mobile ? onClose : undefined} />
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="px-3 pb-4 border-t border-token pt-3 space-y-2">
          <button
            onClick={() => { navigate('/configuracoes'); onClose?.() }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-hover text-left"
          >
            <Avatar name={user.name} photo={user.photo} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary truncate">{user.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {user.crp || user.email}
              </p>
            </div>
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-hover"
            style={{ color: 'var(--text-muted)' }}>
            <LogOut size={14} />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ mobile, open, onClose }) {
  if (mobile) {
    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-72 h-full shadow-xl border-r border-token"
              style={{ background: 'var(--bg-surface)' }}
            >
              <SidebarContent mobile onClose={onClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-token flex-shrink-0"
      style={{ background: 'var(--bg-surface)' }}>
      <SidebarContent />
    </aside>
  )
}
