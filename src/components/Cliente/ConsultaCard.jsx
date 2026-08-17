import { CalendarDays, Check, Clock, MapPin, Video, X } from 'lucide-react'
import { fmtDate, fmtTime, MODALITY_CONFIG } from '@/utils/helpers'
import StatusBadge from '@/components/UI/StatusBadge'
import Button from '@/components/UI/Button'

export default function ConsultaCard({ appointment, onConfirm, onCancel, onReschedule, compact = false }) {
  const future = new Date(appointment.date) > new Date()
  return (
    <article className="rounded-2xl border border-token bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-muted capitalize">{fmtDate(appointment.date, 'EEEE')}</p><h3 className="text-lg font-bold text-primary mt-0.5">{fmtDate(appointment.date)}</h3></div><StatusBadge status={appointment.status} /></div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-sm text-secondary"><span className="flex items-center gap-2"><Clock size={15} /> {fmtTime(appointment.date)} · {appointment.duration} min</span><span className="flex items-center gap-2">{appointment.modality === 'online' ? <Video size={15} /> : <MapPin size={15} />} {MODALITY_CONFIG[appointment.modality]?.label}</span></div>
      {appointment.notes && !compact && <p className="text-sm text-secondary mt-4 p-3 rounded-xl bg-hover">{appointment.notes}</p>}
      {future && !['cancelled', 'done', 'missed'].includes(appointment.status) && !compact && <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-token">{appointment.status !== 'confirmed' && <Button size="sm" onClick={() => onConfirm?.(appointment)}><Check size={14} /> Confirmar presença</Button>}<Button size="sm" variant="outline" onClick={() => onReschedule?.(appointment)}><CalendarDays size={14} /> Solicitar reagendamento</Button><Button size="sm" variant="ghost" onClick={() => onCancel?.(appointment)}><X size={14} /> Cancelar</Button></div>}
      {appointment.modality === 'online' && appointment.meetingLink && future && <a href={appointment.meetingLink} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white" style={{ background: 'var(--brand)' }}><Video size={16} /> Entrar na consulta online</a>}
    </article>
  )
}
