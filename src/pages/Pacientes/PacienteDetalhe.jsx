import { useMemo } from 'react'
import { ArrowLeft, CalendarDays, Clock3, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { differenceInYears } from 'date-fns'
import { useData } from '@/contexts/DataContext'
import { fmtDate, fmtDateTime, MODALITY_CONFIG } from '@/utils/helpers'
import Avatar from '@/components/UI/Avatar'
import StatusBadge from '@/components/UI/StatusBadge'
import Button from '@/components/UI/Button'
import { ListSkeleton } from '@/components/UI/Skeleton'

function Info({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 rounded-xl bg-hover p-3">
      <Icon size={17} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
      <div className="min-w-0"><p className="text-xs text-muted">{label}</p><p className="text-sm text-primary break-words">{children || 'Não informado'}</p></div>
    </div>
  )
}

export default function PacienteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { patients, appointments, loading } = useData()
  const patient = patients.find(item => item.id === id)
  const patientAppointments = useMemo(() => appointments
    .filter(item => item.patientId === id)
    .sort((a, b) => new Date(b.date) - new Date(a.date)), [appointments, id])
  const upcoming = patientAppointments.filter(item => new Date(item.date) > new Date() && !['cancelled', 'missed'].includes(item.status))
  const completed = patientAppointments.filter(item => item.status === 'done')

  if (loading) return <div className="p-4 sm:p-6"><ListSkeleton /></div>
  if (!patient) return (
    <div className="max-w-lg mx-auto p-8 text-center">
      <UserRound size={32} className="mx-auto text-muted" />
      <h2 className="mt-3 text-lg font-bold text-primary">Paciente não encontrado</h2>
      <p className="mt-1 mb-5 text-sm text-muted">O cadastro pode ter sido removido ou o endereço está incorreto.</p>
      <Button onClick={() => navigate('/pacientes')}>Voltar para pacientes</Button>
    </div>
  )

  const address = [patient.street && `${patient.street}${patient.addressNumber ? `, ${patient.addressNumber}` : ''}`, patient.neighborhood, [patient.city, patient.state].filter(Boolean).join(' - '), patient.cep].filter(Boolean).join(', ') || patient.address
  const age = patient.birthDate ? differenceInYears(new Date(), new Date(patient.birthDate)) : null

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
      <Link to="/pacientes" className="inline-flex items-center gap-2 text-sm text-secondary hover:opacity-70"><ArrowLeft size={15} /> Pacientes</Link>
      <section className="rounded-2xl border border-token bg-surface p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar name={patient.name} photo={patient.photo} size="xl" />
          <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold text-primary">{patient.name}</h1><span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: patient.status === 'active' ? 'var(--brand-light)' : 'var(--bg-hover)', color: patient.status === 'active' ? 'var(--brand-text)' : 'var(--text-muted)' }}>{patient.status === 'active' ? 'Ativo' : 'Inativo'}</span></div><p className="text-sm text-muted mt-1">{age !== null ? `${age} anos · ` : ''}Paciente desde {fmtDate(patient.createdAt)}</p></div>
          <Link to="/agenda"><Button><CalendarDays size={15} /> Abrir agenda</Button></Link>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[[CalendarDays, 'Consultas', patientAppointments.length], [Clock3, 'Próximas', upcoming.length], [UserRound, 'Realizadas', completed.length], [CalendarDays, 'Faltas', patientAppointments.filter(item => item.status === 'missed').length]].map(([Icon, label, value]) => <div key={label} className="rounded-2xl border border-token bg-surface p-4"><Icon size={17} style={{ color: 'var(--brand)' }} /><p className="text-xl font-bold text-primary mt-2">{value}</p><p className="text-xs text-muted">{label}</p></div>)}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.35fr] gap-5">
        <section className="rounded-2xl border border-token bg-surface p-5 space-y-3">
          <h2 className="font-bold text-primary">Dados cadastrais</h2>
          <Info icon={Phone} label="Telefone">{patient.phone}</Info>
          <Info icon={Mail} label="E-mail">{patient.email}</Info>
          <Info icon={UserRound} label="CPF">{patient.cpf}</Info>
          <Info icon={MapPin} label="Endereço">{address}</Info>
          {patient.notes && <div className="pt-2"><p className="text-xs font-semibold text-muted uppercase tracking-wide">Observações</p><p className="text-sm text-secondary mt-1 whitespace-pre-wrap">{patient.notes}</p></div>}
        </section>

        <section className="rounded-2xl border border-token bg-surface p-5">
          <div className="flex items-center justify-between gap-3 mb-4"><div><h2 className="font-bold text-primary">Histórico de consultas</h2><p className="text-xs text-muted">Agenda vinculada a este paciente</p></div><Link to="/agenda" className="text-xs font-semibold" style={{ color: 'var(--brand-text)' }}>Ver agenda</Link></div>
          <div className="space-y-2">
            {patientAppointments.map(item => <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-xl bg-hover p-3"><div className="flex-1"><p className="text-sm font-semibold text-primary">{fmtDateTime(item.date)}</p><p className="text-xs text-muted">{item.duration} min · {MODALITY_CONFIG[item.modality]?.label || item.modality}</p></div><StatusBadge status={item.status} /></div>)}
            {!patientAppointments.length && <p className="py-10 text-center text-sm text-muted">Nenhuma consulta vinculada.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
