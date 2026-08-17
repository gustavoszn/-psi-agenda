import { mockAppointments, mockPatients, mockSettings, mockUser } from './mockData'

const KEYS = { patients: 'psi_patients', appointments: 'psi_appointments', settings: 'psi_settings', user: 'psi_user', session: 'psi_session' }
const clone = value => JSON.parse(JSON.stringify(value))
const delay = value => new Promise(resolve => setTimeout(() => resolve(clone(value)), 100))
const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? clone(fallback) }
  catch { localStorage.removeItem(key); return clone(fallback) }
}
const write = (key, value) => { localStorage.setItem(key, JSON.stringify(value)); return value }
const uid = prefix => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
const seed = () => {
  if (!localStorage.getItem(KEYS.patients)) write(KEYS.patients, mockPatients)
  if (!localStorage.getItem(KEYS.appointments)) write(KEYS.appointments, mockAppointments)
  if (!localStorage.getItem(KEYS.settings)) write(KEYS.settings, mockSettings)
}
seed()

export const getPatients = () => delay(read(KEYS.patients, mockPatients))
export const getPatient = async id => (await getPatients()).find(item => item.id === id) ?? null
export const createPatient = async data => {
  const item = { ...data, id: uid('patient'), createdAt: new Date().toISOString() }
  write(KEYS.patients, [...read(KEYS.patients, mockPatients), item]); return delay(item)
}
export const updatePatient = async (id, data) => {
  const rows = read(KEYS.patients, mockPatients)
  const item = { ...rows.find(row => row.id === id), ...data, id, updatedAt: new Date().toISOString() }
  write(KEYS.patients, rows.map(row => row.id === id ? item : row)); return delay(item)
}
export const deletePatient = async id => {
  write(KEYS.patients, read(KEYS.patients, mockPatients).filter(row => row.id !== id))
  write(KEYS.appointments, read(KEYS.appointments, mockAppointments).filter(row => row.patientId !== id)); return delay(true)
}

export const getAppointments = () => delay(read(KEYS.appointments, mockAppointments))
export const createAppointment = async data => {
  const item = { ...data, id: uid('appointment'), createdAt: new Date().toISOString(), history: [] }
  write(KEYS.appointments, [...read(KEYS.appointments, mockAppointments), item]); return delay(item)
}
export const updateAppointment = async (id, data) => {
  const rows = read(KEYS.appointments, mockAppointments); const old = rows.find(row => row.id === id)
  const item = { ...old, ...data, id, updatedAt: new Date().toISOString(), history: [...(old?.history || []), { at: new Date().toISOString(), action: 'Consulta atualizada' }] }
  write(KEYS.appointments, rows.map(row => row.id === id ? item : row)); return delay(item)
}
export const deleteAppointment = async id => { write(KEYS.appointments, read(KEYS.appointments, mockAppointments).filter(row => row.id !== id)); return delay(true) }
export const getSettings = () => delay(read(KEYS.settings, mockSettings))
export const updateSettings = async data => delay(write(KEYS.settings, data))

export const getStoredSession = () => {
  try {
    const session = read(KEYS.session, null) || JSON.parse(sessionStorage.getItem(KEYS.session))
    return session && !session.role ? { ...session, role: 'professional' } : session
  } catch { return null }
}
export const login = async (email, password, remember = true) => {
  if (!/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 4) throw new Error('Informe um e-mail válido e uma senha com ao menos 4 caracteres.')
  const user = { ...read(KEYS.user, mockUser), email, role: 'professional' }; write(KEYS.user, user)
  if (remember) write(KEYS.session, user); else sessionStorage.setItem(KEYS.session, JSON.stringify(user))
  return delay(user)
}
export const loginPatient = async (email, password, remember = true) => {
  if (!/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 4) throw new Error('Informe um e-mail válido e uma senha com ao menos 4 caracteres.')
  const patient = read(KEYS.patients, mockPatients).find(item => item.email?.toLowerCase() === email.toLowerCase() && item.status === 'active')
  if (!patient) throw new Error('Não encontramos um paciente ativo com este e-mail.')
  const user = { id: patient.id, patientId: patient.id, name: patient.name, email: patient.email, photo: patient.photo, role: 'patient' }
  if (remember) write(KEYS.session, user); else sessionStorage.setItem(KEYS.session, JSON.stringify(user))
  return delay(user)
}
export const logout = async () => { localStorage.removeItem(KEYS.session); sessionStorage.removeItem(KEYS.session); return delay(true) }
export const updateUser = async data => {
  const user = { ...read(KEYS.user, mockUser), ...data }; write(KEYS.user, user)
  if (localStorage.getItem(KEYS.session)) write(KEYS.session, user)
  if (sessionStorage.getItem(KEYS.session)) sessionStorage.setItem(KEYS.session, JSON.stringify(user))
  return delay(user)
}
export const restoreDemoData = async () => { write(KEYS.patients, mockPatients); write(KEYS.appointments, mockAppointments); write(KEYS.settings, mockSettings); return delay(true) }
export const clearLocalData = async () => { write(KEYS.patients, []); write(KEYS.appointments, []); write(KEYS.settings, mockSettings); return delay(true) }
