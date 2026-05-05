import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Shield, User, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      setAuth(data.user, data.access_token)
      toast.success(`Welcome back, ${data.user.full_name}!`)
      const role = data.user.role
      if (role === 'patient') navigate('/patient/dashboard')
      else if (role === 'doctor') navigate('/doctor/dashboard')
      else navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary">
            <span className="text-3xl">🦷</span> CliniSmile
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
        </div>

        {/* Role Info Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: User,        label: 'Patient',  desc: 'Book appointments', color: 'border-blue-200 bg-blue-50',   iconColor: 'text-blue-600' },
            { icon: Stethoscope, label: 'Doctor',   desc: 'Manage patients',  color: 'border-green-200 bg-green-50', iconColor: 'text-green-600' },
            { icon: Shield,      label: 'Admin',    desc: 'Platform control', color: 'border-purple-200 bg-purple-50',iconColor: 'text-purple-600' },
          ].map((role) => (
            <div key={role.label} className={`border-2 rounded-xl p-3 text-center ${role.color}`}>
              <role.icon size={20} className={`mx-auto mb-1 ${role.iconColor}`} />
              <p className="text-xs font-bold text-gray-800">{role.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{role.desc}</p>
            </div>
          ))}
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input type="email" required placeholder="you@example.com"
                  className="input pl-10"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input type={show ? 'text' : 'password'} required placeholder="••••••••"
                  className="input pl-10 pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="absolute right-3 top-3.5 text-gray-400"
                  onClick={() => setShow(!show)}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Role hint */}
          <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">ℹ️ Login by Role:</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• <strong>Patient/Doctor</strong> — use your registered email</li>
              <li>• <strong>Admin</strong> — contact the platform owner for credentials</li>
            </ul>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 space-y-2 text-center">
            <p className="text-sm text-gray-500">
              New patient? <Link to="/register/patient" className="text-primary font-semibold hover:underline">Register here</Link>
            </p>
            <p className="text-sm text-gray-500">
              Are you a dentist? <Link to="/register/doctor" className="text-secondary font-semibold hover:underline">Join as Doctor</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}