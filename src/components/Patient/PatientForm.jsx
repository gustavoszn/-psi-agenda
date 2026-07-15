import { useForm, Controller } from 'react-hook-form'
import { useState, useRef, useEffect } from 'react'
import { Camera, User, MapPin, Phone, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import Input, { Select, Textarea } from '@/components/UI/Input'
import Button from '@/components/UI/Button'
import Avatar from '@/components/UI/Avatar'

// ── Masks ─────────────────────────────────────────────────────
const fmtPhone = (v = '') => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}
const fmtCPF = (v = '') => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}
const fmtCEP = (v = '') => {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length <= 5 ? d : `${d.slice(0,5)}-${d.slice(5)}`
}

// ── CEP lookup ────────────────────────────────────────────────
const fetchCEP = async (cep) => {
  const raw = cep.replace(/\D/g, '')
  if (raw.length !== 8) return null
  try {
    const r = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
    const d = await r.json()
    return d.erro ? null : d
  } catch { return null }
}

// ── Step indicator ────────────────────────────────────────────
const STEPS = [
  { icon: User,     label: 'Pessoal'   },
  { icon: Phone,    label: 'Contato'   },
  { icon: MapPin,   label: 'Endereço'  },
  { icon: FileText, label: 'Clínico'   },
]

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-4 border-b border-token">
      {STEPS.slice(0, total).map((s, i) => {
        const done    = i < current
        const active  = i === current
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                active ? 'shadow-sm' : ''
              }`}
                style={{
                  background: active ? 'var(--brand)' : done ? 'var(--brand-light)' : 'var(--bg-hover)',
                  color: active ? '#fff' : done ? 'var(--brand-text)' : 'var(--text-muted)',
                }}>
                <s.icon size={14} />
              </div>
              <span className="text-[10px] font-medium hidden sm:block"
                style={{ color: active ? 'var(--brand-text)' : 'var(--text-muted)' }}>
                {s.label}
              </span>
            </div>
            {i < total - 1 && (
              <div className="w-8 h-px mb-4" style={{ background: done ? 'var(--brand-light)' : 'var(--border)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Photo upload ──────────────────────────────────────────────
function PhotoUpload({ value, onChange, name }) {
  const fileRef = useRef()
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="relative">
        <Avatar name={name || 'P'} photo={value} size="2xl" />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full flex items-center justify-center shadow-md transition-opacity hover:opacity-80"
          style={{ background: 'var(--brand)' }}>
          <Camera size={14} className="text-white" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = ev => onChange(ev.target.result)
            reader.readAsDataURL(file)
          }} />
      </div>
      <div className="text-center">
        <p className="text-xs text-muted">Clique no ícone para adicionar foto</p>
        {value && (
          <button type="button" onClick={() => onChange(null)}
            className="text-xs mt-1 transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent-text)' }}>
            Remover foto
          </button>
        )}
      </div>
    </div>
  )
}

function MaskedInput({ label, error, hint, mask, value, onChange, ...props }) {
  return (
    <Input label={label} error={error} hint={hint} value={value}
      onChange={e => onChange(mask(e.target.value))} {...props} />
  )
}

// ── Steps ─────────────────────────────────────────────────────
function Step1({ register, control, errors, watch }) {
  const name = watch('name')
  return (
    <div className="space-y-4">
      <Controller name="photo" control={control} render={({ field }) => (
        <PhotoUpload value={field.value} onChange={field.onChange} name={name} />
      )} />

      <Input label="Nome completo *" placeholder="Nome do paciente"
        error={errors.name?.message}
        {...register('name', { required: 'Nome obrigatório' })} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Data de nascimento
          </label>
          <input type="date" max={new Date().toISOString().split('T')[0]}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
            style={{ background: 'var(--bg-hover)', border: '1.5px solid var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--brand-light)' }}
            {...register('birthDate')} />
        </div>
        <Select label="Gênero" {...register('gender')}>
          <option value="">Selecionar...</option>
          <option value="feminino">Feminino</option>
          <option value="masculino">Masculino</option>
          <option value="nao-binario">Não-binário</option>
          <option value="outro">Outro</option>
          <option value="prefiro-nao-dizer">Prefiro não dizer</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Controller name="cpf" control={control} render={({ field }) => (
          <MaskedInput label="CPF" mask={fmtCPF} placeholder="000.000.000-00"
            value={field.value} onChange={field.onChange} />
        )} />
        <Select label="Estado civil" {...register('maritalStatus')}>
          <option value="">Selecionar...</option>
          <option value="solteiro">Solteiro(a)</option>
          <option value="casado">Casado(a)</option>
          <option value="divorciado">Divorciado(a)</option>
          <option value="viuvo">Viúvo(a)</option>
          <option value="uniao-estavel">União estável</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Status" {...register('status')}>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </Select>
        <Input label="Profissão" placeholder="Ex: Professora"
          {...register('profession')} />
      </div>
    </div>
  )
}

function Step2({ register, control, errors }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Controller name="phone" control={control} render={({ field }) => (
          <MaskedInput label="Telefone" mask={fmtPhone} placeholder="(11) 3333-4444"
            value={field.value} onChange={field.onChange} />
        )} />
        <Controller name="whatsapp" control={control} render={({ field }) => (
          <MaskedInput label="WhatsApp" mask={fmtPhone} placeholder="(11) 99999-9999"
            value={field.value} onChange={field.onChange} />
        )} />
      </div>

      <Input label="E-mail" type="email" placeholder="paciente@email.com"
        {...register('email')} />

      <div className="rounded-2xl p-4 space-y-3 border border-token"
        style={{ background: 'var(--bg-hover)' }}>
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Contato de emergência</p>
        <Input label="Nome" placeholder="Nome do responsável"
          {...register('emergencyName')} />
        <div className="grid grid-cols-2 gap-3">
          <Controller name="emergencyPhone" control={control} render={({ field }) => (
            <MaskedInput label="Telefone" mask={fmtPhone} placeholder="(11) 99999-9999"
              value={field.value} onChange={field.onChange} />
          )} />
          <Input label="Parentesco" placeholder="Ex: Mãe, Cônjuge"
            {...register('emergencyRelation')} />
        </div>
      </div>
    </div>
  )
}

function Step3({ register, control, setValue }) {
  const [cepLoading, setCepLoading] = useState(false)

  const handleCEP = async (val) => {
    const formatted = fmtCEP(val)
    setValue('cep', formatted)
    if (val.replace(/\D/g, '').length === 8) {
      setCepLoading(true)
      const data = await fetchCEP(val)
      if (data) {
        setValue('street', data.logradouro || '')
        setValue('neighborhood', data.bairro || '')
        setValue('city', data.localidade || '')
        setValue('state', data.uf || '')
      }
      setCepLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label={cepLoading ? 'Buscando CEP...' : 'CEP'} placeholder="00000-000"
          {...register('cep')} onChange={e => handleCEP(e.target.value)} />
        <Input label="Número" placeholder="Ex: 114" {...register('addressNumber')} />
      </div>

      <Input label="Logradouro" placeholder="Rua, Avenida, Travessa..."
        {...register('street')} />

      <Input label="Complemento" placeholder="Apto, Bloco, Casa..."
        {...register('complement')} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Bairro" placeholder="Bairro" {...register('neighborhood')} />
        <Input label="Cidade" placeholder="Cidade" {...register('city')} />
      </div>

      <Select label="Estado" {...register('state')}>
        <option value="">Selecionar...</option>
        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
          <option key={uf} value={uf}>{uf}</option>
        ))}
      </Select>
    </div>
  )
}

function Step4({ register }) {
  return (
    <div className="space-y-4">
      <Select label="Como chegou até você?" {...register('referral')}>
        <option value="">Selecionar...</option>
        <option value="indicacao">Indicação de paciente</option>
        <option value="plano">Plano de saúde</option>
        <option value="redes-sociais">Redes sociais</option>
        <option value="google">Google / Internet</option>
        <option value="outro">Outro</option>
      </Select>

      <Select label="Tipo de atendimento" {...register('sessionType')}>
        <option value="">Selecionar...</option>
        <option value="particular">Particular</option>
        <option value="plano">Plano de saúde</option>
        <option value="convenio">Convênio</option>
        <option value="gratuito">Gratuito / Social</option>
      </Select>

      <Textarea label="Queixa principal / Motivo da consulta" rows={3}
        placeholder="Descreva brevemente o motivo que trouxe o paciente..."
        {...register('mainComplaint')} />

      <Textarea label="Histórico relevante" rows={3}
        placeholder="Diagnósticos anteriores, medicações, histórico familiar..."
        {...register('medicalHistory')} />

      <Textarea label="Observações gerais" rows={3}
        placeholder="Anotações adicionais sobre o paciente..."
        {...register('notes')} />
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────
export default function PatientForm({ initial, onSubmit, onCancel }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const TOTAL = 4

  const { register, handleSubmit, control, setValue, watch, trigger, formState: { errors } } = useForm({
    defaultValues: initial || {
      name: '', birthDate: '', gender: '', cpf: '', maritalStatus: '', profession: '',
      status: 'active', photo: null,
      phone: '', whatsapp: '', email: '',
      emergencyName: '', emergencyPhone: '', emergencyRelation: '',
      cep: '', street: '', addressNumber: '', complement: '',
      neighborhood: '', city: '', state: '',
      referral: '', sessionType: '', mainComplaint: '', medicalHistory: '', notes: '',
    },
  })

  const next = async () => {
    const fields = step === 0 ? ['name'] : []
    const ok = await trigger(fields)
    if (ok) setStep(s => Math.min(s + 1, TOTAL - 1))
  }

  const submit = async (data) => {
    setLoading(true)
    try { await onSubmit(data) } finally { setLoading(false) }
  }

  const stepProps = { register, control, errors, watch, setValue }

  return (
    <div>
      <StepIndicator current={step} total={TOTAL} />

      <div className="p-5">
        {step === 0 && <Step1 {...stepProps} />}
        {step === 1 && <Step2 {...stepProps} />}
        {step === 2 && <Step3 {...stepProps} />}
        {step === 3 && <Step4 {...stepProps} />}
      </div>

      <div className="flex items-center gap-3 px-5 pb-5 border-t border-token pt-4">
        <Button type="button" variant="outline" onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}
          className="flex-shrink-0">
          {step === 0 ? 'Cancelar' : <><ChevronLeft size={14} /> Voltar</>}
        </Button>

        <div className="flex-1 flex justify-center gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 20 : 6,
                background: i <= step ? 'var(--brand)' : 'var(--border)',
              }} />
          ))}
        </div>

        {step < TOTAL - 1 ? (
          <Button type="button" onClick={next} className="flex-shrink-0">
            Próximo <ChevronRight size={14} />
          </Button>
        ) : (
          <Button type="button" loading={loading} onClick={handleSubmit(submit)} className="flex-shrink-0">
            {initial?.id ? 'Salvar' : 'Cadastrar'}
          </Button>
        )}
      </div>
    </div>
  )
}
