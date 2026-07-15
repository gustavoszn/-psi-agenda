import { useState } from 'react'
import { Menu, Sun, Moon, Bell, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'

export default function Header({ onMenuClick, title }) {
  const { dark, toggle } = useTheme()
  const { logout } = useAuth()
  const { notifications, dismissNotification } = useData()
  const [showNotif, setShowNotif] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-token px-4 lg:px-6 h-14 flex items-center gap-4"
      style={{ background: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)', backdropFilter: 'blur(12px)' }}>

      <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg bg-hover">
        <Menu size={19} className="text-secondary" />
      </button>

      <h1 className="text-sm font-semibold text-primary flex-1">{title}</h1>

      <div className="flex items-center gap-1">
        {/* Toggle tema */}
        <button onClick={toggle} className="p-2 rounded-xl transition-colors bg-hover hover:bg-active"
          title={dark ? 'Modo claro' : 'Modo escuro'}>
          {dark
            ? <Sun size={16} className="text-secondary" />
            : <Moon size={16} className="text-secondary" />}
        </button>

        {/* Notificações */}
        <div className="relative">
          <button onClick={() => setShowNotif(v => !v)}
            className="p-2 rounded-xl bg-hover hover:bg-active transition-colors relative">
            <Bell size={16} className="text-secondary" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-lg border border-token overflow-hidden bg-surface"
              >
                <div className="px-4 py-3 border-b border-token">
                  <p className="text-sm font-semibold text-primary">Notificações</p>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted text-center py-6">Nenhuma notificação</p>
                ) : (
                  <div>
                    {notifications.map(n => (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-token last:border-0">
                        <div className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--brand)' }} />
                        <p className="text-sm text-secondary flex-1">{n.message}</p>
                        <button onClick={() => dismissNotification(n.id)} className="text-muted hover:text-secondary text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button onClick={logout} className="p-2 rounded-xl bg-hover hover:bg-active transition-colors">
          <LogOut size={16} className="text-secondary" />
        </button>
      </div>
    </header>
  )
}
