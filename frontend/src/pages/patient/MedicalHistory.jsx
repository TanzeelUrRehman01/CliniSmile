import { useEffect, useState } from 'react'
import { Calendar, Clock, FileText, Search, ChevronDown, ChevronUp } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import { appointmentsAPI } from '../../services/api'

const sidebarLinks = [
  { to:'/patient/dashboard',    label:'Dashboard',       icon:Calendar },
  { to:'/patient/appointments', label:'My Appointments', icon:Clock },
  { to:'/patient/history',      label:'Medical History', icon:FileText },
  { to:'/doctors',              label:'Find Doctors',    icon:Search },
]

export default function MedicalHistory() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [details, setDetails] = useState({})

  useEffect(() => {
    appointmentsAPI.list().then(({ data }) => {
      setAppointments((data.data || []).filter((a) => a.status === 'completed'))
    }).finally(() => setLoading(false))
  }, [])

  const toggle = async (id) => {
    if (expanded === id) return setExpanded(null)
    setExpanded(id)
    if (!details[id]) {
      const { data } = await appointmentsAPI.get(id)
      setDetails((prev) => ({ ...prev, [id]: data.data }))
    }
  }

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Medical History</h1>
        <p className="text-gray-500 text-sm mb-8">Your completed dental visits</p>
        {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> :
         appointments.length === 0 ? (
          <div className="card text-center py-16"><p className="text-4xl mb-3">🏥</p><p className="text-gray-500">No completed appointments yet.</p></div>
        ) : (
          <div className="space-y-4">
            {appointments.map((a) => {
              const d = details[a.id]
              return (
                <div key={a.id} className="card">
                  <button className="w-full flex items-center justify-between" onClick={() => toggle(a.id)}>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{a.appointment_date}</p>
                      <p className="text-sm text-gray-500">{a.start_time?.slice(0,5)} · Appointment #{a.id.slice(0,8)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-blue">Completed</span>
                      {expanded === a.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>
                  {expanded === a.id && d && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm space-y-3 fade-in">
                      {d.symptoms && (
                        <div className="bg-red-50 rounded-xl p-4">
                          <p className="font-semibold text-gray-700 mb-2">Symptoms Reported</p>
                          <p><span className="text-gray-500">Pain Level:</span> <strong>{d.symptoms.pain_level}/10</strong></p>
                          <p><span className="text-gray-500">Symptoms:</span> {d.symptoms.symptom_types?.join(', ')}</p>
                          <p><span className="text-gray-500">Duration:</span> {d.symptoms.duration}</p>
                          {d.symptoms.notes && <p><span className="text-gray-500">Notes:</span> {d.symptoms.notes}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Sidebar>
  )
}
