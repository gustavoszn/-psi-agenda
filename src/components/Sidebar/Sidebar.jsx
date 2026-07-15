import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Calendar, Users, Settings, X, Leaf } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Avatar from '@/components/UI/Avatar'

const NAV = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agenda',        icon: Calendar,        label: 'Agenda' },
  { to: '/pacientes',     icon: Users,           label: 'Pacientes' },
  { to: '/configuracoes', icon: Settings,        label: 'Configurações' },
]

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink to={to} end={to === '/'} onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive ? 'bg-active' : 'text-secondary hover:bg-hover hover:text-primary'
        }`
      }
      style={({ isActive }) => isActive ? { color: 'var(--brand-text)' } : {}}
    >
      <Icon size={17} />
      {label}
    </NavLink>
  )
}

function SidebarContent({ onClose, mobile }) {
  const { user } = useAuth()
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--brand)' }}>
            <Leaf size={15} className="text-white" />
          </div>
          <div>
            <span className="font-semibold text-sm leading-none block text-primary">Isabela</span>
            <span className="text-xs leading-none" style={{ color: 'var(--brand)' }}>Psicologia</span>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--bg-hover)' }}>
            <X size={16} className="text-secondary" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(item => (
          <NavItem key={item.to} {...item} onClick={mobile ? onClose : undefined} />
        ))}
      </nav>

      {user && (
        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'var(--bg-hover)' }}>
            <Avatar name={user.name} photo={user.photo} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary truncate">{user.name}</p>
              {user.crp && <p className="text-xs text-muted truncate">{user.crp}</p>}
            </div>
          </div>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30" onClick={onClose} />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-60 h-full shadow-xl border-r border-token"
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
    <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 border-r border-token flex-shrink-0"
      style={{ background: 'var(--bg-surface)' }}>
      <SidebarContent />
    </aside>
  )
}
