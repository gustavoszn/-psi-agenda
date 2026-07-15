import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X, Save, User, Calendar, Camera, MapPin, Phone, Award, Clock, Briefcase } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { useAuth } from '@/contexts/AuthContext'
import Input, { Textarea } from '@/components/UI/Input'
import Button from '@/components/UI/Button'
import Avatar from '@/components/UI/Avatar'
import { fmtDate } from '@/utils/helpers'

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const Section = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-token p-5 space-y-4" style={{ background: 'var(--bg-surface)' }}>
    <div className="flex items-center gap-2">
      {Icon && <Icon size={14} style={{ color: 'var(--brand)' }} />}
      <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
)

const Tab = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className="px-4 py-2 text-sm font-medium rounded-xl transition-all"
    style={{
      background: active ? 'var(--brand)' : 'var(--bg-hover)',
      color: active ? '#fff' : 'var(--text-secondary)',
    }}>
    {children}
  </button>
)

// ── Aba Perfil ────────────────────────────────────────────────
function PerfilTab() {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(user?.photo || null)
  const fileRef = useRef()

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name:           user?.name        || '',
      crp:            user?.crp         || '',
      phone:          user?.phone       || '',
      bio:            user?.bio         || '',
      birthDate:      user?.birthDate   || '',
      homeAddress:    user?.homeAddress || '',
      workAddress:    user?.workAddress || '',
      specialty:      user?.specialty   || '',
      education:      user?.education   || '',
      sessionPrice:   user?.sessionPrice || '',
      instagram:      user?.instagram   || '',
      site:           user?.site        || '',
    },
  })

  useEffect(() => { if (user) reset({ ...user }) }, [user])

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const submit = async (data) => {
    setLoading(true)
    try {
      await updateProfile({ ...data, photo: photoPreview })
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">

      {/* Foto */}
      <Section title="Foto de perfil" icon={Camera}>
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={user?.name} photo={photoPreview} size="xl" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center shadow-md transition-opacity hover:opacity-80"
              style={{ background: 'var(--brand)' }}>
              <Camera size={13} className="text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">{user?.name}</p>
            <p className="text-xs text-muted mt-0.5">JPG ou PNG · máx. 2MB</p>
            {photoPreview && photoPreview !== user?.photo && (
              <button type="button" onClick={() => setPhotoPreview(user?.photo || null)}
                className="text-xs mt-1 transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent-text)' }}>
                Remover
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Dados pessoais */}
      <Section title="Dados pessoais" icon={User}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nome completo" {...register('name')} />
          </div>
          <Input label="Data de nascimento" type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('birthDate')} />
          <Input label="Telefone / WhatsApp" placeholder="(11) 99999-9999"
            {...register('phone')} />
        </div>
        <Textarea label="Bio / Apresentação" rows={3}
          placeholder="Escreva uma breve apresentação sobre você..."
          {...register('bio')} />
      </Section>

      {/* Dados profissionais */}
      <Section title="Dados profissionais" icon={Award}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="CRP" placeholder="CRP 06/000000" {...register('crp')} />
          <Input label="Especialidade" placeholder="Ex: Psicologia Clínica"
            {...register('specialty')} />
          <div className="col-span-2">
            <Input label="Formação / Instituição" placeholder="Ex: USP — Psicologia, 2015"
              {...register('education')} />
          </div>
          <Input label="Valor da sessão (R$)" type="number" min={0} placeholder="Ex: 200"
            {...register('sessionPrice')} />
          <Input label="Duração padrão da sessão (min)" type="number" min={15} max={180}
            placeholder="50" {...register('defaultSessionDuration')} />
        </div>
      </Section>

      {/* Endereços */}
      <Section title="Endereços" icon={MapPin}>
        <Input label="Endereço residencial" placeholder="Rua, número, bairro, cidade"
          {...register('homeAddress')} />
        <Input label="Endereço do consultório" placeholder="Rua, número, sala, cidade"
          {...register('workAddress')} />
      </Section>

      {/* Contato & redes */}
      <Section title="Contato & redes sociais" icon={Phone}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Instagram" placeholder="@usuario" {...register('instagram')} />
          <Input label="Site / Link" placeholder="https://..." {...register('site')} />
        </div>
      </Section>

      <Button type="submit" loading={loading} className="w-full justify-center py-3">
        <Save size={15} /> Salvar perfil
      </Button>
    </form>
  )
}

// ── Aba Agenda ────────────────────────────────────────────────
function AgendaTab() {
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
    <form onSubmit={handleSubmit(submit)} className="space-y-4">

      <Section title="Dias de trabalho" icon={Calendar}>
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

      <Section title="Horários de atendimento" icon={Clock}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Início do expediente" type="number" min={0} max={23} {...register('startHour')} />
          <Input label="Fim do expediente"    type="number" min={0} max={23} {...register('endHour')} />
          <Input label="Início do almoço"     type="number" min={0} max={23} {...register('lunchStart')} />
          <Input label="Fim do almoço"        type="number" min={0} max={23} {...register('lunchEnd')} />
        </div>
      </Section>

      <Section title="Configurações de sessão" icon={Briefcase}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Duração padrão (min)"            type="number" min={15} max={180} {...register('defaultDuration')} />
          <Input label="Intervalo entre consultas (min)" type="number" min={0}  max={60}  {...register('intervalBetween')} />
        </div>
      </Section>

      <Section title="Datas bloqueadas / Férias" icon={X}>
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
  )
}

// ── Página principal ──────────────────────────────────────────
export default function Configuracoes() {
  const [tab, setTab] = useState('perfil')

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl space-y-5">
        <div className="flex gap-2">
          <Tab active={tab === 'perfil'}  onClick={() => setTab('perfil')}>Perfil</Tab>
          <Tab active={tab === 'agenda'}  onClick={() => setTab('agenda')}>Agenda</Tab>
        </div>

        {tab === 'perfil' && <PerfilTab />}
        {tab === 'agenda' && <AgendaTab />}
      </div>
    </div>
  )
}
