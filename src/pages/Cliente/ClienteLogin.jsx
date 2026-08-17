import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, EyeOff, HeartHandshake, LockKeyhole } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/UI/Button'

export default function ClienteLogin() {
  const { user, loginPatient } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { remember: true } })
  useEffect(() => { if (user?.role === 'patient') navigate('/cliente', { replace: true }) }, [user, navigate])

  const submit = async data => {
    setLoading(true)
    try { await loginPatient(data.email, data.password, data.remember); navigate('/cliente', { replace: true }) }
    catch (error) { toast.error(error.message) }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-5 bg-base relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72" style={{ background: 'linear-gradient(180deg, var(--brand-light), transparent)' }} />
      <div className="relative w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs text-muted mb-6 hover:text-secondary"><ArrowLeft size={14} /> Área da profissional</Link>
        <section className="bg-surface border border-token rounded-3xl p-6 sm:p-8 shadow-panel">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white mb-5" style={{ background: 'var(--brand)' }}><HeartHandshake size={22} /></div>
          <h1 className="text-2xl font-bold text-primary">Portal do paciente</h1>
          <p className="text-sm text-muted mt-2 mb-6">Consulte seus horários e acompanhe seus atendimentos com segurança.</p>
          <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
            <label className="block space-y-1.5"><span className="text-sm font-medium text-secondary">E-mail cadastrado</span><input type="email" autoComplete="email" className="w-full px-4 py-3 rounded-xl bg-hover border border-token text-primary focus-ring" placeholder="seu@email.com" {...register('email', { required: 'Informe seu e-mail', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Informe um e-mail válido' } })} />{errors.email && <span className="text-xs" style={{ color: 'var(--accent-text)' }}>{errors.email.message}</span>}</label>
            <label className="block space-y-1.5"><span className="text-sm font-medium text-secondary">Senha</span><span className="relative block"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="w-full px-4 py-3 pr-12 rounded-xl bg-hover border border-token text-primary focus-ring" placeholder="Sua senha" {...register('password', { required: 'Informe sua senha', minLength: { value: 4, message: 'Use ao menos 4 caracteres' } })} /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>{errors.password && <span className="text-xs" style={{ color: 'var(--accent-text)' }}>{errors.password.message}</span>}</label>
            <div className="flex justify-between items-center text-xs"><label className="flex items-center gap-2 text-secondary"><input type="checkbox" {...register('remember')} /> Lembrar acesso</label><button type="button" onClick={() => toast.success('Recuperação de acesso simulada enviada.')} style={{ color: 'var(--brand-text)' }}>Recuperar acesso</button></div>
            <Button type="submit" loading={loading} className="w-full py-3"><LockKeyhole size={16} /> Entrar no portal</Button>
          </form>
          <div className="mt-5 p-3 rounded-xl bg-hover"><p className="text-xs text-muted">Acesso demonstrativo: use o e-mail de um paciente ativo, por exemplo <strong className="text-secondary">ana.clara@email.com</strong>, e qualquer senha com 4 caracteres.</p></div>
        </section>
      </div>
    </main>
  )
}
