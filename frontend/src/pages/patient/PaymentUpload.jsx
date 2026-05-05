import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, CheckCircle, Smartphone, Calendar, Clock, FileText, Search } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import { paymentsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const sidebarLinks = [
  { to:'/patient/dashboard',    label:'Dashboard',       icon:Calendar },
  { to:'/patient/appointments', label:'My Appointments', icon:Clock },
  { to:'/patient/history',      label:'Medical History', icon:FileText },
  { to:'/doctors',              label:'Find Doctors',    icon:Search },
]

export default function PaymentUpload() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [method, setMethod] = useState('easypaisa')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5*1024*1024) return toast.error('File must be under 5 MB')
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(f)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a payment screenshot')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await paymentsAPI.uploadProof(appointmentId, method, fd)
      toast.success('Payment proof submitted!')
      setDone(true)
    } catch (err) { toast.error(err.response?.data?.detail || 'Upload failed') }
    finally { setLoading(false) }
  }

  return (
    <Sidebar links={sidebarLinks}>
      <div className="max-w-lg mx-auto fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Payment Proof</h1>
        {done ? (
          <div className="card text-center py-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Proof Submitted!</h2>
            <p className="text-gray-500 mb-6">Admin will verify your payment within a few hours.</p>
            <button className="btn-primary px-8 py-3" onClick={() => navigate('/patient/appointments')}>View Appointments</button>
          </div>
        ) : (
          <div className="card">
            <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Smartphone size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Payment Instructions</p>
                <p>Transfer the consultation fee to the doctor's mobile account, then upload a screenshot as proof.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {['easypaisa','jazzcash'].map((m) => (
                    <button key={m} type="button" onClick={() => setMethod(m)}
                      className={`py-3 rounded-xl border-2 font-semibold capitalize text-sm transition-all ${method===m?'border-primary bg-primary/5 text-primary':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {m === 'easypaisa' ? '🟢 Easypaisa' : '🟠 JazzCash'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Payment Screenshot</label>
                <label className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${file?'border-primary bg-accent':'border-gray-300 hover:border-primary'}`}>
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
                  {preview ? (
                    <img src={preview} alt="proof" className="max-h-48 mx-auto rounded-xl object-contain" />
                  ) : (
                    <div><Upload size={28} className="text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-500">Click to upload (max 5 MB)</p></div>
                  )}
                </label>
                {file && <p className="text-xs text-gray-500 mt-1">{file.name}</p>}
              </div>
              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Uploading...' : 'Submit Payment Proof'}
              </button>
            </form>
          </div>
        )}
      </div>
    </Sidebar>
  )
}