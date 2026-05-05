import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, FileText, Search, X } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import { appointmentsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const sidebarLinks = [
  { to:'/patient/dashboard',    label:'Dashboard',       icon:Calendar },
  { to:'/patient/appointments', label:'My Appointments', icon:Clock },
  { to:'/patient/history',      label:'Medical History', icon:FileText },
  { to:'/doctors',              label:'Find Doctors',    icon:Search },
]

const statusStyles = { pending:'badge-yellow', confirmed:'badge-green', completed:'badge-blue', cancelled:'badge-red', no_show:'badge-red' }

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setLoading(true)
    appointmentsAPI.list().then(({ data }) => setAppointments(data.data || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try { await appointmentsAPI.cancel(id, 'Cancelled by patient'); toast.success('Cancelled'); load() }
    catch { toast.error('Could not cancel') }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter)

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <Link to="/doctors" className="btn-primary text-sm">+ Book New</Link>
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all','pending','confirmed','completed','cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter===f?'bg-primary text-white':'bg-white text-gray-600 border border-gray-200 hover:border-primary'}`}>
              {f}
            </button>
          ))}
        </div>
        {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> :
         filtered.length === 0 ? (
          <div className="card text-center py-16"><p className="text-4xl mb-3">📅</p><p className="text-gray-500">No appointments found.</p></div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => (
              <div key={a.id} className="card hover:shadow-hover">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={statusStyles[a.status] || 'badge-blue'}>{a.status}</span>
                      <span className="text-xs text-gray-400">#{a.id.slice(0,8)}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{a.appointment_date}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Clock size={13} /> {a.start_time?.slice(0,5)} – {a.end_time?.slice(0,5)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {a.status === 'pending' && (
                      <Link to={`/patient/payment/${a.id}`} className="btn-primary text-xs px-3 py-1.5">Pay</Link>
                    )}
                    {['pending','confirmed'].includes(a.status) && (
                      <button onClick={() => handleCancel(a.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  )
}