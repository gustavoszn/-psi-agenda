import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Clock, CheckCircle, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { isToday, isThisWeek, isFuture, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useData } from '@/contexts/DataContext'
import { useAuth } from '@/contexts/AuthContext'
import { CardSkeleton, ListSkeleton } from '@/components/UI/Skeleton'
import StatCard from '@/components/Cards/StatCard'
import Avatar from '@/components/UI/Avatar'
import StatusBadge from '@/components/UI/StatusBadge'
import { fmtTime, fmtDateLong, MODALITY_CONFIG } from '@/utils/helpers'

function TimelineItem({ appt, patient, index, onPatientClick }) {
  const start = new Date(appt.date)
  const end   = new Date(start.getTime() + appt.duration * 60000)
  const now   = new Date()
  const isNow  = now >= start && now <= end
  const isPast = now > end

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer"
      onClick={() => patient && onPatientClick(patient.id)}
      style={{
        background: isNow ? 'var(--brand-light)' : 'var(--bg-surface)',
        borderColor: isNow ? 'var(--brand)' : 'var(--border)',
        opacity: isPast ? 0.5 : 1,
        boxShadow: isNow ? '0 0 0 1px var(--brand)' : 'none',
      }}
    >
      <div className="w-11 flex-shrink-0 text-right">
        <p className="text-sm font-bold text-primary leading-tight">{fmtTime(start)}</p>
        <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{fmtTime(end)}</p>
      </div>
      <div className="w-px rounded-full self-stretch flex-shrink-0"
        style={{ background: isNow ? 'var(--brand)' : 'var(--border)' }} />
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <Avatar name={patient?.name} photo={patient?.photo} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary truncate">{patient?.name ?? '—'}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {appt.duration} min · {MODALITY_CONFIG[appt.modality]?.label ?? appt.modality}
          </p>
        </div>
        <StatusBadge status={appt.status} />
      </div>
    </motion.div>
  )
}

function SectionHeader({ title, count, label, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-sm font-bold text-primary">{title}</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {count} {label}{count !== 1 ? 's' : ''}
        </p>
      </div>
      {onAction && (
        <button onClick={onAction}
          className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--brand-text)' }}>
          Ver agenda <ArrowRight size={12} />
        </button>
      )}
    </div>
  )
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-token"
      style={{ background: 'var(--bg-surface)' }}>
      <Icon size={28} className="mb-2" style={{ color: 'var(--border)' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  )
}

export default function Dashboard() {
  const { appointments, patients, loading } = useData()
  const { user } = useAuth()
  const navigate = useNavigate()

  const stats = useMemo(() => ({
    todayAppts:     appointments.filter(a => isToday(new Date(a.date))),
    weekAppts:      appointments.filter(a => isThisWeek(new Date(a.date))),
    next:           appointments.filter(a => isFuture(new Date(a.date)) && !['cancelled','missed'].includes(a.status))
                      .sort((a,b) => new Date(a.date)-new Date(b.date))[0],
    activePatients: patients.filter(p => p.status === 'active'),
    confirmed:      appointments.filter(a => a.status === 'confirmed'),
    pending:        appointments.filter(a => a.status === 'scheduled'),
  }), [appointments, patients])

  const todayAppts = useMemo(() =>
    appointments.filter(a => isToday(new Date(a.date))).sort((a,b) => new Date(a.date)-new Date(b.date)),
    [appointments])

  const upcomingAppts = useMemo(() =>
    appointments
      .filter(a => isFuture(new Date(a.date)) && !['cancelled','missed'].includes(a.status))
      .sort((a,b) => new Date(a.date)-new Date(b.date))
      .slice(0, 5),
    [appointments])

  const getPatient = id => patients.find(p => p.id === id)
  const firstName = user?.name?.split(' ').find(w => !w.includes('.') && w.length > 1) || user?.name || 'Isabela'

  if (loading) return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_,i) => <CardSkeleton key={i} />)}
      </div>
      <ListSkeleton />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-medium capitalize" style={{ color: 'var(--text-muted)' }}>
          {fmtDateLong(new Date())}
        </p>
        <h2 className="text-xl font-bold text-primary mt-0.5">
          Olá, Dra. {firstName} 🌿
        </h2>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={Calendar}    label="Hoje"             value={stats.todayAppts.length}     color="brand"  index={0} />
        <StatCard icon={TrendingUp}  label="Esta semana"      value={stats.weekAppts.length}      color="brand"  index={1} />
        <StatCard icon={Clock}       label="Próxima"          value={stats.next ? fmtTime(stats.next.date) : '—'} color="brand" index={2} />
        <StatCard icon={Users}       label="Pacientes ativos" value={stats.activePatients.length} color="brand"  index={3} />
        <StatCard icon={CheckCircle} label="Confirmadas"      value={stats.confirmed.length}      color="brand"  index={4} />
        <StatCard icon={AlertCircle} label="Pendentes"        value={stats.pending.length}        color="accent" index={5} />
      </div>

      {/* Lists */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Today */}
        <div>
          <SectionHeader title="Agenda de hoje" count={todayAppts.length} label="consulta"
            onAction={() => navigate('/agenda')} />
          {todayAppts.length === 0
            ? <EmptyState icon={Calendar} message="Nenhuma consulta hoje" />
            : <div className="space-y-2">
                {todayAppts.map((a, i) => (
                  <TimelineItem key={a.id} appt={a} patient={getPatient(a.patientId)} index={i} onPatientClick={id => navigate(`/pacientes/${id}`)} />
                ))}
              </div>
          }
        </div>

        {/* Upcoming */}
        <div>
          <SectionHeader title="Próximas consultas" count={upcomingAppts.length} label="agendada"
            onAction={() => navigate('/agenda')} />
          {upcomingAppts.length === 0
            ? <EmptyState icon={Calendar} message="Nenhuma consulta futura" />
            : <div className="space-y-2">
                {upcomingAppts.map((a, i) => {
                  const p = getPatient(a.patientId)
                  return (
                    <motion.div key={a.id}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => p && navigate(`/pacientes/${p.id}`)}
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-token cursor-pointer"
                      style={{ background: 'var(--bg-surface)' }}
                    >
                      <Avatar name={p?.name} photo={p?.photo} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">{p?.name ?? '—'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {format(new Date(a.date), "dd/MM 'às' HH:mm", { locale: ptBR })} · {MODALITY_CONFIG[a.modality]?.label}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </motion.div>
                  )
                })}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
