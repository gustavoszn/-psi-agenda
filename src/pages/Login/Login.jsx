import { useEffect, useState } from 'react'
import { Eye, EyeOff, Leaf, Moon, Sun } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Button from '@/components/UI/Button'

export default function Login() {
  const { login, user } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { remember: true } })

  useEffect(() => { if (user?.role === 'professional') navigate('/', { replace: true }) }, [user, navigate])
  const submit = async ({ email, password, remember }) => {
    setLoading(true)
    try { await login(email, password, remember); navigate('/', { replace: true }) }
    catch (error) { toast.error(error.message) }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-base">
      <section className="hidden lg:flex flex-col justify-between p-12 text-white" style={{ background: 'linear-gradient(145deg, #315640, #4e7d5e 60%, #72947b)' }}>
        <div className="flex items-center gap-3"><span className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center"><Leaf size={21} /></span><strong className="text-xl">PsiAgenda</strong></div>
        <div className="max-w-lg"><p className="text-4xl font-semibold leading-tight">Sua rotina clínica, organizada com leveza.</p><p className="mt-4 text-white/75">Agenda, pacientes e indicadores essenciais em um só lugar.</p></div>
        <p className="text-sm text-white/60">Feito para o dia a dia de profissionais da psicologia.</p>
      </section>
      <section className="relative flex items-center justify-center p-5 sm:p-8">
        <button onClick={toggle} aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'} className="absolute right-5 top-5 p-3 rounded-xl bg-hover text-secondary">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8"><span className="h-11 w-11 rounded-2xl flex items-center justify-center text-white" style={{ background: 'var(--brand)' }}><Leaf size={20} /></span><strong className="text-xl text-primary">PsiAgenda</strong></div>
          <p className="text-sm font-medium" style={{ color: 'var(--brand-text)' }}>Bem-vinda de volta</p>
          <h1 className="text-3xl font-bold text-primary mt-1">Acesse sua agenda</h1>
          <p className="text-sm text-muted mt-2 mb-7">Entre para continuar como Dra. Isabela.</p>
          <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
            <label className="block space-y-1.5"><span className="text-sm font-medium text-secondary">E-mail</span><input type="email" autoComplete="email" aria-invalid={!!errors.email} className="w-full px-4 py-3 rounded-xl bg-surface border border-token text-primary focus-ring" placeholder="isabela@psicologa.com" {...register('email', { required: 'Informe seu e-mail', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Informe um e-mail válido' } })} />{errors.email && <span className="text-xs block" style={{ color: 'var(--accent-text)' }}>{errors.email.message}</span>}</label>
            <label className="block space-y-1.5"><span className="text-sm font-medium text-secondary">Senha</span><span className="relative block"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" aria-invalid={!!errors.password} className="w-full px-4 py-3 pr-12 rounded-xl bg-surface border border-token text-primary focus-ring" placeholder="Sua senha" {...register('password', { required: 'Informe sua senha', minLength: { value: 4, message: 'Use ao menos 4 caracteres' } })} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>{errors.password && <span className="text-xs block" style={{ color: 'var(--accent-text)' }}>{errors.password.message}</span>}</label>
            <div className="flex items-center justify-between gap-3 text-xs"><label className="flex items-center gap-2 text-secondary cursor-pointer"><input type="checkbox" {...register('remember')} /> Lembrar acesso</label><button type="button" onClick={() => toast.success('Instruções de recuperação simuladas foram enviadas.')} style={{ color: 'var(--brand-text)' }}>Esqueci minha senha</button></div>
            <Button type="submit" loading={loading} className="w-full justify-center py-3">Entrar</Button>
          </form>
          <p className="text-xs text-center text-muted mt-5">Demonstração: use qualquer e-mail válido e senha com 4 caracteres.</p>
          <div className="mt-5 pt-5 border-t border-token text-center"><p className="text-xs text-muted mb-2">Você é paciente?</p><Link to="/cliente/login" className="text-sm font-semibold" style={{ color: 'var(--brand-text)' }}>Acessar Portal do Paciente</Link></div>
        </div>
      </section>
    </main>
  )
}
