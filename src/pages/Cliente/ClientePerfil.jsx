import { useEffect, useState } from 'react'
import { Save, ShieldCheck, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/contexts/DataContext'
import Input, { Textarea } from '@/components/UI/Input'
import Button from '@/components/UI/Button'
import Avatar from '@/components/UI/Avatar'

export default function ClientePerfil() {
  const { user } = useAuth(); const { patients, editPatient } = useData(); const patient = patients.find(item => item.id === user.patientId)
  const [loading, setLoading] = useState(false); const { register, handleSubmit, reset, formState: { errors } } = useForm()
  useEffect(() => { if (patient) reset(patient) }, [patient, reset])
  const submit = async data => { setLoading(true); try { await editPatient(patient.id, { ...patient, ...data }) } finally { setLoading(false) } }
  if (!patient) return <main className="p-8 text-center text-muted">Carregando perfil...</main>
  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8"><div className="mb-6"><h1 className="text-2xl font-bold text-primary">Meu perfil</h1><p className="text-sm text-muted mt-1">Mantenha seus dados de contato atualizados.</p></div><form onSubmit={handleSubmit(submit)} className="space-y-4"><section className="rounded-2xl border border-token bg-surface p-5"><div className="flex items-center gap-4"><Avatar name={patient.name} photo={patient.photo} size="xl" /><div><h2 className="font-bold text-primary">{patient.name}</h2><p className="text-xs text-muted mt-1">Paciente desde {new Date(patient.createdAt).toLocaleDateString('pt-BR')}</p></div></div></section><section className="rounded-2xl border border-token bg-surface p-5 space-y-4"><div className="flex items-center gap-2"><UserRound size={16} style={{ color: 'var(--brand)' }} /><h2 className="text-sm font-bold text-primary">Dados pessoais e contato</h2></div><Input label="Nome completo" value={patient.name} disabled /><div className="grid sm:grid-cols-2 gap-4"><Input label="Telefone" {...register('phone')} /><Input label="E-mail" type="email" error={errors.email?.message} {...register('email', { required: 'Informe o e-mail', pattern: { value: /^\S+@\S+\.\S+$/, message: 'E-mail inválido' } })} /><Input label="Data de nascimento" type="date" {...register('birthDate')} /><Input label="WhatsApp" {...register('whatsapp')} /></div><Textarea label="Observação administrativa" rows={3} {...register('notes')} /></section><section className="rounded-2xl border border-token bg-surface p-5 flex gap-3"><ShieldCheck size={20} className="flex-shrink-0" style={{ color: 'var(--brand)' }} /><p className="text-xs text-muted">Alterações ficam imediatamente disponíveis para a doutora. Informações clínicas não são armazenadas neste formulário.</p></section><Button type="submit" loading={loading} className="w-full py-3"><Save size={16} /> Salvar alterações</Button></form></main>
  )
}
