import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, AlertCircle, CheckCircle, Clock, FileText, Search } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import { doctorsAPI, appointmentsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const sidebarLinks = [
  { to:'/patient/dashboard',    label:'Dashboard',       icon:Calendar },
  { to:'/patient/appointments', label:'My Appointments', icon:Clock },
  { to:'/patient/history',      label:'Medical History', icon:FileText },
  { to:'/doctors',              label:'Find Doctors',    icon:Search },
]

const SYMPTOMS = ['Toothache','Cavity','Sensitivity','Gum Pain','Bleeding Gums','Broken Tooth','Bad Breath','Swelling','Jaw Pain','Wisdom Tooth','Other']

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [doctor, setDoctor] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [symptoms, setSymptoms] = useState({ pain_level:5, symptom_types:[], duration:'', notes:'' })
  const [loading, setLoading] = useState(false)
  const [appointmentId, setAppointmentId] = useState(null)

  useEffect(() => {
    doctorsAPI.getProfile(doctorId).then(({ data }) => setDoctor(data.data))
    const today = new Date().toISOString().split('T')[0]
    const next14 = new Date(Date.now() + 14*864e5).toISOString().split('T')[0]
    doctorsAPI.getSlots(doctorId, { date_from:today, date_to:next14 }).then(({ data }) => setSlots(data.data || []))
  }, [doctorId])

  const toggleSymptom = (s) => setSymptoms((prev) => ({
    ...prev,
    symptom_types: prev.symptom_types.includes(s) ? prev.symptom_types.filter((x) => x !== s) : [...prev.symptom_types, s]
  }))

  const handleConfirm = async () => {
    if (!selectedSlot) return toast.error('Please select a time slot')
    if (!symptoms.duration) return toast.error('Please enter symptom duration')
    if (symptoms.symptom_types.length === 0) return toast.error('Please select at least one symptom')
    setLoading(true)
    try {
      const { data } = await appointmentsAPI.book({ slot_id: selectedSlot.id, symptoms })
      setAppointmentId(data.appointment_id)
      setStep(3)
      toast.success('Appointment created!')
    } catch (err) { toast.error(err.response?.data?.detail || 'Booking failed') }
    finally { setLoading(false) }
  }

  const slotsByDate = slots.reduce((acc, s) => { if (!acc[s.date]) acc[s.date]=[]; acc[s.date].push(s); return acc }, {})

  return (
    <Sidebar links={sidebarLinks}>
      <div className="max-w-2xl mx-auto fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          {doctor && <p className="text-gray-500 mt-1">with Dr. {doctor.full_name} · {doctor.specialty}</p>}
        </div>

        <div className="flex items-center gap-2 mb-8">
          {['Select Slot','Symptoms','Confirm'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i+1 ? 'bg-secondary text-white' : step === i+1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step === i+1 ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <div className={`flex-1 h-0.5 ${step > i+1 ? 'bg-secondary' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={18} /> Available Slots</h2>
            {Object.keys(slotsByDate).length === 0 ? (
              <p className="text-gray-400 text-sm py-6 text-center">No available slots in the next 14 days.</p>
            ) : (
              <div className="space-y-5">
                {Object.entries(slotsByDate).map(([date, daySlots]) => (
                  <div key={date}>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      {new Date(date).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((slot) => (
                        <button key={slot.id} onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${selectedSlot?.id === slot.id ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:border-primary hover:text-primary'}`}>
                          {slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary w-full mt-6 py-3" disabled={!selectedSlot} onClick={() => setStep(2)}>
              Next: Add Symptoms →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertCircle size={18} /> Symptom Information</h2>
            <div className="space-y-5">
              <div>
                <label className="label">Pain Level: <span className="text-primary font-bold">{symptoms.pain_level}/10</span></label>
                <input type="range" min={1} max={10} value={symptoms.pain_level}
                  onChange={(e) => setSymptoms({ ...symptoms, pain_level: Number(e.target.value) })}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Mild</span><span>Severe</span></div>
              </div>
              <div>
                <label className="label">Symptoms (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS.map((s) => (
                    <button key={s} type="button" onClick={() => toggleSymptom(s)}
                      className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${symptoms.symptom_types.includes(s) ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">How long have you had these symptoms?</label>
                <input className="input" placeholder="e.g. 3 days, 2 weeks" value={symptoms.duration}
                  onChange={(e) => setSymptoms({ ...symptoms, duration: e.target.value })} />
              </div>
              <div>
                <label className="label">Additional Notes (optional)</label>
                <textarea className="input" rows={3} value={symptoms.notes}
                  onChange={(e) => setSymptoms({ ...symptoms, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-outline flex-1 py-3" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary flex-1 py-3" onClick={handleConfirm} disabled={loading}>
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card text-center py-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Created!</h2>
            <p className="text-gray-500 mb-2">Your appointment is pending payment verification.</p>
            {doctor && (
              <div className="bg-accent rounded-xl p-4 my-5 text-left text-sm">
                <p className="font-medium text-gray-700 mb-1">Payment Instructions:</p>
                {doctor.easypaisa_account && <p>📱 Easypaisa: <strong>{doctor.easypaisa_account}</strong></p>}
                {doctor.jazzcash_account  && <p>📱 JazzCash: <strong>{doctor.jazzcash_account}</strong></p>}
                <p className="mt-2 text-gray-500">Amount: <strong>PKR {Number(doctor.consultation_fee).toLocaleString()}</strong></p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button className="btn-primary px-6 py-3" onClick={() => navigate(`/patient/payment/${appointmentId}`)}>Upload Payment Proof →</button>
              <button className="btn-ghost px-6 py-3" onClick={() => navigate('/patient/appointments')}>View Appointments</button>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}