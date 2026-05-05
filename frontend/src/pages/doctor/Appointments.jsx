import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, DollarSign, Image, Settings, CheckCircle } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import { appointmentsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const sidebarLinks = [
  { to:'/doctor/dashboard',    label:'Dashboard',    icon:Calendar },
  { to:'/doctor/appointments', label:'Appointments', icon:Clock },
  { to:'/doctor/availability', label:'Availability', icon:Settings },
  { to:'/doctor/earnings',     label:'Earnings',     icon:DollarSign },
  { to:'/doctor/media',        label:'Clinic Media', icon:Image },
]

const statusColor = { pending:'badge-yellow', confirmed:'badge-green', completed:'badge-blue', cancelled:'badge-red' }

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setLoading(true)
    appointmentsAPI.list().then(({ data }) => setAppointments(data.data || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleComplete = async (id) => {
    try { await appointmentsAPI.complete(id); toast.success('Marked as completed'); load() }
    catch { toast.error('Failed') }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter)

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Appointments</h1>
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all','pending','confirmed','completed','cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter===f?'bg-primary text-white':'bg-white text-gray-600 border border-gray-200 hover:border-primary'}`}>
              {f}
            </button>
          ))}
        </div>
        {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
          <div className="space-y-4">
            {filtered.map((a) => (
              <div key={a.id} className="card hover:shadow-hover">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={statusColor[a.status]}>{a.status}</span>
                      <span className="text-xs text-gray-400">#{a.id.slice(0,8)}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{a.appointment_date}</p>
                    <p className="text-sm text-gray-500">{a.start_time?.slice(0,5)} – {a.end_time?.slice(0,5)}</p>
                    <p className="text-xs text-gray-400 mt-1">Patient: {a.patient_id?.slice(0,8)}</p>
                  </div>
                  {a.status === 'confirmed' && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleComplete(a.id)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                        <CheckCircle size={13} /> Complete
                      </button>
                      <Link to={`/doctor/receipt/${a.id}`} className="btn-outline text-xs px-3 py-1.5 text-center">Receipt</Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="card text-center py-12 text-gray-400">No appointments found.</div>}
          </div>
        )}
      </div>
    </Sidebar>
  )
}