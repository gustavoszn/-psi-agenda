import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Video } from 'lucide-react'
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isSameDay, isToday, getHours, getMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useData } from '@/contexts/DataContext'
import { getWeekDays, getMonthDays, fmtTime, STATUS_CONFIG, MODALITY_CONFIG } from '@/utils/helpers'
import Modal from '@/components/Modal/Modal'
import AppointmentForm from '@/components/Modal/AppointmentForm'
import StatusBadge from '@/components/UI/StatusBadge'
import Avatar from '@/components/UI/Avatar'
import Button from '@/components/UI/Button'
import { useModal } from '@/hooks/useModal'

const HOUR_HEIGHT = 64
const START_HOUR  = 7
const END_HOUR    = 19
// slots clicáveis: 07, 08 ... 18  (12 slots × 64px = 768px)
// label 19:00 aparece como fechamento no fim
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR)
const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT  // 768px

function ApptBlock({ appt, patient, onClick }) {
  const start  = new Date(appt.date)
  const top    = ((getHours(start) - START_HOUR) + getMinutes(start) / 60) * HOUR_HEIGHT
  const height = Math.max((appt.duration / 60) * HOUR_HEIGHT, 26)

  const bg =
    appt.status === 'confirmed' ? { background: '#d1ead8', borderLeft: '3px solid #5a8a6a' } :
    appt.status === 'cancelled' ? { background: '#f5e0e0', borderLeft: '3px solid #c97b7b', opacity: 0.7 } :
    appt.status === 'done'      ? { background: '#ece8e3', borderLeft: '3px solid #b0a49a', opacity: 0.65 } :
    appt.status === 'missed'    ? { background: '#fde8d8', borderLeft: '3px solid #d4845a', opacity: 0.75 } :
                                  { background: '#ddeaf0', borderLeft: '3px solid #6a9ab0' }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => onClick(appt)}
      style={{ top, height, left: 3, right: 3, position: 'absolute', ...bg }}
      className="rounded-xl px-2 py-1 cursor-pointer overflow-hidden hover:shadow-md transition-shadow"
    >
      <p className="text-xs font-semibold text-primary truncate">{patient?.name}</p>
      {height > 36 && <p className="text-xs text-secondary">{fmtTime(start)} · {appt.modality === 'online' ? '🎥' : '🌿'}</p>}
    </motion.div>
  )
}

// Coluna lateral com os labels de hora (07:00 … 19:00)
function HourLabels() {
  return (
    <div className="w-14 flex-shrink-0 border-r border-token">
      {HOURS.map(h => (
        <div key={h} style={{ height: HOUR_HEIGHT }} className="flex items-start justify-end pr-2 pt-1">
          <span className="text-xs text-muted">{String(h).padStart(2,'0')}:00</span>
        </div>
      ))}
      {/* label de fechamento 19:00 */}
      <div style={{ height: 20 }} className="flex items-start justify-end pr-2 pt-1">
        <span className="text-xs text-muted">19:00</span>
      </div>
    </div>
  )
}

// Grade de slots clicáveis
function HourGrid({ date, onSlotClick }) {
  return (
    <div style={{ height: GRID_HEIGHT }}>
      {HOURS.map(h => (
        <div key={h} style={{ height: HOUR_HEIGHT }}
          className="border-b border-token cursor-pointer transition-colors"
          onClick={() => { const d = new Date(date); d.setHours(h, 0, 0, 0); onSlotClick(d) }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-light)'}
          onMouseLeave={e => e.currentTarget.style.background = ''}
        />
      ))}
    </div>
  )
}

