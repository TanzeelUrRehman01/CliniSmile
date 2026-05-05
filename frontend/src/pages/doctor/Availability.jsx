import { useState, useEffect } from 'react'
import { Calendar, Clock, DollarSign, Image, Settings, Trash2, Plus } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import { doctorsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const sidebarLinks = [
  { to:'/doctor/dashboard',    label:'Dashboard',    icon:Calendar },
  { to:'/doctor/appointments', label:'Appointments', icon:Clock },
  { to:'/doctor/availability', label:'Availability', icon:Settings },
  { to:'/doctor/earnings',     label:'Earnings',     icon:DollarSign },
  { to:'/doctor/media',        label:'Clinic Media', icon:Image },
]

export default function DoctorAvailability() {
  const [slots, setSlots] = useState([])
  const [form, setForm] = useState({ specific_date:'', start_time:'', end_time:'' })
  const [loading, setLoading] = useState(false)

  // Load existing slots on mount
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const { data } = await doctorsAPI.getMySlots()
        // Normalize API response: use specific_date instead of date
        const normalizedSlots = (data.data || []).map(s => ({
          ...s,
          specific_date: s.date
        }))
        setSlots(normalizedSlots)
      } catch (err) {
        console.error('[SLOTS LOAD] Error:', err.message)
        toast.error('Failed to load slots')
      }
    }
    loadSlots()
  }, [])

  const addSlot = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      console.log('[SLOT ADD] Sending form:', form)
      console.log('[SLOT ADD] Token present:', !!localStorage.getItem('token'))
      const { data } = await doctorsAPI.createSlot(form)
      console.log('[SLOT ADD] Success response:', data)
      setSlots((prev) => [...prev, { ...form, id:data.slot_id, is_booked:false }])
      toast.success('Slot added')
      setForm({ specific_date:'', start_time:'', end_time:'' })
    } catch (err) { 
      console.error('[SLOT ADD] Full error object:', err)
      console.error('[SLOT ADD] Error response:', err.response)
      console.error('[SLOT ADD] Error message:', err.message)
      const errMsg = err.response?.data?.detail || err.message || 'Failed to add slot'
      console.error('[SLOT ADD] Final error message:', errMsg)
      toast.error(errMsg)
    }
    finally { setLoading(false) }
  }

  const deleteSlot = async (id) => {
    try { await doctorsAPI.deleteSlot(id); setSlots((prev) => prev.filter((s) => s.id !== id)); toast.success('Slot removed') }
    catch { toast.error('Cannot remove booked slot') }
  }

  const byDate = slots.reduce((acc, s) => { if (!acc[s.specific_date]) acc[s.specific_date]=[]; acc[s.specific_date].push(s); return acc }, {})

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Availability</h1>
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Plus size={18} /> Add Time Slot</h2>
          <form onSubmit={addSlot} className="space-y-4">
            <div><label className="label">Date</label>
              <input type="date" required className="input" min={new Date().toISOString().split('T')[0]}
                value={form.specific_date} onChange={(e) => setForm({ ...form, specific_date:e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Start Time</label><input type="time" required className="input" value={form.start_time} onChange={(e) => setForm({ ...form, start_time:e.target.value })} /></div>
              <div><label className="label">End Time</label><input type="time" required className="input" value={form.end_time} onChange={(e) => setForm({ ...form, end_time:e.target.value })} /></div>
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>{loading ? 'Adding...' : 'Add Slot'}</button>
          </form>
        </div>

        {slots.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <Calendar size={32} className="mx-auto mb-2 opacity-40" />
            <p>No slots added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byDate).sort().map(([date, daySlots]) => (
              <div key={date} className="card">
                <p className="font-semibold text-gray-700 mb-3">
                  {new Date(date).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
                </p>
                <div className="space-y-2">
                  {daySlots.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-primary" />
                        <span className="text-sm font-medium">{s.start_time} – {s.end_time}</span>
                        {s.is_booked && <span className="badge-red">Booked</span>}
                      </div>
                      {!s.is_booked && (
                        <button onClick={() => deleteSlot(s.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  )
}