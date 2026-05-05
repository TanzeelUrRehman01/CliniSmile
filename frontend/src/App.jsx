import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'

import Landing             from './pages/Landing'
import Login               from './pages/Login'
import RegisterPatient     from './pages/RegisterPatient'
import RegisterDoctor      from './pages/RegisterDoctor'
import FindDoctors         from './pages/FindDoctors'
import DoctorPublicProfile from './pages/DoctorPublicProfile'

import PatientDashboard from './pages/patient/Dashboard'
import BookAppointment  from './pages/patient/BookAppointment'
import MyAppointments   from './pages/patient/MyAppointments'
import MedicalHistory   from './pages/patient/MedicalHistory'
import PaymentUpload    from './pages/patient/PaymentUpload'

import DoctorDashboard    from './pages/doctor/Dashboard'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorAvailability from './pages/doctor/Availability'
import DoctorMedia        from './pages/doctor/Media'
import DoctorEarnings     from './pages/doctor/Earnings'
import GenerateReceipt    from './pages/doctor/GenerateReceipt'

import AdminDashboard        from './pages/admin/Dashboard'
import AdminDoctors          from './pages/admin/Doctors'
import { AdminPayments }     from './pages/admin/All'
import { AdminUsers }        from './pages/admin/All'
import { AdminFeatureFlags } from './pages/admin/All'

import ChatbotWidget from './components/common/ChatbotWidget'

import Profile from './pages/Profile'

function PrivateRoute({ children, roles }) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <ChatbotWidget />
      <Routes>
        {/* Public */}
        <Route path="/"                 element={<Landing />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/register/patient" element={<RegisterPatient />} />
        <Route path="/register/doctor"  element={<RegisterDoctor />} />
        <Route path="/doctors"          element={<FindDoctors />} />
        <Route path="/doctors/:id"      element={<DoctorPublicProfile />} />

        {/* Patient */}
        <Route path="/patient/dashboard"
          element={<PrivateRoute roles={['patient']}><PatientDashboard /></PrivateRoute>} />
        <Route path="/patient/book/:doctorId"
          element={<PrivateRoute roles={['patient']}><BookAppointment /></PrivateRoute>} />
        <Route path="/patient/appointments"
          element={<PrivateRoute roles={['patient']}><MyAppointments /></PrivateRoute>} />
        <Route path="/patient/history"
          element={<PrivateRoute roles={['patient']}><MedicalHistory /></PrivateRoute>} />
        <Route path="/patient/payment/:appointmentId"
          element={<PrivateRoute roles={['patient']}><PaymentUpload /></PrivateRoute>} />

        {/* Doctor */}
        <Route path="/doctor/dashboard"
          element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />
        <Route path="/doctor/appointments"
          element={<PrivateRoute roles={['doctor']}><DoctorAppointments /></PrivateRoute>} />
        <Route path="/doctor/availability"
          element={<PrivateRoute roles={['doctor']}><DoctorAvailability /></PrivateRoute>} />
        <Route path="/doctor/media"
          element={<PrivateRoute roles={['doctor']}><DoctorMedia /></PrivateRoute>} />
        <Route path="/doctor/earnings"
          element={<PrivateRoute roles={['doctor']}><DoctorEarnings /></PrivateRoute>} />
        <Route path="/doctor/receipt/:appointmentId"
          element={<PrivateRoute roles={['doctor']}><GenerateReceipt /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard"
          element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/doctors"
          element={<PrivateRoute roles={['admin']}><AdminDoctors /></PrivateRoute>} />
        <Route path="/admin/payments"
          element={<PrivateRoute roles={['admin']}><AdminPayments /></PrivateRoute>} />
        <Route path="/admin/users"
          element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/feature-flags"
          element={<PrivateRoute roles={['admin']}><AdminFeatureFlags /></PrivateRoute>} />

          {/* Profile */}
          <Route path="/profile" element={
          <PrivateRoute roles={['patient', 'doctor', 'admin']}>
          <Profile />
          </PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}