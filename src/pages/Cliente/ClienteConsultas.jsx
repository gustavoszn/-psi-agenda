import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import ConsultaCard from '@/components/Cliente/ConsultaCard'
import Modal from '@/components/Modal/Modal'
import Button from '@/components/UI/Button'
import ConfirmDialog from '@/components/UI/ConfirmDialog'

export default function ClienteConsultas() {
  const { user } = useAuth(); const { appointments, editAppointment } = useData()
  const [filter, setFilter] = useState('upcoming'); const [reschedule, setReschedule] = useState(null); const [message, setMessage] = useState('')
  const [cancelAppointment, setCancelAppointment] = useState(null)
  const mine = useMemo(() => appointments.filter(item => item.patientId === user.patientId).sort((a, b) => new Date(a.date) - new Date(b.date)), [appointments, user.patientId])
  const visible = filter === 'upcoming' ? mine.filter(item => new Date(item.date) > new Date() && !['cancelled', 'missed'].includes(item.status)) : mine.filter(item => new Date(item.date) <= new Date() || ['cancelled', 'missed'].includes(item.status)).reverse()
  const updateStatus = async (item, status) => { await editAppointment(item.id, { ...item, status }); toast.success(status === 'confirmed' ? 'Presença confirmada!' : 'Consulta cancelada.') }
  const request = async () => { await editAppointment(reschedule.id, { ...reschedule, status: 'rescheduled', notes: `${reschedule.notes || ''}\nSolicitação do paciente: ${message || 'Entrar em contato para definir novo horário.'}`.trim() }); setReschedule(null); setMessage(''); toast.success('Solicitação enviada para a doutora.') }
  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8"><div className="mb-6"><h1 className="text-2xl font-bold text-primary">Minhas consultas</h1><p className="text-sm text-muted mt-1">Consulte horários, confirme presença ou solicite alterações.</p></div><div className="inline-flex p-1 rounded-xl bg-hover mb-5">{[['upcoming', 'Próximas'], ['history', 'Histórico']].map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: filter === value ? 'var(--bg-surface)' : 'transparent', color: filter === value ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</button>)}</div><div className="grid lg:grid-cols-2 gap-4">{visible.map(item => <ConsultaCard key={item.id} appointment={item} onConfirm={appointment => updateStatus(appointment, 'confirmed')} onCancel={setCancelAppointment} onReschedule={setReschedule} />)}{!visible.length && <div className="lg:col-span-2 p-12 text-center rounded-2xl border border-token bg-surface text-sm text-muted">Nenhuma consulta nesta seção.</div>}</div>
      <Modal open={!!reschedule} onClose={() => setReschedule(null)} title="Solicitar reagendamento"><div className="p-5 space-y-4"><p className="text-sm text-secondary">Informe dias ou horários de preferência. A doutora receberá esta solicitação na agenda.</p><label className="block"><span className="text-xs font-semibold text-secondary">Mensagem opcional</span><textarea value={message} onChange={event => setMessage(event.target.value)} rows={4} className="mt-2 w-full rounded-xl bg-hover border border-token p-3 text-sm text-primary" placeholder="Ex.: prefiro terça-feira após as 15h" /></label><div className="flex gap-2"><Button variant="outline" onClick={() => setReschedule(null)} className="flex-1">Voltar</Button><Button onClick={request} className="flex-1">Enviar solicitação</Button></div></div></Modal>
      <ConfirmDialog open={!!cancelAppointment} onClose={() => setCancelAppointment(null)} onConfirm={async () => { await updateStatus(cancelAppointment, 'cancelled'); setCancelAppointment(null) }} title="Cancelar consulta" message="Deseja realmente cancelar esta consulta? A profissional será informada da alteração." />
    </main>
  )
}
