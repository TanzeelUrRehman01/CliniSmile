import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Search, FileText, ChevronRight } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import useAuthStore from '../../store/authStore'
import { appointmentsAPI } from '../../services/api'

const sidebarLinks = [
  { to: '/patient/dashboard',    label: 'Dashboard',        icon: Calendar },
  { to: '/patient/appointments', label: 'My Appointments',  icon: Clock },
  { to: '/patient/history',      label: 'Medical History',  icon: FileText },
  { to: '/doctors',              label: 'Find Doctors',     icon: Search },
]

const statusColor = { pending:'badge-yellow', confirmed:'badge-green', completed:'badge-blue', cancelled:'badge-red' }

export default function PatientDashboard() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appointmentsAPI.list().then(({ data }) => setAppointments(data.data || [])).finally(() => setLoading(false))
  }, [])

  const upcoming  = appointments.filter((a) => ['confirmed','pending'].includes(a.status))
  const completed = appointments.filter((a) => a.status === 'completed').length

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Good day, {user?.full_name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 mt-1">Here's your dental health overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { label:'Upcoming Appointments', value:upcoming.length,    icon:Calendar, color:'bg-blue-50 text-blue-600' },
            { label:'Completed Visits',       value:completed,          icon:Clock,    color:'bg-green-50 text-green-600' },
            { label:'Total Bookings',         value:appointments.length,icon:FileText, color:'bg-purple-50 text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}><s.icon size={22} /></div>
              <div><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="text-sm text-gray-500">{s.label}</p></div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            { to:'/doctors',              icon:Search,   title:'Find a Doctor',      desc:'Search verified dentists near you',     color:'bg-primary/10 text-primary' },
            { to:'/patient/appointments', icon:Calendar, title:'My Appointments',    desc:'View and manage your bookings',         color:'bg-secondary/10 text-secondary' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="card hover:shadow-hover flex items-center gap-4 group">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.color}`}><item.icon size={20} /></div>
              <div className="flex-1"><p className="font-semibold text-gray-900">{item.title}</p><p className="text-sm text-gray-500">{item.desc}</p></div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Recent Appointments</h2>
            <Link to="/patient/appointments" className="text-sm text-primary font-medium hover:underline">View all</Link>
          </div>
          {loading ? <p className="text-gray-400 text-sm py-8 text-center">Loading...</p> :
           appointments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-gray-500">No appointments yet.</p>
              <Link to="/doctors" className="btn-primary mt-4 inline-block text-sm">Book Your First Appointment</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0,5).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Appointment #{a.id.slice(0,8)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.appointment_date} at {a.start_time?.slice(0,5)}</p>
                  </div>
                  <span className={statusColor[a.status] || 'badge-blue'}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  )
}