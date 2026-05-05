import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

console.log('[API] Base URL:', API_BASE)

const api = axios.create({ baseURL: API_BASE, timeout: 30000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
  console.log('[API] Token:', token ? `${token.slice(0,10)}...` : 'MISSING')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => {
    console.log('[API] Response OK:', res.status)
    return res
  },
  (err) => {
    console.error('[API] Response Error:', err.response?.status || 'No response')
    console.error('[API] Error details:', err.message)
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const authAPI = {
  registerPatient: (data) => api.post('/auth/register/patient', data),
  registerDoctor:  (data) => api.post('/auth/register/doctor', data),
  login:           (data) => api.post('/auth/login', data),
}

export const doctorsAPI = {
  search:          (params) => api.get('/doctors', { params }),
  getProfile:      (id)     => api.get(`/doctors/${id}`),
  getSlots:        (id, params) => api.get(`/doctors/${id}/slots`, { params }),
  getMySlots:      (params) => api.get('/doctors/me/slots', { params }),
  uploadCertificate: (fd)   => api.post('/doctors/certificates', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadImage:     (fd)     => api.post('/doctors/media/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadVideo:     (fd)     => api.post('/doctors/media/video', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  createSlot:      (data)   => api.post('/doctors/availability', data),
  deleteSlot:      (id)     => api.delete(`/doctors/availability/${id}`),
}

export const appointmentsAPI = {
  book:     (data) => api.post('/appointments', data),
  list:     ()     => api.get('/appointments'),
  get:      (id)   => api.get(`/appointments/${id}`),
  cancel:   (id, reason) => api.patch(`/appointments/${id}/cancel`, null, { params: { reason } }),
  complete: (id)   => api.patch(`/appointments/${id}/complete`),
}

export const paymentsAPI = {
  uploadProof: (appointmentId, method, fd) =>
    api.post(`/payments/${appointmentId}/proof`, fd, {
      params: { payment_method: method },
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  history: () => api.get('/payments/history'),
  doctorEarnings: () => api.get('/payments/doctor/earnings'),
}

export const chatbotAPI = {
  startSession: () => api.post('/chatbot/session'),
  sendMessage:  (data) => api.post('/chatbot/message', data),
}

export const adminAPI = {
  dashboard:       () => api.get('/admin/dashboard'),
  pendingDoctors:  () => api.get('/admin/doctors/pending'),
  verifyDoctor:    (id, data) => api.patch(`/admin/doctors/${id}/verify`, data),
  pendingPayments: () => api.get('/admin/payments/pending'),
  verifyPayment:   (id, data) => api.patch(`/admin/payments/${id}/verify`, data),
  getFlags:        () => api.get('/admin/feature-flags'),
  toggleFlag:      (name, enabled) => api.patch(`/admin/feature-flags/${name}`, { is_enabled: enabled }),
  getUsers:        () => api.get('/admin/users'),
  toggleUser:      (id) => api.patch(`/admin/users/${id}/toggle`),
  deleteUser:      (id) => api.delete(`/admin/users/${id}`),   // ← ADD THIS
}