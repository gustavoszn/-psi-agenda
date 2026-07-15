import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X, Save } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import Input from '@/components/UI/Input'
import Button from '@/components/UI/Button'
import { fmtDate } from '@/utils/helpers'

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const Section = ({ title, children }) => (
  <div className="rounded-2xl border border-token p-5 space-y-4" style={{ background: 'var(--bg-surface)' }}>
    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide">{title}</h3>
    {children}
  </div>
)

export default function Configuracoes() {
  const { settings, saveSettings } = useData()
  const [loading, setLoading]           = useState(false)
  const [blocked, setBlocked]           = useState([])
  const [blockedInput, setBlockedInput] = useState('')
  const [workDays, setWorkDays]         = useState([1,2,3,4,5])

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { startHour: 7, endHour: 22, lunchStart: 12, lunchEnd: 13, intervalBetween: 10, defaultDuration: 50 }
  })

  useEffect(() => {
    if (!settings) return
    reset({
      startHour:       settings.startHour       ?? 7,
      endHour:         settings.endHour         ?? 22,
      lunchStart:      settings.lunchStart      ?? 12,
      lunchEnd:        settings.lunchEnd        ?? 13,
      intervalBetween: settings.intervalBetween ?? 10,
      defaultDuration: settings.defaultDuration ?? 50,
    })
    setBlocked(settings.blockedDates || [])
    setWorkDays(settings.workDays    || [1,2,3,4,5])
  }, [settings, reset])

  const toggleDay = d => setWorkDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a,b) => a-b)
  )

  const submit = async (data) => {
    setLoading(true)
    try {
      await saveSettings({
        startHour:       Number(data.startHour),
        endHour:         Number(data.endHour),
        lunchStart:      Number(data.lunchStart),
        lunchEnd:        Number(data.lunchEnd),
        intervalBetween: Number(data.intervalBetween),
        defaultDuration: Number(data.defaultDuration),
        workDays,
        blockedDates: blocked,
      })
    } finally { setLoading(false) }
  }

  const addBlocked = () => {
    if (blockedInput && !blocked.includes(blockedInput)) {
      setBlocked(p => [...p, blockedInput].sort())
      setBlockedInput('')
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl space-y-4">
        <form onSubmit={handleSubmit(submit)} className="space-y-4">

          <Section title="Dias de trabalho">
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((d, i) => (
                <button key={i} type="button" onClick={() => toggleDay(i)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: workDays.includes(i) ? 'var(--brand)' : 'var(--bg-hover)',
                    color: workDays.includes(i) ? '#fff' : 'var(--text-secondary)',
                  }}>
                  {d}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Horários de atendimento">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Início do expediente" type="number" min={0} max={23} {...register('startHour')} />
              <Input label="Fim do expediente"    type="number" min={0} max={23} {...register('endHour')} />
              <Input label="Início do almoço"     type="number" min={0} max={23} {...register('lunchStart')} />
              <Input label="Fim do almoço"        type="number" min={0} max={23} {...register('lunchEnd')} />
            </div>
          </Section>

          <Section title="Configurações de sessão">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Duração padrão (min)"           type="number" min={15} max={180} {...register('defaultDuration')} />
              <Input label="Intervalo entre consultas (min)" type="number" min={0}  max={60}  {...register('intervalBetween')} />
            </div>
          </Section>

          <Section title="Datas bloqueadas / Férias">
            <div className="flex gap-2">
              <input type="date" value={blockedInput} onChange={e => setBlockedInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-sm text-primary focus:outline-none focus:ring-2 transition-all"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', '--tw-ring-color': 'var(--brand-light)' }}
              />
              <Button type="button" size="sm" onClick={addBlocked}><Plus size={14} /></Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[2rem]">
              {blocked.length === 0
                ? <p className="text-sm text-muted">Nenhuma data bloqueada</p>
                : blocked.map(d => (
                  <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-secondary"
                    style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                    {fmtDate(d + 'T12:00:00')}
                    <button type="button" onClick={() => setBlocked(p => p.filter(x => x !== d))}
                      className="text-muted hover:text-secondary transition-colors">
                      <X size={11} />
                    </button>
                  </span>
                ))
              }
            </div>
          </Section>

          <Button type="submit" loading={loading} className="w-full justify-center py-3">
            <Save size={15} /> Salvar configurações
          </Button>
        </form>
      </div>
    </div>
  )
}
