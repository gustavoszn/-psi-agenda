import { useState, useRef, useEffect } from 'react'
import { Menu, Sun, Moon, Bell, LogOut, Clock, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'

const URGENCY = {
  high:   { bg: 'var(--accent-light)',  border: 'var(--accent)',  dot: 'var(--accent)',  text: 'var(--accent-text)'  },
  medium: { bg: '#fef9ec',              border: '#e6b84a',        dot: '#e6b84a',        text: '#9a6f00'             },
  low:    { bg: 'var(--brand-light)',   border: 'var(--brand)',   dot: 'var(--brand)',   text: 'var(--brand-text)'   },
}

function NotifItem({ notif, patient, onDismiss }) {
  const u = URGENCY[notif.urgency] || URGENCY.low
  const time = format(new Date(notif.date), "HH:mm", { locale: ptBR })
  const dateStr = format(new Date(notif.date), "dd/MM", { locale: ptBR })

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-start gap-3 px-4 py-3 border-b border-token last:border-0"
      style={{ background: u.bg }}
    >
      <div className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: u.dot }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: u.text }}>
          {patient?.name ?? 'Paciente'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-1 text-xs" style={{ color: u.text, opacity: 0.8 }}>
            <Clock size={10} /> {notif.label}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: u.text, opacity: 0.8 }}>
            <Calendar size={10} /> {dateStr} às {time}
          </span>
        </div>
      </div>
      <button onClick={() => onDismiss(notif.id)}
        className="text-xs flex-shrink-0 transition-opacity hover:opacity-60"
        style={{ color: u.text }}>
        ✕
      </button>
    </motion.div>
  )
}

export default function Header({ onMenuClick, title }) {
  const { dark, toggle } = useTheme()
  const { logout } = useAuth()
  const { notifications, dismissNotification, patients } = useData()
  const [showNotif, setShowNotif] = useState(false)
  const panelRef = useRef()

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const highCount = notifications.filter(n => n.urgency === 'high').length
  const badgeCount = notifications.length

  return (
    <header className="sticky top-0 z-30 border-b border-token px-4 lg:px-6 h-14 flex items-center gap-4"
      style={{ background: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)', backdropFilter: 'blur(12px)' }}>

      <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg bg-hover">
        <Menu size={19} className="text-secondary" />
      </button>

      <h1 className="text-sm font-semibold text-primary flex-1">{title}</h1>

      <div className="flex items-center gap-1">
        <button onClick={toggle} className="p-2 rounded-xl transition-colors bg-hover hover:bg-active"
          title={dark ? 'Modo claro' : 'Modo escuro'}>
          {dark ? <Sun size={16} className="text-secondary" /> : <Moon size={16} className="text-secondary" />}
        </button>

        {/* Notificações */}
        <div className="relative" ref={panelRef}>
          <button onClick={() => setShowNotif(v => !v)}
            className="p-2 rounded-xl bg-hover hover:bg-active transition-colors relative">
            <Bell size={16} className="text-secondary" />
            {badgeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center text-white"
                style={{ background: highCount > 0 ? 'var(--accent)' : 'var(--brand)', fontSize: '9px', fontWeight: 700 }}>
                {badgeCount > 9 ? '9+' : badgeCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-xl border border-token overflow-hidden"
                style={{ background: 'var(--bg-surface)' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-token">
                  <p className="text-sm font-semibold text-primary">Lembretes</p>
                  {badgeCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                      {badgeCount}
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <Bell size={22} style={{ color: 'var(--border)' }} />
                      <p className="text-sm text-muted">Nenhum lembrete</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {[...notifications]
                        .sort((a, b) => {
                          const order = { high: 0, medium: 1, low: 2 }
                          return order[a.urgency] - order[b.urgency]
                        })
                        .map(n => (
                          <NotifItem
                            key={n.id}
                            notif={n}
                            patient={patients.find(p => p.id === n.patientId)}
                            onDismiss={dismissNotification}
                          />
                        ))}
                    </AnimatePresence>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-token">
                    <button
                      onClick={() => notifications.forEach(n => dismissNotification(n.id))}
                      className="text-xs text-muted hover:text-secondary transition-colors w-full text-center">
                      Dispensar todos
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={logout} className="p-2 rounded-xl bg-hover hover:bg-active transition-colors">
          <LogOut size={16} className="text-secondary" />
        </button>
      </div>
    </header>
  )
}
