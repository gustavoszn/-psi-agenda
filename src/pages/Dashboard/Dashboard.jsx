import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { isToday, isThisWeek, isFuture, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useData } from '@/contexts/DataContext'
import { CardSkeleton, ListSkeleton } from '@/components/UI/Skeleton'
import StatCard from '@/components/Cards/StatCard'
import Avatar from '@/components/UI/Avatar'
import StatusBadge from '@/components/UI/StatusBadge'
import { fmtTime, fmtDateLong, MODALITY_CONFIG } from '@/utils/helpers'

function TimelineItem({ appt, patient, index }) {
  const start = new Date(appt.date)
  const end   = new Date(start.getTime() + appt.duration * 60000)
  const now   = new Date()
  const isNow  = now >= start && now <= end
  const isPast = now > end

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex gap-3 p-3.5 rounded-2xl border border-token"
      style={{
        background: isNow ? 'var(--brand-light)' : 'var(--bg-surface)',
        opacity: isPast ? 0.55 : 1,
        borderColor: isNow ? 'var(--brand)' : 'var(--border)',
      }}
    >
      <div className="w-12 flex-shrink-0 text-right pt-0.5">
        <p className="text-sm font-semibold text-primary leading-tight">{fmtTime(start)}</p>
        <p className="text-xs text-muted leading-tight">{fmtTime(end)}</p>
      </div>
      <div className="w-px rounded-full flex-shrink-0 self-stretch"
        style={{ background: isNow ? 'var(--brand)' : 'var(--border)' }} />
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <Avatar name={patient?.name} photo={patient?.photo} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">{patient?.name ?? '—'}</p>
          <p className="text-xs text-muted">{appt.duration} min · {MODALITY_CONFIG[appt.modality]?.label ?? appt.modality}</p>
        </div>
        <StatusBadge status={appt.status} />
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { appointments, patients, loading } = useData()

  const stats = useMemo(() => ({
    todayAppts:     appointments.filter(a => isToday(new Date(a.date))),
    weekAppts:      appointments.filter(a => isThisWeek(new Date(a.date))),
    next:           appointments.filter(a => isFuture(new Date(a.date)) && !['cancelled','missed'].includes(a.status)).sort((a,b) => new Date(a.date)-new Date(b.date))[0],
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
      .slice(0, 6),
    [appointments])

  const getPatient = id => patients.find(p => p.id === id)

  if (loading) return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_,i) => <CardSkeleton key={i} />)}
      </div>
      <ListSkeleton />
    </div>
  )

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Saudação */}
      <div>
        <p className="text-xs text-muted capitalize">{fmtDateLong(new Date())}</p>
        <h2 className="text-lg font-bold text-primary mt-0.5">Olá, Dra. Isabela 🌿</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={Calendar}    label="Hoje"             value={stats.todayAppts.length}     color="brand"  index={0} />
        <StatCard icon={TrendingUp}  label="Esta semana"      value={stats.weekAppts.length}      color="brand"  index={1} />
        <StatCard icon={Clock}       label="Próxima"          value={stats.next ? fmtTime(stats.next.date) : '—'} color="brand" index={2} />
        <StatCard icon={Users}       label="Pacientes ativos" value={stats.activePatients.length} color="brand"  index={3} />
        <StatCard icon={CheckCircle} label="Confirmadas"      value={stats.confirmed.length}      color="brand"  index={4} />
        <StatCard icon={AlertCircle} label="Pendentes"        value={stats.pending.length}        color="accent" index={5} />
      </div>

      {/* Listas */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Hoje */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide">Agenda de hoje</h3>
            <span className="text-xs text-muted">{todayAppts.length} consulta{todayAppts.length !== 1 ? 's' : ''}</span>
          </div>
          {todayAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-token"
              style={{ background: 'var(--bg-surface)' }}>
              <Calendar size={26} className="mb-2" style={{ color: 'var(--border)' }} />
              <p className="text-sm text-muted">Nenhuma consulta hoje</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppts.map((a, i) => (
                <TimelineItem key={a.id} appt={a} patient={getPatient(a.patientId)} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Próximas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide">Próximas consultas</h3>
            <span className="text-xs text-muted">{upcomingAppts.length} agendada{upcomingAppts.length !== 1 ? 's' : ''}</span>
          </div>
          {upcomingAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-token"
              style={{ background: 'var(--bg-surface)' }}>
              <p className="text-sm text-muted">Nenhuma consulta futura</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingAppts.map((a, i) => {
                const p = getPatient(a.patientId)
                return (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-token"
                    style={{ background: 'var(--bg-surface)' }}
                  >
                    <Avatar name={p?.name} photo={p?.photo} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{p?.name ?? '—'}</p>
                      <p className="text-xs text-muted">
                        {format(new Date(a.date), "dd/MM 'às' HH:mm", { locale: ptBR })} · {MODALITY_CONFIG[a.modality]?.label ?? a.modality}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
