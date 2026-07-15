import { motion } from 'framer-motion'
import { Leaf, Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/UI/Button'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm()

  const submit = async ({ email, password }) => {
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: dark ? 'linear-gradient(135deg, #0f1410 0%, #141a14 50%, #1a2419 100%)' : 'linear-gradient(135deg, #f0ece6 0%, #f7f4f0 50%, #edf0ec 100%)' }}>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl items-center justify-center mb-4 shadow-md"
            style={{ background: 'var(--brand)' }}>
            <Leaf size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary">Dra. Isabela Pedrozo Silva</h1>
          <p className="text-sm text-muted mt-1">Psicologia · Agenda Profissional</p>
        </div>

        <div className="rounded-3xl p-7 border border-token bg-surface shadow-sm">
          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-secondary">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 transition-all"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', '--tw-ring-color': 'var(--brand-light)' }}
                {...register('email', { required: true })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-secondary">Senha</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 transition-all"
                  style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', '--tw-ring-color': 'var(--brand-light)' }}
                  {...register('password', { required: true })}
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center py-2.5 mt-1">
              Entrar
            </Button>
          </form>

        </div>

        <div className="flex justify-center items-center gap-3 mt-5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--brand)' }} />
          <button onClick={toggle} className="p-1 rounded-md transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
            {dark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--brand)', opacity: 0.4 }} />
        </div>
      </motion.div>
    </div>
  )
}
