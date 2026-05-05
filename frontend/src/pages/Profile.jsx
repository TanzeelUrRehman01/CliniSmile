import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, Save, ArrowLeft, MapPin, DollarSign, FileText, AlertCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, setAuth, token } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('profile')

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    specialty: '', clinic_name: '', clinic_address: '',
    city: '', consultation_fee: '',
    easypaisa_account: '', jazzcash_account: '', bio: '',
  })

  const [passwords, setPasswords] = useState({
    current_password: '', new_password: '', confirm_password: '',
  })
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false })

  const [emailForm, setEmailForm] = useState({
    new_email: '', password: '', otp: '', step: 1
  })

  useEffect(() => {
    if (user?.role === 'doctor') {
      api.get(`/doctors/${user.id}`)
        .then(({ data }) => {
          const d = data.data
          setForm((prev) => ({
            ...prev,
            specialty: d.specialty || '',
            clinic_name: d.clinic_name || '',
            clinic_address: d.clinic_address || '',
            city: d.city || '',
            consultation_fee: d.consultation_fee || '',
            easypaisa_account: d.easypaisa_account || '',
            jazzcash_account: d.jazzcash_account || '',
            bio: d.bio || '',
          }))
        }).catch(() => {})
    }
  }, [user])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const setPwd = (k) => (e) => setPasswords({ ...passwords, [k]: e.target.value })

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch('/users/me', {
        full_name: form.full_name,
        phone: form.phone,
      })
      if (user?.role === 'doctor') {
        await api.patch('/doctors/me', {
          specialty: form.specialty,
          clinic_name: form.clinic_name,
          clinic_address: form.clinic_address,
          city: form.city,
          consultation_fee: parseFloat(form.consultation_fee),
          easypaisa_account: form.easypaisa_account,
          jazzcash_account: form.jazzcash_account,
          bio: form.bio,
        })
      }
      setAuth({ ...user, full_name: form.full_name, phone: form.phone }, token)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally { setLoading(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.new_password !== passwords.confirm_password)
      return toast.error('New passwords do not match')
    if (passwords.new_password.length < 8)
      return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await api.patch('/users/me/password', {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      })
      toast.success('Password changed successfully!')
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password')
    } finally { setLoading(false) }
  }

  const handleRequestEmailChange = async (e) => {
    e.preventDefault()
    if (!emailForm.new_email || !emailForm.password)
      return toast.error('Please fill all fields')
    if (emailForm.new_email === user?.email)
      return toast.error('New email is same as current email')
    setLoading(true)
    try {
      await api.post('/users/me/request-email-change', {
        new_email: emailForm.new_email,
        password: emailForm.password,
      })
      toast.success('Verification code sent to your new email!')
      setEmailForm({ ...emailForm, step: 2 })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send verification')
    } finally { setLoading(false) }
  }

  const handleVerifyEmailChange = async (e) => {
    e.preventDefault()
    if (!emailForm.otp) return toast.error('Please enter the verification code')
    setLoading(true)
    try {
      await api.post('/users/me/verify-email-change', {
        new_email: emailForm.new_email,
        otp: emailForm.otp,
      })
      setAuth({ ...user, email: emailForm.new_email }, token)
      toast.success('Email updated successfully!')
      setEmailForm({ new_email: '', password: '', otp: '', step: 1 })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired code')
    } finally { setLoading(false) }
  }

  const dashboardLink = () => {
    if (user?.role === 'patient') return '/patient/dashboard'
    if (user?.role === 'doctor')  return '/doctor/dashboard'
    return '/admin/dashboard'
  }

  const roleColor = {
    patient: 'bg-blue-100 text-blue-700',
    doctor:  'bg-green-100 text-green-700',
    admin:   'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="gradient-hero py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate(dashboardLink())}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.full_name}</h1>
              <p className="text-white/70 text-sm mt-1">{user?.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleColor[user?.role]}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'profile',  label: '👤 Edit Profile' },
            { key: 'password', label: '🔒 Change Password' },
            { key: 'email',    label: '📧 Change Email' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-5">

            <div className="card">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <User size={18} className="text-primary" /> Basic Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input className="input pl-9" value={form.full_name}
                      onChange={set('full_name')} required />
                  </div>
                </div>
                <div>
                  <label className="label">Current Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input className="input pl-9 bg-gray-50 cursor-not-allowed"
                      value={user?.email} disabled />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Use "Change Email" tab to update</p>
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input className="input pl-9" placeholder="+92 300 1234567"
                      value={form.phone} onChange={set('phone')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor fields */}
            {user?.role === 'doctor' && (
              <>
                <div className="card">
                  <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <MapPin size={18} className="text-secondary" /> Clinic Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Specialty</label>
                      <select className="input" value={form.specialty} onChange={set('specialty')}>
                        {['General Dentist','Orthodontist','Periodontist','Endodontist',
                          'Prosthodontist','Oral Surgeon','Pediatric Dentist','Cosmetic Dentist']
                          .map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Clinic Name</label>
                      <input className="input" value={form.clinic_name} onChange={set('clinic_name')} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Clinic Address</label>
                      <input className="input" value={form.clinic_address} onChange={set('clinic_address')} />
                    </div>
                    <div>
                      <label className="label">City</label>
                      <input className="input" placeholder="Islamabad"
                        value={form.city} onChange={set('city')} />
                    </div>
                    <div>
                      <label className="label">Consultation Fee (PKR)</label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input type="number" className="input pl-9"
                          value={form.consultation_fee} onChange={set('consultation_fee')} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Easypaisa Number</label>
                      <input className="input" placeholder="0300-0000000"
                        value={form.easypaisa_account} onChange={set('easypaisa_account')} />
                    </div>
                    <div>
                      <label className="label">JazzCash Number</label>
                      <input className="input" placeholder="0300-0000000"
                        value={form.jazzcash_account} onChange={set('jazzcash_account')} />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-secondary" /> Professional Bio
                  </h2>
                  <textarea className="input" rows={4}
                    placeholder="Describe your experience and qualifications..."
                    value={form.bio} onChange={set('bio')} />
                </div>
              </>
            )}

            <button type="submit"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* ── Password Tab ── */}
        {tab === 'password' && (
          <form onSubmit={handleChangePassword} className="card space-y-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Lock size={18} className="text-primary" /> Change Password
            </h2>
            {[
              { key: 'current', label: 'Current Password',     field: 'current_password' },
              { key: 'new',     label: 'New Password',         field: 'new_password' },
              { key: 'confirm', label: 'Confirm New Password', field: 'confirm_password' },
            ].map((item) => (
              <div key={item.key}>
                <label className="label">{item.label}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type={showPwd[item.key] ? 'text' : 'password'}
                    required
                    className="input pl-9 pr-10"
                    value={passwords[item.field]}
                    onChange={setPwd(item.field)}
                    placeholder={item.key !== 'current' ? 'Min 8 characters' : ''}
                  />
                  <button type="button"
                    className="absolute right-3 top-3.5 text-gray-400"
                    onClick={() => setShowPwd({ ...showPwd, [item.key]: !showPwd[item.key] })}>
                    {showPwd[item.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              Minimum 8 characters. Use letters, numbers, and symbols for better security.
            </div>
            <button type="submit"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              disabled={loading}>
              <Lock size={18} />
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}

        {/* ── Email Tab ── */}
        {tab === 'email' && (
          <div className="card space-y-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Mail size={18} className="text-primary" /> Change Email Address
            </h2>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {['Enter New Email', 'Verify Code'].map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    emailForm.step > i + 1 ? 'bg-secondary text-white' :
                    emailForm.step === i + 1 ? 'bg-primary text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {emailForm.step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-gray-500 hidden sm:block">{label}</span>
                  {i < 1 && (
                    <div className={`flex-1 h-0.5 ${emailForm.step > i + 1 ? 'bg-secondary' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Current email */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Current Email</p>
              <p className="font-semibold text-gray-900">{user?.email}</p>
            </div>

            {emailForm.step === 1 && (
              <form onSubmit={handleRequestEmailChange} className="space-y-4">
                <div>
                  <label className="label">New Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input type="email" required className="input pl-9"
                      placeholder="newemail@example.com"
                      value={emailForm.new_email}
                      onChange={(e) => setEmailForm({ ...emailForm, new_email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Your Current Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                    <input type="password" required className="input pl-9"
                      placeholder="Enter your current password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })} />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    A 6-digit verification code will be sent to your <strong>new email address</strong>.
                    You must verify it to complete the change.
                  </p>
                </div>
                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? 'Sending code...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {emailForm.step === 2 && (
              <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                  ✅ Verification code sent to <strong>{emailForm.new_email}</strong>. Check your inbox.
                </div>
                <div>
                  <label className="label">Enter 6-Digit Verification Code</label>
                  <input type="text" required maxLength={6}
                    className="input text-center text-2xl font-bold tracking-widest"
                    placeholder="000000"
                    value={emailForm.otp}
                    onChange={(e) => setEmailForm({ ...emailForm, otp: e.target.value.replace(/\D/g, '') })} />
                </div>
                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Update Email'}
                </button>
                <button type="button" className="btn-ghost w-full py-2 text-sm"
                  onClick={() => setEmailForm({ ...emailForm, step: 1, otp: '' })}>
                  ← Go back
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  )
}