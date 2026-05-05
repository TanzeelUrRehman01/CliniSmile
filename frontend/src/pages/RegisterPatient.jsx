import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

export default function RegisterPatient() {
  const [form, setForm] = useState({ full_name:'', email:'', phone:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await authAPI.registerPatient({ full_name:form.full_name, email:form.email, phone:form.phone, password:form.password })
      toast.success('Account created! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary"><span className="text-3xl">🦷</span> CliniSmile AI</Link>
          <h2 className="text-2xl font-bold mt-4 text-gray-900">Create Patient Account</h2>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Full Name</label>
              <div className="relative"><User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input required className="input pl-10" placeholder="Ahmed Ali" value={form.full_name} onChange={set('full_name')} />
              </div>
            </div>
            <div><label className="label">Email</label>
              <div className="relative"><Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input type="email" required className="input pl-10" placeholder="you@example.com" value={form.email} onChange={set('email')} />
              </div>
            </div>
            <div><label className="label">Phone Number</label>
              <div className="relative"><Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input required className="input pl-10" placeholder="+92 300 1234567" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div><label className="label">Password</label>
              <div className="relative"><Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input type="password" required minLength={8} className="input pl-10" value={form.password} onChange={set('password')} />
              </div>
            </div>
            <div><label className="label">Confirm Password</label>
              <div className="relative"><Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input type="password" required className="input pl-10" value={form.confirm} onChange={set('confirm')} />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">Already have an account? <Link to="/login" className="text-primary font-semibold">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}