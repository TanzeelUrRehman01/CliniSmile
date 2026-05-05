import { useEffect, useState } from 'react'
import { Users, UserCheck, CreditCard, ToggleLeft, Shield, CheckCircle, XCircle, Eye } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const sidebarLinks = [
  { to:'/admin/dashboard',     label:'Dashboard',          icon:Shield },
  { to:'/admin/doctors',       label:'Doctor Verification', icon:UserCheck },
  { to:'/admin/payments',      label:'Payment Verification',icon:CreditCard },
  { to:'/admin/users',         label:'User Management',    icon:Users },
  { to:'/admin/feature-flags', label:'Feature Flags',      icon:ToggleLeft },
]

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const load = () => {
    setLoading(true)
    adminAPI.pendingDoctors().then(({ data }) => setDoctors(data.data || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const verify = async (id, approved) => {
    if (!approved && !notes.trim()) return toast.error('Please provide a rejection reason')
    setProcessing(true)
    try {
      await adminAPI.verifyDoctor(id, { approved, notes })
      toast.success(approved ? 'Doctor approved!' : 'Doctor rejected')
      setSelected(null); setNotes(''); load()
    } catch { toast.error('Action failed') }
    finally { setProcessing(false) }
  }

  const verdictBadge = { likely_valid:'badge-green', requires_review:'badge-yellow', invalid:'badge-red' }

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Doctor Verification Queue</h1>
        {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> :
         doctors.length === 0 ? (
          <div className="card text-center py-16"><p className="text-4xl mb-2">✅</p><p className="text-gray-500">All applications reviewed!</p></div>
        ) : (
          <div className="space-y-5">
            {doctors.map((doc) => (
              <div key={doc.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{doc.full_name}</h3>
                    <p className="text-sm text-primary">{doc.specialty}</p>
                    <p className="text-sm text-gray-500">{doc.email} · {doc.clinic_name}</p>
                    <span className={`mt-2 inline-flex ${doc.verification_status==='pending'?'badge-yellow':'badge-blue'}`}>{doc.verification_status}</span>
                  </div>
                  <button onClick={() => setSelected(selected?.id===doc.id ? null : doc)} className="btn-outline text-sm flex items-center gap-1">
                    <Eye size={15} /> Review
                  </button>
                </div>
                {selected?.id === doc.id && (
                  <div className="mt-5 pt-5 border-t border-gray-100 fade-in space-y-4">
                    {doc.certificates?.map((cert) => (
                      <div key={cert.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className={verdictBadge[cert.ai_verdict] || 'badge-yellow'}>AI: {cert.ai_verdict?.replace('_',' ')}</span>
                          {cert.ai_confidence_score !== null && <span className="text-xs text-gray-500">Confidence: {cert.ai_confidence_score}%</span>}
                        </div>
                        <a href={cert.file_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">View Certificate →</a>
                        {cert.ocr_text_preview && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-gray-500">OCR Text Preview</summary>
                            <pre className="mt-2 bg-white p-2 rounded-lg text-gray-600 whitespace-pre-wrap overflow-auto max-h-32">{cert.ocr_text_preview}</pre>
                          </details>
                        )}
                      </div>
                    ))}
                    <div><label className="label">Admin Notes (required for rejection)</label>
                      <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason..." />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => verify(doc.id, true)} disabled={processing} className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
                        <CheckCircle size={18} /> Approve
                      </button>
                      <button onClick={() => verify(doc.id, false)} disabled={processing} className="flex-1 bg-red-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                        <XCircle size={18} /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  )
}