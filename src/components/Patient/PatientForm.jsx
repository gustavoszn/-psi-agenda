import { useForm, Controller } from 'react-hook-form'
import { useState, useRef, useEffect } from 'react'
import Input, { Select, Textarea } from '@/components/UI/Input'
import Button from '@/components/UI/Button'

// --- Formatters ---
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
  if (d.length <= 5) return d
  return `${d.slice(0,5)}-${d.slice(5)}`
}

// --- CEP lookup ---
const fetchCEP = async (cep) => {
  const raw = cep.replace(/\D/g, '')
  if (raw.length !== 8) return null
  try {
    const r = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
    const d = await r.json()
    if (d.erro) return null
    return d
  } catch { return null }
}

// --- Address autocomplete ---
const searchAddress = async (q) => {
  if (q.length < 4) return []
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', Brasil')}&format=json&addressdetails=1&limit=6&countrycodes=br`,
      { headers: { 'Accept-Language': 'pt-BR' } }
    )
    const data = await r.json()
    return data.map(d => d.display_name)
  } catch { return [] }
}

// --- Date picker dd/mm/aaaa ---
const days   = Array.from({ length: 31 }, (_, i) => i + 1)
const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const currentYear = new Date().getFullYear()
const years  = Array.from({ length: 100 }, (_, i) => currentYear - i)

const selectStyle = (error) => ({
  background: 'var(--bg-hover)',
  border: `1px solid ${error ? 'var(--accent)' : 'var(--border)'}`,
  color: 'var(--text-primary)',
  borderRadius: '0.75rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  width: '100%',
  outline: 'none',
  appearance: 'auto',
})

function DatePicker({ value, onChange, error }) {
  const parts = value ? value.split('-') : ['', '', '']
  const [year, setYear]   = useState(parts[0] || '')
  const [month, setMonth] = useState(parts[1] ? String(parseInt(parts[1])) : '')
  const [day, setDay]     = useState(parts[2] ? String(parseInt(parts[2])) : '')

  const emit = (d, m, y) => {
    if (d && m && y) onChange(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`)
    else onChange('')
  }

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-secondary">Data de nascimento</label>
      <div className="grid grid-cols-3 gap-2">
        <select style={selectStyle(error)} value={day}
          onChange={e => { setDay(e.target.value); emit(e.target.value, month, year) }}>
          <option value="">Dia</option>
          {days.map(d => <option key={d} value={d}>{String(d).padStart(2,'0')}</option>)}
        </select>
        <select style={selectStyle(error)} value={month}
          onChange={e => { setMonth(e.target.value); emit(day, e.target.value, year) }}>
          <option value="">Mês</option>
          {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select style={selectStyle(error)} value={year}
          onChange={e => { setYear(e.target.value); emit(day, month, e.target.value) }}>
          <option value="">Ano</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--accent-text)' }}>{error}</p>}
    </div>
  )
}

function MaskedInput({ label, error, mask, value, onChange, ...props }) {
  return (
    <Input label={label} error={error} value={value}
      onChange={e => onChange(mask(e.target.value))} {...props} />
  )
}

function AddressInput({ value, onChange, error }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const timer = useRef(null)
  const wrapRef = useRef(null)

  const handleChange = (v) => {
    onChange(v)
    clearTimeout(timer.current)
    if (v.length >= 4) {
      timer.current = setTimeout(async () => {
        const results = await searchAddress(v)
        setSuggestions(results)
        setOpen(results.length > 0)
      }, 500)
    } else {
      setSuggestions([])
      setOpen(false)
    }
  }

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={wrapRef}>
      <Input label="Endereço" error={error} value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder="Rua, bairro..." autoComplete="off" />
      {open && (
        <ul className="absolute z-50 w-full mt-1 rounded-xl shadow-lg overflow-hidden text-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          {suggestions.map((s, i) => (
            <li key={i}
              className="px-3 py-2 cursor-pointer hover:opacity-80 transition-opacity text-primary truncate"
              style={{ borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none' }}
              onMouseDown={() => { onChange(s); setOpen(false) }}>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function PatientForm({ initial, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    defaultValues: initial || {
      name: '', birthDate: '', phone: '', whatsapp: '',
      email: '', cpf: '', cep: '', address: '', number: '', notes: '', status: 'active',
    },
  })

  const handleCEP = async (val) => {
    const formatted = fmtCEP(val)
    setValue('cep', formatted)
    if (val.replace(/\D/g, '').length === 8) {
      setCepLoading(true)
      const data = await fetchCEP(val)
      if (data) setValue('address', `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`)
      setCepLoading(false)
    }
  }

  const submit = async (data) => {
    setLoading(true)
    try { await onSubmit(data) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="p-6 space-y-4">
      <Input label="Nome completo" error={errors.name?.message}
        {...register('name', { required: 'Nome obrigatório' })} />

      <div className="grid grid-cols-2 gap-4">
        <Controller name="birthDate" control={control} render={({ field }) => (
          <DatePicker value={field.value} onChange={field.onChange} error={errors.birthDate?.message} />
        )} />
        <Select label="Status" {...register('status')}>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </Select>
      </div>

      <Controller name="cpf" control={control} render={({ field }) => (
        <MaskedInput label="CPF" mask={fmtCPF} placeholder="000.000.000-00"
          value={field.value} onChange={field.onChange} error={errors.cpf?.message} />
      )} />

      <div className="grid grid-cols-2 gap-4">
        <Controller name="phone" control={control} render={({ field }) => (
          <MaskedInput label="Telefone" mask={fmtPhone} placeholder="(11) 99999-9999"
            value={field.value} onChange={field.onChange} />
        )} />
        <Controller name="whatsapp" control={control} render={({ field }) => (
          <MaskedInput label="WhatsApp" mask={fmtPhone} placeholder="(11) 99999-9999"
            value={field.value} onChange={field.onChange} />
        )} />
      </div>

      <Input label="E-mail" type="email" placeholder="exemplo@email.com" {...register('email')} />

      <div className="grid grid-cols-3 gap-3">
        <Input label={cepLoading ? 'Buscando...' : 'CEP'} placeholder="00000-000"
          {...register('cep')} onChange={e => handleCEP(e.target.value)} />
        <div className="col-span-2">
          <Controller name="address" control={control} render={({ field }) => (
            <AddressInput value={field.value} onChange={field.onChange} error={errors.address?.message} />
          )} />
        </div>
      </div>

      <Input label="Número" placeholder="Ex: 114" {...register('number')} />

      <Textarea label="Observações" rows={3} {...register('notes')} />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button type="submit" loading={loading} className="flex-1">{initial?.id ? 'Salvar' : 'Cadastrar'}</Button>
      </div>
    </form>
  )
}
