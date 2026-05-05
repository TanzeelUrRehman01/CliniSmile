import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, DollarSign, Image, Settings, BarChart2, ChevronRight } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import useAuthStore from '../../store/authStore'
import { appointmentsAPI } from '../../services/api'

const sidebarLinks = [
  { to:'/doctor/dashboard',    label:'Dashboard',      icon:Calendar },
  { to:'/doctor/appointments', label:'Appointments',   icon:Clock },
  { to:'/doctor/availability', label:'Availability',   icon:Settings },
  { to:'/doctor/earnings',     label:'Earnings',       icon:DollarSign },
  { to:'/doctor/media',        label:'Clinic Media',   icon:Image },
]

const statusColor = { pending:'badge-yellow', confirmed:'badge-green', completed:'badge-blue', cancelled:'badge-red' }

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appointmentsAPI.list().then(({ data }) => setAppointments(data.data || [])).finally(() => setLoading(false))
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]
  const todayApts = appointments.filter((a) => a.appointment_date === todayStr)
  const pending   = appointments.filter((a) => a.status === 'pending').length
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, Dr. {user?.full_name?.split(' ').slice(-1)[0]}! 👨‍⚕️</h1>
          <p className="text-gray-500 mt-1">Here's your practice overview</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label:"Today's Appointments", value:todayApts.length, icon:Calendar, color:'bg-blue-50 text-blue-600' },
            { label:'Pending Confirmations', value:pending,         icon:Clock,    color:'bg-yellow-50 text-yellow-600' },
            { label:'Confirmed',             value:confirmed,       icon:BarChart2,color:'bg-green-50 text-green-600' },
            { label:'Total Appointments',    value:appointments.length, icon:BarChart2, color:'bg-purple-50 text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="card flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.color}`}><s.icon size={20} /></div>
              <div><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            { to:'/doctor/availability', icon:Settings, title:'Set Availability', desc:'Add or remove time slots',    color:'bg-primary/10 text-primary' },
            { to:'/doctor/media',        icon:Image,    title:'Upload Clinic Media',desc:'Add photos and videos',     color:'bg-secondary/10 text-secondary' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="card hover:shadow-hover flex items-center gap-4 group">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.color}`}><item.icon size={20} /></div>
              <div className="flex-1"><p className="font-semibold text-gray-900">{item.title}</p><p className="text-sm text-gray-500">{item.desc}</p></div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Today's Appointments</h2>
          {loading ? <p className="text-gray-400 text-sm py-6 text-center">Loading...</p> :
           todayApts.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayApts.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{a.start_time?.slice(0,5)} – {a.end_time?.slice(0,5)}</p>
                    <p className="text-xs text-gray-500">Patient: {a.patient_id?.slice(0,8)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={statusColor[a.status]}>{a.status}</span>
                    {a.status === 'confirmed' && (
                      <Link to={`/doctor/receipt/${a.id}`} className="btn-primary text-xs px-3 py-1.5">Receipt</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  )
}