import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '@/services/api'
import toast from 'react-hot-toast'

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
    const [p, a, s] = await Promise.all([api.getPatients(), api.getAppointments(), api.getSettings()])
    setPatients(p)
    setAppointments(a)
    setSettings(s)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Check upcoming appointments for notifications
  useEffect(() => {
    const check = () => {
      const now = new Date()
      const upcoming = appointments.filter(a => {
        const diff = (new Date(a.date) - now) / 60000
        return diff > 0 && diff <= 30 && a.status !== 'cancelled'
      })
      setNotifications(upcoming.map(a => ({
        id: a.id,
        message: `Consulta em ${Math.round((new Date(a.date) - now) / 60000)} minutos`,
        type: 'upcoming',
      })))
    }
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [appointments])

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
      const a = await api.createAppointment(data)
      setAppointments(prev => [...prev, a])
      toast.success('Consulta agendada!')
      return a
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

  const dismissNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id))

  return (
    <DataContext.Provider value={{
      patients, appointments, settings, loading, notifications,
      addPatient, editPatient, removePatient,
      addAppointment, editAppointment, removeAppointment,
      saveSettings, dismissNotification, reload: load,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
