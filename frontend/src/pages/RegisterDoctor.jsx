import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

const specialties = ['General Dentist','Orthodontist','Periodontist','Endodontist','Prosthodontist','Oral Surgeon','Pediatric Dentist','Cosmetic Dentist']

export default function RegisterDoctor() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ full_name:'',email:'',phone:'',password:'',confirm:'',specialty:'General Dentist',clinic_name:'',clinic_address:'',city:'',consultation_fee:'',easypaisa_account:'',jazzcash_account:'',bio:'' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await authAPI.registerDoctor({ ...form, consultation_fee: parseFloat(form.consultation_fee) })
      toast.success('Application submitted! Await admin approval.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-accent flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary"><span className="text-3xl">🦷</span> CliniSmile AI</Link>
          <h2 className="text-2xl font-bold mt-4">Join as a Doctor</h2>
        </div>
        <div className="flex gap-2 mb-6">
          {[1,2].map((s) => <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-gray-200'}`} />)}
        </div>
        <div className="card">
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <h3 className="font-semibold text-gray-700">Step 1 — Personal Details</h3>
                <div><label className="label">Full Name</label><input required className="input" placeholder="Dr. Sara Khan" value={form.full_name} onChange={set('full_name')} /></div>
                <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={set('email')} /></div>
                <div><label className="label">Phone</label><input required className="input" placeholder="+92 300 0000000" value={form.phone} onChange={set('phone')} /></div>
                <div><label className="label">Password</label><input type="password" required minLength={8} className="input" value={form.password} onChange={set('password')} /></div>
                <div><label className="label">Confirm Password</label><input type="password" required className="input" value={form.confirm} onChange={set('confirm')} /></div>
                <button type="submit" className="btn-primary w-full py-3">Next →</button>
              </>
            )}
            {step === 2 && (
              <>
                <h3 className="font-semibold text-gray-700">Step 2 — Clinic Details</h3>
                <div><label className="label">Specialty</label>
                  <select className="input" value={form.specialty} onChange={set('specialty')}>
                    {specialties.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="label">Clinic Name</label><input required className="input" value={form.clinic_name} onChange={set('clinic_name')} /></div>
                <div><label className="label">Clinic Address</label><input required className="input" value={form.clinic_address} onChange={set('clinic_address')} /></div>
                <div><label className="label">City</label><input required className="input" placeholder="Islamabad" value={form.city} onChange={set('city')} /></div>
                <div><label className="label">Consultation Fee (PKR)</label><input type="number" required className="input" placeholder="1500" value={form.consultation_fee} onChange={set('consultation_fee')} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Easypaisa No.</label><input className="input" value={form.easypaisa_account} onChange={set('easypaisa_account')} /></div>
                  <div><label className="label">JazzCash No.</label><input className="input" value={form.jazzcash_account} onChange={set('jazzcash_account')} /></div>
                </div>
                <div><label className="label">Bio</label><textarea className="input" rows={3} value={form.bio} onChange={set('bio')} /></div>
                <div className="flex gap-3">
                  <button type="button" className="btn-outline flex-1 py-3" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn-primary flex-1 py-3" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
                </div>
              </>
            )}
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">Already registered? <Link to="/login" className="text-primary font-semibold">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}