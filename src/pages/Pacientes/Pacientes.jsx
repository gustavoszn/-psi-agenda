import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, ChevronRight, UserCheck, UserX } from 'lucide-react'
import { differenceInYears } from 'date-fns'
import { useData } from '@/contexts/DataContext'
import { useModal } from '@/hooks/useModal'
import { useSearch } from '@/hooks/useSearch'
import { fmtDate, fmtTime } from '@/utils/helpers'
import Modal from '@/components/Modal/Modal'
import PatientForm from '@/components/Patient/PatientForm'
import AppointmentForm from '@/components/Modal/AppointmentForm'
import Avatar from '@/components/UI/Avatar'
import Button from '@/components/UI/Button'
import StatusBadge from '@/components/UI/StatusBadge'
import ConfirmDialog from '@/components/UI/ConfirmDialog'
import { ListSkeleton } from '@/components/UI/Skeleton'

function PatientDetail({ patient, appointments, onEdit, onDelete, onNewAppt }) {
  const patientAppts = appointments.filter(a => a.patientId === patient.id).sort((a,b) => new Date(b.date)-new Date(a.date))
  const last = patientAppts.find(a => a.status === 'done')
  const next = patientAppts.find(a => new Date(a.date) > new Date() && !['cancelled','missed'].includes(a.status))
  const age  = patient.birthDate ? differenceInYears(new Date(), new Date(patient.birthDate)) : null

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start gap-4">
        <Avatar name={patient.name} photo={patient.photo} size="xl" />
        <div className="flex-1">
          <h3 className="text-base font-bold text-primary">{patient.name}</h3>
          {age !== null && <p className="text-sm text-muted">{age} anos</p>}
          <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: patient.status === 'active' ? 'var(--brand-light)' : 'var(--bg-hover)', color: patient.status === 'active' ? 'var(--brand-text)' : 'var(--text-muted)' }}>
            {patient.status === 'active' ? <UserCheck size={11} /> : <UserX size={11} />}
            {patient.status === 'active' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-secondary">
        {patient.phone && <p>📞 {patient.phone}</p>}
        {patient.email && <p>✉️ {patient.email}</p>}
        {last && <p>📅 Última: {fmtDate(last.date)}</p>}
        {next && <p style={{ color: 'var(--brand-text)' }}>📅 Próxima: {fmtDate(next.date)}</p>}
      </div>

      {patient.notes && (
        <div className="rounded-xl p-3" style={{ background: 'var(--bg-hover)' }}>
          <p className="text-xs font-medium text-muted mb-1">Observações</p>
          <p className="text-sm text-secondary">{patient.notes}</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Histórico ({patientAppts.length})</p>
          <Button size="sm" onClick={onNewAppt}><Plus size={13} /> Agendar</Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {patientAppts.slice(0,10).map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-hover)' }}>
              <div className="flex-1">
                <p className="text-sm text-primary">{fmtDate(a.date)} às {fmtTime(a.date)}</p>
                <p className="text-xs text-muted">{a.duration} min · {a.modality}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
          {patientAppts.length === 0 && <p className="text-sm text-muted text-center py-4">Nenhuma consulta</p>}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-token">
        <Button variant="danger" size="sm" onClick={onDelete}>Excluir</Button>
        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">Editar</Button>
      </div>
    </div>
  )
}

export default function Pacientes() {
  const { patients, appointments, addPatient, editPatient, removePatient, addAppointment, loading } = useData()
  const { query, setQuery, results } = useSearch(patients, ['name','phone','email'])
  const [filter, setFilter] = useState('all')
  const createModal  = useModal()
  const editModal    = useModal()
  const detailModal  = useModal()
  const apptModal    = useModal()
  const confirmModal = useModal()

  const filtered = useMemo(() => results.filter(p => filter === 'all' || p.status === filter), [results, filter])

  const handleCreate  = async data => { await addPatient(data); createModal.hide() }
  const handleEdit    = async data => { await editPatient(editModal.data.id, data); editModal.hide() }
  const handleDelete  = async ()   => { await removePatient(confirmModal.data); confirmModal.hide(); detailModal.hide() }
  const handleNewAppt = async data => { await addAppointment({ ...data, patientId: detailModal.data.id }); apptModal.hide() }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar paciente..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 transition-all"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', '--tw-ring-color': 'var(--brand-light)' }}
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'var(--bg-hover)' }}>
          {[['all','Todos'],['active','Ativos'],['inactive','Inativos']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              style={{ background: filter === v ? 'var(--bg-surface)' : 'transparent', color: filter === v ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: filter === v ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}>
              {l}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={createModal.show}><Plus size={14} /> Novo paciente</Button>
      </div>

      <p className="text-xs text-muted">{filtered.length} paciente{filtered.length !== 1 ? 's' : ''}</p>

      {loading ? <ListSkeleton /> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p, i) => {
            const appts = appointments.filter(a => a.patientId === p.id)
            const next  = appts.find(a => new Date(a.date) > new Date() && !['cancelled','missed'].includes(a.status))
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => detailModal.show(p)}
                className="flex items-center gap-3 p-4 rounded-2xl border border-token cursor-pointer transition-all hover:shadow-sm"
                style={{ background: 'var(--bg-surface)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <Avatar name={p.name} photo={p.photo} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{p.name}</p>
                  <p className="text-xs text-muted truncate">{p.phone || p.email || '—'}</p>
                  {next && <p className="text-xs mt-0.5" style={{ color: 'var(--brand-text)' }}>Próxima: {fmtDate(next.date)}</p>}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.status === 'active' ? 'var(--brand)' : 'var(--border)' }} />
                  <ChevronRight size={13} className="text-muted" />
                </div>
              </motion.div>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-sm text-muted">Nenhum paciente encontrado</p>
            </div>
          )}
        </div>
      )}

      <Modal open={createModal.open} onClose={createModal.hide} title="Novo paciente" size="md">
        <PatientForm onSubmit={handleCreate} onCancel={createModal.hide} />
      </Modal>

      <Modal open={detailModal.open} onClose={detailModal.hide} title={detailModal.data?.name} size="lg">
        {detailModal.data && (
          <PatientDetail patient={detailModal.data} appointments={appointments}
            onEdit={() => editModal.show(detailModal.data)}
            onDelete={() => confirmModal.show(detailModal.data.id)}
            onNewAppt={() => apptModal.show()} />
        )}
      </Modal>

      <Modal open={editModal.open} onClose={editModal.hide} title="Editar paciente" size="md">
        {editModal.data && <PatientForm initial={editModal.data} onSubmit={handleEdit} onCancel={editModal.hide} />}
      </Modal>

      <Modal open={apptModal.open} onClose={apptModal.hide} title="Agendar consulta" size="md">
        {apptModal.open && <AppointmentForm initial={detailModal.data ? { patientId: detailModal.data.id } : null} onSubmit={handleNewAppt} onCancel={apptModal.hide} />}
      </Modal>

      <ConfirmDialog open={confirmModal.open} onClose={confirmModal.hide} onConfirm={handleDelete}
        title="Excluir paciente" message="Isso também removerá todas as consultas deste paciente. Deseja continuar?" />
    </div>
  )
}
