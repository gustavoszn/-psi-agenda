import { supabase } from './supabase'

const uid = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user.id
}

const handle = ({ data, error }) => {
  if (error) throw new Error(error.message)
  return data
}

// --- Mappers ---
const patientToDB = (d) => ({
  name:             d.name,
  email:            d.email            || null,
  phone:            d.phone            || null,
  whatsapp:         d.whatsapp         || null,
  cpf:              d.cpf              || null,
  birth_date:       d.birthDate        || null,
  address:          d.street ? `${d.street}${d.addressNumber ? ', '+d.addressNumber : ''}${d.complement ? ' '+d.complement : ''}, ${d.neighborhood || ''}, ${d.city || ''} - ${d.state || ''}`.trim() : (d.address || null),
  number:           d.addressNumber    || d.number || null,
  cep:              d.cep              || null,
  notes:            d.notes            || null,
  status:           d.status           || 'active',
  photo:            d.photo            || null,
})

const patientFromDB = (d) => d ? ({
  id:             d.id,
  name:           d.name,
  email:          d.email,
  phone:          d.phone,
  cpf:            d.cpf,
  cep:            d.cep,
  street:         d.address   || '',
  addressNumber:  d.number    || '',
  complement:     '',
  neighborhood:   '',
  city:           '',
  state:          '',
  notes:          d.notes,
  status:         d.status,
  photo:          d.photo,
  createdAt:      d.created_at,
}) : null

const apptToDB = (d) => ({
  patient_id:   d.patientId,
  date:         d.date,
  duration:     d.duration     || 50,
  modality:     d.modality     || 'presencial',
  meeting_link: d.meetingLink  || null,
  status:       d.status       || 'scheduled',
  notes:        d.notes        || null,
})

const apptFromDB = (d) => d ? ({
  id:          d.id,
  patientId:   d.patient_id,
  date:        d.date,
  duration:    d.duration,
  modality:    d.modality,
  meetingLink: d.meeting_link,
  status:      d.status,
  notes:       d.notes,
  createdAt:   d.created_at,
}) : null

// --- Patients ---
export const getPatients = async () => {
  const rows = handle(await supabase.from('patients').select('*').order('name'))
  return rows.map(patientFromDB)
}

export const getPatient = async (id) => {
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).single()
  if (error) return null
  return patientFromDB(data)
}

export const createPatient = async (data) => {
  const user_id = await uid()
  const row = handle(await supabase.from('patients').insert({ ...patientToDB(data), user_id }).select().single())
  return patientFromDB(row)
}

export const updatePatient = async (id, data) => {
  const row = handle(await supabase.from('patients').update(patientToDB(data)).eq('id', id).select().single())
  return patientFromDB(row)
}

export const deletePatient = async (id) =>
  handle(await supabase.from('patients').delete().eq('id', id))

// --- Appointments ---
export const getAppointments = async () => {
  const rows = handle(await supabase.from('appointments').select('*').order('date'))
  return rows.map(apptFromDB)
}

export const createAppointment = async (data) => {
  const user_id = await uid()
  const row = handle(await supabase.from('appointments').insert({ ...apptToDB(data), user_id }).select().single())
  return apptFromDB(row)
}

export const updateAppointment = async (id, data) => {
  const row = handle(await supabase.from('appointments').update(apptToDB(data)).eq('id', id).select().single())
  return apptFromDB(row)
}

export const deleteAppointment = async (id) =>
  handle(await supabase.from('appointments').delete().eq('id', id))

// --- Settings ---
export const getSettings = async () => {
  const user_id = await uid()
  const { data } = await supabase.from('settings').select('data').eq('user_id', user_id).single()
  return data?.data ?? {
    workDays: [1,2,3,4,5],
    startHour: 7, endHour: 22,
    lunchStart: 12, lunchEnd: 13,
    intervalBetween: 10, defaultDuration: 50,
    blockedDates: [],
  }
}

export const updateSettings = async (payload) => {
  const user_id = await uid()
  handle(await supabase.from('settings').upsert({ user_id, data: payload, updated_at: new Date().toISOString() }))
  return payload
}

// --- Auth ---
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error('Credenciais inválidas')
  return {
    id:    data.user.id,
    email: data.user.email,
    name:  data.user.user_metadata?.name  ?? 'Dra. Isabela Pedrozo Silva',
    crp:   data.user.user_metadata?.crp   ?? '',
    photo: data.user.user_metadata?.photo ?? null,
  }
}