function DayView({ date, appointments, patients, onSlotClick, onApptClick }) {
  const dayAppts = appointments.filter(a => isSameDay(new Date(a.date), date))
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-1 overflow-y-auto">
        <HourLabels />
        <div className="flex-1 relative" style={{ height: GRID_HEIGHT }}>
          <HourGrid date={date} onSlotClick={onSlotClick} />
          {dayAppts.map(a => (
            <ApptBlock key={a.id} appt={a}
              patient={patients.find(p => p.id === a.patientId)}
              onClick={onApptClick} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WeekView({ date, appointments, patients, onSlotClick, onApptClick }) {
  const days = getWeekDays(date)
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header fixo com nomes dos dias */}
      <div className="flex border-b border-token flex-shrink-0">
        <div className="w-14 flex-shrink-0" />
        {days.map(day => (
          <div key={day.toISOString()} className="flex-1 text-center py-2 border-l border-token"
            style={{ background: isToday(day) ? 'var(--brand-light)' : 'var(--bg-surface)' }}>
            <p className="text-xs text-muted capitalize">{format(day, 'EEE', { locale: ptBR })}</p>
            <p className="text-sm font-semibold"
              style={{ color: isToday(day) ? 'var(--brand-text)' : 'var(--text-primary)' }}>
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>
      {/* Área scrollável */}
      <div className="flex flex-1 overflow-y-auto overflow-x-auto min-h-0">
        <div className="flex min-w-[600px] w-full">
          <HourLabels />
          {days.map(day => (
            <div key={day.toISOString()}
              className="flex-1 border-l border-token relative"
              style={{ height: GRID_HEIGHT }}>
              <HourGrid date={day} onSlotClick={onSlotClick} />
              {appointments.filter(a => isSameDay(new Date(a.date), day)).map(a => (
                <ApptBlock key={a.id} appt={a}
                  patient={patients.find(p => p.id === a.patientId)}
                  onClick={onApptClick} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MonthView({ date, appointments, patients, onDayClick }) {
  const days  = getMonthDays(date)
  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid grid-cols-7 mb-2">
        {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted py-2">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
          {week.map(day => {
            const dayAppts = appointments.filter(a => isSameDay(new Date(a.date), day))
            const isCurrentMonth = day.getMonth() === date.getMonth()
            return (
              <motion.div key={day.toISOString()} whileHover={{ scale: 1.02 }}
                onClick={() => onDayClick(day)}
                className="min-h-[80px] p-1.5 rounded-2xl cursor-pointer border border-token transition-all"
                style={{
                  background: isToday(day) ? 'var(--brand-light)' : isCurrentMonth ? 'var(--bg-surface)' : 'transparent',
                  opacity: isCurrentMonth ? 1 : 0.35,
                  borderColor: isToday(day) ? 'var(--brand)' : 'var(--border)',
                }}
              >
                <p className="text-xs font-semibold mb-1"
                  style={{ color: isToday(day) ? 'var(--brand-text)' : 'var(--text-secondary)' }}>
                  {format(day, 'd')}
                </p>
                <div className="space-y-0.5">
                  {dayAppts.slice(0, 3).map(a => {
                    const cfg = STATUS_CONFIG[a.status]
                    return (
                      <div key={a.id} className={`text-xs px-1.5 py-0.5 rounded-lg truncate ${cfg.color}`}>
                        {fmtTime(a.date)} {patients.find(p => p.id === a.patientId)?.name?.split(' ')[0]}
                      </div>
                    )
                  })}
                  {dayAppts.length > 3 && <p className="text-xs text-muted pl-1">+{dayAppts.length - 3}</p>}
                </div>
              </motion.div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function Agenda() {
  const { appointments, patients, addAppointment, editAppointment, removeAppointment } = useData()
  const [view, setView]             = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const apptModal   = useModal()
  const detailModal = useModal()
  const editModal   = useModal()
  const [selectedDate, setSelectedDate] = useState(null)

  const nav = dir => {
    if (view === 'day')       setCurrentDate(d => dir > 0 ? addDays(d,1)   : subDays(d,1))
    else if (view === 'week') setCurrentDate(d => dir > 0 ? addWeeks(d,1)  : subWeeks(d,1))
    else                      setCurrentDate(d => dir > 0 ? addMonths(d,1) : subMonths(d,1))
  }

  const title = useMemo(() => {
    if (view === 'day')  return format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
    if (view === 'week') { const d = getWeekDays(currentDate); return `${format(d[0],'dd MMM',{locale:ptBR})} – ${format(d[6],'dd MMM yyyy',{locale:ptBR})}` }
    return format(currentDate, 'MMMM yyyy', { locale: ptBR })
  }, [view, currentDate])

  const handleCreate = async data => { await addAppointment(data); apptModal.hide() }
  const handleEdit   = async data => { await editAppointment(editModal.data.id, data); editModal.hide() }
  const handleDelete = async ()   => { await removeAppointment(detailModal.data.id); detailModal.hide() }

  const selAppt    = detailModal.data
  const selPatient = selAppt ? patients.find(p => p.id === selAppt.patientId) : null

  const viewProps = {
    appointments, patients,
    onSlotClick: d => { setSelectedDate(d); apptModal.show() },
    onApptClick: detailModal.show,
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-token bg-surface flex-shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => nav(-1)} className="p-1.5 rounded-lg bg-hover hover:bg-active transition-colors">
            <ChevronLeft size={17} className="text-secondary" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-hover hover:bg-active text-secondary transition-colors">
            Hoje
          </button>
          <button onClick={() => nav(1)} className="p-1.5 rounded-lg bg-hover hover:bg-active transition-colors">
            <ChevronRight size={17} className="text-secondary" />
          </button>
        </div>

        <h2 className="text-sm font-semibold text-primary flex-1 capitalize">{title}</h2>

        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'var(--bg-hover)' }}>
          {[['day','Dia'],['week','Semana'],['month','Mês']].map(([v,l]) => (
            <button key={v} onClick={() => setView(v)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              style={{ background: view === v ? 'var(--bg-surface)' : 'transparent', color: view === v ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>
              {l}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={() => { setSelectedDate(null); apptModal.show() }}>
          <Plus size={14} /> Nova consulta
        </Button>
      </div>

      {/* Calendar body */}
      <div className="flex flex-1 min-h-0 overflow-hidden bg-surface">
        {view === 'day'   && <DayView   date={currentDate} {...viewProps} />}
        {view === 'week'  && <WeekView  date={currentDate} {...viewProps} />}
        {view === 'month' && <MonthView date={currentDate} appointments={appointments} patients={patients} onDayClick={d => { setCurrentDate(d); setView('day') }} />}
      </div>

      <Modal open={apptModal.open} onClose={apptModal.hide} title="Nova consulta" size="md">
        <AppointmentForm initial={selectedDate ? { date: selectedDate.toISOString() } : null} onSubmit={handleCreate} onCancel={apptModal.hide} />
      </Modal>

      <Modal open={detailModal.open} onClose={detailModal.hide} title="Detalhes da consulta" size="md">
        {selAppt && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selPatient?.name} photo={selPatient?.photo} size="md" />
              <div>
                <p className="font-semibold text-primary">{selPatient?.name}</p>
                <p className="text-sm text-muted">{fmtTime(selAppt.date)} · {selAppt.duration} min · {MODALITY_CONFIG[selAppt.modality]?.label}</p>
              </div>
              <div className="ml-auto"><StatusBadge status={selAppt.status} /></div>
            </div>
            {selAppt.modality === 'online' && selAppt.meetingLink && (
              <a href={selAppt.meetingLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl text-sm transition-colors"
                style={{ background: 'var(--brand-light)', color: 'var(--brand-text)' }}>
                <Video size={14} /> {selAppt.meetingLink}
              </a>
            )}
            {selAppt.notes && (
              <p className="text-sm text-secondary rounded-xl p-3" style={{ background: 'var(--bg-hover)' }}>{selAppt.notes}</p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="danger" size="sm" onClick={handleDelete}>Excluir</Button>
              <Button variant="outline" size="sm" onClick={() => { detailModal.hide(); setTimeout(() => editModal.show(selAppt), 100) }} className="flex-1">Editar</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={editModal.open} onClose={editModal.hide} title="Editar consulta" size="md">
        {editModal.data && <AppointmentForm initial={editModal.data} onSubmit={handleEdit} onCancel={editModal.hide} />}
      </Modal>
    </div>
  )
}
