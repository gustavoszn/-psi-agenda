import { CalendarCheck, CalendarDays, CheckCircle2, Clock3, MessageCircle, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import ConsultaCard from '@/components/Cliente/ConsultaCard'

export default function ClienteHome() {
  const { user } = useAuth(); const { appointments, editAppointment } = useData()
  const mine = useMemo(() => appointments.filter(item => item.patientId === user.patientId).sort((a, b) => new Date(a.date) - new Date(b.date)), [appointments, user.patientId])
  const upcoming = mine.filter(item => new Date(item.date) > new Date() && !['cancelled', 'missed'].includes(item.status))
  const completed = mine.filter(item => item.status === 'done').length
  const firstName = user.name.split(' ')[0]
  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <section className="rounded-3xl p-6 sm:p-8 text-white overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #3d6b4d, #6d9478)' }}><div className="relative"><p className="text-sm text-white/75">Olá, {firstName}</p><h1 className="text-2xl sm:text-3xl font-bold mt-1">Seu cuidado começa por aqui.</h1><p className="text-sm text-white/75 mt-3 max-w-xl">Acompanhe sua agenda e gerencie seus próximos atendimentos.</p></div></section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[[CalendarDays, 'Próximas', upcoming.length], [CheckCircle2, 'Realizadas', completed], [Clock3, 'Duração padrão', '50 min'], [ShieldCheck, 'Ambiente', 'Seguro']].map(([Icon, label, value]) => <div key={label} className="p-4 rounded-2xl border border-token bg-surface"><Icon size={18} style={{ color: 'var(--brand)' }} /><p className="text-xl font-bold text-primary mt-3">{value}</p><p className="text-xs text-muted">{label}</p></div>)}</div>
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5"><section><div className="flex items-center justify-between mb-3"><h2 className="font-bold text-primary">Próxima consulta</h2><Link to="/cliente/consultas" className="text-xs" style={{ color: 'var(--brand-text)' }}>Ver todas</Link></div>{upcoming[0] ? <ConsultaCard appointment={upcoming[0]} onConfirm={item => editAppointment(item.id, { ...item, status: 'confirmed' })} /> : <div className="p-8 text-center rounded-2xl border border-token bg-surface"><CalendarCheck className="mx-auto text-muted" /><p className="text-sm text-muted mt-3">Nenhuma consulta futura.</p></div>}</section><aside className="space-y-3"><h2 className="font-bold text-primary">Informações importantes</h2><div className="rounded-2xl border border-token bg-surface p-5"><MessageCircle size={19} style={{ color: 'var(--brand)' }} /><h3 className="text-sm font-semibold text-primary mt-3">Precisa falar com a clínica?</h3><p className="text-xs text-muted mt-1">Entre em contato para dúvidas administrativas ou alterações urgentes.</p><a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="inline-flex text-xs font-semibold mt-3" style={{ color: 'var(--brand-text)' }}>Abrir WhatsApp</a></div><div className="rounded-2xl border border-token bg-surface p-5"><ShieldCheck size={19} style={{ color: 'var(--brand)' }} /><p className="text-xs text-muted mt-3">Este portal exibe somente informações administrativas de agenda. Dados clínicos não são disponibilizados aqui.</p></div></aside></div>
    </main>
  )
}
