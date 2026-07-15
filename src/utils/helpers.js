import { format, addMinutes, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export { STATUS_CONFIG, MODALITY_CONFIG } from './statusConfig'

export const fmtDate = (d, fmt = 'dd/MM/yyyy') => format(new Date(d), fmt, { locale: ptBR })
export const fmtTime = (d) => format(new Date(d), 'HH:mm')
export const fmtDateTime = (d) => format(new Date(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
export const fmtDateLong = (d) => format(new Date(d), "EEEE, dd 'de' MMMM", { locale: ptBR })

export const getWeekDays = (date) =>
  eachDayOfInterval({ start: startOfWeek(date, { weekStartsOn: 0 }), end: endOfWeek(date, { weekStartsOn: 0 }) })

export const getMonthDays = (date) =>
  eachDayOfInterval({ start: startOfWeek(startOfMonth(date), { weekStartsOn: 0 }), end: endOfWeek(endOfMonth(date), { weekStartsOn: 0 }) })

export const hasConflict = (appointments, newDate, duration, excludeId = null) => {
  const newStart = new Date(newDate)
  const newEnd = addMinutes(newStart, duration)
  return appointments.some(a => {
    if (a.id === excludeId) return false
    if (['cancelled', 'missed'].includes(a.status)) return false
    const aStart = new Date(a.date)
    const aEnd = addMinutes(aStart, a.duration)
    return newStart < aEnd && newEnd > aStart
  })
}

export const getSuggestedSlots = (date, duration, appointments, settings) => {
  const slots = []
  const d = new Date(date)
  d.setHours(settings.startHour, 0, 0, 0)
  const end = new Date(date)
  end.setHours(settings.endHour, 0, 0, 0)
  while (addMinutes(d, duration) <= end) {
    const h = d.getHours()
    const isLunch = h >= settings.lunchStart && h < settings.lunchEnd
    if (!isLunch && !hasConflict(appointments, new Date(d), duration)) slots.push(new Date(d))
    d.setMinutes(d.getMinutes() + 30)
  }
  return slots.slice(0, 6)
}

export const getInitials = (name = '') => name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

export const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-teal-500', 'bg-rose-400', 'bg-pink-400',
  'bg-amber-500', 'bg-cyan-500', 'bg-green-600', 'bg-fuchsia-400',
]
export const getAvatarColor = (id = '') => AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length]
