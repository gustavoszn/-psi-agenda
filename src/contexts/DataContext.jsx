import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '@/services/api'
import toast from 'react-hot-toast'
import { addMonths, addWeeks } from 'date-fns'
import { hasConflict } from '@/utils/helpers'

const DataContext = createContext({
  patients: [], appointments: [], settings: null, loading: false, notifications: [],
  addPatient: async () => {}, editPatient: async () => {}, removePatient: async () => {},
  addAppointment: async () => {}, editAppointment: async () => {}, removeAppointment: async () => {},
  saveSettings: async () => {}, dismissNotification: () => {}, reload: async () => {},
})

export function DataProvider({ children }) {
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, a, s] = await Promise.all([api.getPatients(), api.getAppointments(), api.getSettings()])
      setPatients(p); setAppointments(a); setSettings(s)
    } catch (error) { toast.error(error.message || 'Não foi possível carregar os dados.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const [dismissedIds, setDismissedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('psi_dismissed_notifs') || '[]') } catch { return [] }
  })

  useEffect(() => {
    const THRESHOLDS = [
      { key: '24h',  minutes: 24 * 60, label: 'amanhã',        urgency: 'low'    },
      { key: '1h',   minutes: 60,      label: 'em 1 hora',     urgency: 'medium' },
      { key: '15min',minutes: 15,      label: 'em 15 minutos', urgency: 'high'   },
    ]

    const check = () => {
      const now = new Date()
      const notifs = []

      appointments.forEach(a => {
        if (['cancelled', 'missed', 'done'].includes(a.status)) return
        const diff = (new Date(a.date) - now) / 60000
        if (diff <= 0 || diff > 24 * 60) return

        const threshold = [...THRESHOLDS].reverse().find(t => diff <= t.minutes)
        if (!threshold) return

        const notifId = `${a.id}_${threshold.key}`
        if (dismissedIds.includes(notifId)) return

        notifs.push({
          id:        notifId,
          apptId:    a.id,
          patientId: a.patientId,
          date:      a.date,
          label:     threshold.label,
          urgency:   threshold.urgency,
        })
      })

      setNotifications(notifs)
    }

    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [appointments, dismissedIds])

  const addPatient = async (data) => {
    try {
      const p = await api.createPatient(data)
      setPatients(prev => [...prev, p])
      toast.success('Paciente cadastrado!')
      return p
    } catch (e) { toast.error(e.message); throw e }
  }

  const editPatient = async (id, data) => {
    try {
      const p = await api.updatePatient(id, data)
      setPatients(prev => prev.map(x => x.id === id ? p : x))
      toast.success('Paciente atualizado!')
      return p
    } catch (e) { toast.error(e.message); throw e }
  }

  const removePatient = async (id) => {
    try {
      await api.deletePatient(id)
      setPatients(prev => prev.filter(x => x.id !== id))
      setAppointments(prev => prev.filter(a => a.patientId !== id))
      toast.success('Paciente removido.')
    } catch (e) { toast.error(e.message); throw e }
  }

  const addAppointment = async (data) => {
    try {
      const count = data.recurrence === 'once' ? 1 : Number(data.repetitions || 1)
      const dates = Array.from({ length: count }, (_, index) => {
        if (data.recurrence === 'monthly') return addMonths(new Date(data.date), index)
        if (data.recurrence === 'biweekly') return addWeeks(new Date(data.date), index * 2)
        if (data.recurrence === 'weekly') return addWeeks(new Date(data.date), index)
        return new Date(data.date)
      })
      const conflictDate = dates.find(date => hasConflict(appointments, date, Number(data.duration)))
      if (conflictDate) throw new Error(`Conflito encontrado em ${conflictDate.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}. Nenhuma consulta foi criada.`)
      const payload = { ...data }; delete payload.recurrence; delete payload.repetitions
      const created = []
      for (const date of dates) created.push(await api.createAppointment({ ...payload, date: date.toISOString() }))
      setAppointments(prev => [...prev, ...created])
      toast.success(created.length > 1 ? `${created.length} consultas agendadas!` : 'Consulta agendada!')
      return created[0]
    } catch (e) { toast.error(e.message); throw e }
  }

  const editAppointment = async (id, data) => {
    try {
      const a = await api.updateAppointment(id, data)
      setAppointments(prev => prev.map(x => x.id === id ? a : x))
      toast.success('Consulta atualizada!')
      return a
    } catch (e) { toast.error(e.message); throw e }
  }

  const removeAppointment = async (id) => {
    try {
      await api.deleteAppointment(id)
      setAppointments(prev => prev.filter(x => x.id !== id))
      toast.success('Consulta removida.')
    } catch (e) { toast.error(e.message); throw e }
  }

  const saveSettings = async (data) => {
    try {
      const s = await api.updateSettings(data)
      setSettings(s)
      toast.success('Configurações salvas!')
      return s
    } catch (e) { toast.error(e.message); throw e }
  }

  const dismissNotification = (id) => {
    setDismissedIds(prev => {
      const next = [...prev, id]
      localStorage.setItem('psi_dismissed_notifs', JSON.stringify(next))
      return next
    })
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const restoreDemoData = async () => { await api.restoreDemoData(); await load(); toast.success('Dados demonstrativos restaurados!') }
  const clearLocalData = async () => { await api.clearLocalData(); await load(); toast.success('Dados locais removidos.') }

  return (
    <DataContext.Provider value={{
      patients, appointments, settings, loading, notifications,
      addPatient, editPatient, removePatient,
      addAppointment, editAppointment, removeAppointment,
      saveSettings, dismissNotification, restoreDemoData, clearLocalData, reload: load,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
