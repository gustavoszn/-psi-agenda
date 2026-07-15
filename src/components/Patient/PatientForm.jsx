import { useForm, Controller } from 'react-hook-form'
import { useState, useRef } from 'react'
import { Camera } from 'lucide-react'
import Input, { Textarea } from '@/components/UI/Input'
import Button from '@/components/UI/Button'
import Avatar from '@/components/UI/Avatar'

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

const fetchCEP = async (cep) => {
  const raw = cep.replace(/\D/g, '')
  if (raw.length !== 8) return null
  try {
    const r = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
    const d = await r.json()
    return d.erro ? null : d
  } catch { return null }
}

function PhotoField({ field, name }) {
  const fileRef = useRef()
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <Avatar name={name || 'P'} photo={field.value} size="xl" />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center shadow-md transition-opacity hover:opacity-80"
          style={{ background: 'var(--brand)' }}>
          <Camera size={13} className="text-white" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = ev => field.onChange(ev.target.result)
            reader.readAsDataURL(file)
          }} />
      </div>
      <div>
        <p className="text-xs text-muted">Foto opcional</p>
        {field.value && (
          <button type="button" onClick={() => field.onChange(null)}
            className="text-xs mt-0.5 transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent-text)' }}>
            Remover
          </button>
        )}
      </div>
    </div>
  )
}

export default function PatientForm({ initial, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)

  const { register, handleSubmit, control, setValue, watch } = useForm({
    defaultValues: initial || {
      name: '', photo: null, cpf: '', phone: '', email: '',
      cep: '', street: '', addressNumber: '', complement: '',
      neighborhood: '', city: '', state: '',
      notes: '', status: 'active',
    },
  })

  const name = watch('name')

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

  const submit = async (data) => {
    setLoading(true)
    try { await onSubmit(data) } finally { setLoading(false) }
  }

  return (
    <div className="p-5 space-y-4">

      <Controller name="photo" control={control} render={({ field }) => (
        <PhotoField field={field} name={name} />
      )} />

      <Input label="Nome" placeholder="Nome completo" {...register('name')} />

      <div className="grid grid-cols-2 gap-3">
        <Controller name="cpf" control={control} render={({ field }) => (
          <Input label="CPF" placeholder="000.000.000-00"
            value={field.value} onChange={e => field.onChange(fmtCPF(e.target.value))} />
        )} />
        <Controller name="phone" control={control} render={({ field }) => (
          <Input label="Telefone" placeholder="(11) 99999-9999"
            value={field.value} onChange={e => field.onChange(fmtPhone(e.target.value))} />
        )} />
      </div>

      <Input label="E-mail" type="email" placeholder="paciente@email.com" {...register('email')} />

      {/* Endereço */}
      <div className="space-y-3 rounded-2xl border border-token p-4" style={{ background: 'var(--bg-hover)' }}>
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide">Endereço</p>

        <div className="grid grid-cols-2 gap-3">
          <Input label={cepLoading ? 'Buscando...' : 'CEP'} placeholder="00000-000"
            {...register('cep')} onChange={e => handleCEP(e.target.value)} />
          <Input label="Número" placeholder="Ex: 114" {...register('addressNumber')} />
        </div>

        <Input label="Logradouro" placeholder="Rua, Avenida..." {...register('street')} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Complemento" placeholder="Apto, Bloco..." {...register('complement')} />
          <Input label="Bairro" placeholder="Bairro" {...register('neighborhood')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Cidade" placeholder="Cidade" {...register('city')} />
          <Input label="Estado" placeholder="UF" {...register('state')}
            onChange={e => setValue('state', e.target.value.toUpperCase().slice(0,2))} />
        </div>
      </div>

      <Textarea label="Observações" rows={3} placeholder="Anotações sobre o paciente..."
        {...register('notes')} />

      <div className="flex gap-3 pt-2 border-t border-token">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="button" loading={loading} onClick={handleSubmit(submit)} className="flex-1 justify-center">
          {initial?.id ? 'Salvar' : 'Cadastrar'}
        </Button>
      </div>
    </div>
  )
}
