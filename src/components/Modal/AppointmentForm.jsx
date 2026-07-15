import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { format, getDay } from 'date-fns'
import { AlertCircle, Lightbulb } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { hasConflict, getSuggestedSlots, fmtTime } from '@/utils/helpers'
import Input, { Select, Textarea } from '@/components/UI/Input'
import Button from '@/components/UI/Button'

const START_HOUR = 7
const END_HOUR   = 19

function validateDateTime(value, settings, isEdit) {
  if (!value) return 'Informe a data e hora'
  const date = new Date(value)
  if (isNaN(date)) return 'Data inválida'

  if (!isEdit && date < new Date())
    return 'Não é possível agendar em uma data/hora que já passou'

  const hour     = date.getHours()
  const min      = date.getMinutes()
  const totalMin = hour * 60 + min

  if (hour < START_HOUR || (hour === END_HOUR && min > 0) || hour > END_HOUR)
    return `Horário permitido: 07:00 às 19:00`

  if (settings) {
    const weekDay = getDay(date)
    if (!settings.workDays.includes(weekDay))
      return 'Este dia não é um dia de atendimento'

    const lunchStart = settings.lunchStart * 60
    const lunchEnd   = settings.lunchEnd   * 60
    if (totalMin >= lunchStart && totalMin < lunchEnd)
      return `Horário de almoço: ${String(settings.lunchStart).padStart(2,'0')}:00 – ${String(settings.lunchEnd).padStart(2,'0')}:00`
  }

  return true
}

export default function AppointmentForm({ initial, onSubmit, onCancel }) {
  const { patients, appointments, settings } = useData()
  const [conflict, setConflict] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const defaultDate = initial?.date
    ? format(new Date(initial.date), "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm")

  const todayMin = `${format(new Date(), 'yyyy-MM-dd')}T07:00`
  const dateMax  = `2099-12-31T19:00`

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      patientId:   initial?.patientId   || '',
      date:        defaultDate,
      duration:    initial?.duration    || settings?.defaultDuration || 50,
      modality:    initial?.modality    || 'presencial',
      meetingLink: initial?.meetingLink || '',
      status:      initial?.status      || 'scheduled',
      notes:       initial?.notes       || '',
    },
  })

  const watchDate     = watch('date')
  const watchDuration = watch('duration')
  const watchModality = watch('modality')

  useEffect(() => {
    if (!watchDate || !watchDuration) return
    const valid = validateDateTime(watchDate, settings)
    if (valid !== true) { setConflict(false); setSuggestions([]); return }
    const c = hasConflict(appointments, new Date(watchDate), Number(watchDuration), initial?.id)
    setConflict(c)
    setSuggestions(c && settings ? getSuggestedSlots(new Date(watchDate), Number(watchDuration), appointments, settings) : [])
  }, [watchDate, watchDuration])

  const submit = async (data) => {
    if (conflict) return
    setLoading(true)
    try {
      await onSubmit({ ...data, date: new Date(data.date).toISOString(), duration: Number(data.duration) })
    } finally { setLoading(false) }
  }

  const dateError = errors.date?.message
  const hasBlocker = conflict || !!dateError

  return (
    <form onSubmit={handleSubmit(submit)} className="p-6 space-y-4">
      <Select label="Paciente" error={errors.patientId?.message}
        {...register('patientId', { required: 'Selecione um paciente' })}>
        <option value="">Selecionar paciente...</option>
        {patients.filter(p => p.status === 'active').map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Data e Hora" type="datetime-local" error={dateError}
          min={initial?.id ? undefined : todayMin}
          max={dateMax}
          {...register('date', {
            required: 'Informe a data e hora',
            validate: v => validateDateTime(v, settings, !!initial?.id),
          })} />
        <Input label="Duração (min)" type="number" min={15} max={180}
          error={errors.duration?.message}
          {...register('duration', {
            required: 'Informe a duração',
            min: { value: 15, message: 'Mínimo 15 minutos' },
            max: { value: 180, message: 'Máximo 180 minutos' },
          })} />
      </div>

      {/* Aviso de horário fora do expediente */}
      {dateError && dateError !== 'Informe a data e hora' && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl border"
          style={{ background: 'var(--accent-light)', borderColor: 'var(--accent)' }}>
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-text)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>{dateError}</p>
        </div>
      )}

      {/* Aviso de conflito */}
      {conflict && !dateError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl border"
          style={{ background: 'var(--accent-light)', borderColor: 'var(--accent)' }}>
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-text)' }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>Conflito de horário</p>
            {suggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs mb-1.5 flex items-center gap-1" style={{ color: 'var(--accent-text)' }}>
                  <Lightbulb size={11} /> Horários disponíveis:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button"
                      onClick={() => setValue('date', format(s, "yyyy-MM-dd'T'HH:mm"))}
                      className="px-2.5 py-1 text-xs rounded-lg transition-opacity hover:opacity-70"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent)', color: 'var(--accent-text)' }}>
                      {fmtTime(s)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Select label="Modalidade" {...register('modality')}>
          <option value="presencial">Presencial</option>
          <option value="online">Online</option>
        </Select>
        <Select label="Status" {...register('status')}>
          <option value="scheduled">Agendada</option>
          <option value="confirmed">Confirmada</option>
          <option value="done">Realizada</option>
          <option value="cancelled">Cancelada</option>
          <option value="missed">Faltou</option>
        </Select>
      </div>

      {watchModality === 'online' && (
        <Input label="Link da reunião" placeholder="https://meet.google.com/..."
          error={errors.meetingLink?.message}
          {...register('meetingLink', {
            required: 'Informe o link da reunião',
            pattern: { value: /^https?:\/\/.+/, message: 'Link inválido (deve começar com http/https)' },
          })} />
      )}

      <Textarea label="Observações" rows={3} placeholder="Anotações..." {...register('notes')} />

      {/* Bloqueio visual quando há erros impeditivos */}
      {hasBlocker && (
        <p className="text-xs text-center font-medium" style={{ color: 'var(--accent-text)' }}>
          Corrija os erros acima para continuar
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button type="submit" loading={loading} disabled={hasBlocker} className="flex-1">
          {initial?.id ? 'Salvar' : 'Agendar'}
        </Button>
      </div>
    </form>
  )
}
