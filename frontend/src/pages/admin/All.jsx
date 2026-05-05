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

export function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState({})
  const [processing, setProcessing] = useState(null)

  const load = () => {
    setLoading(true)
    adminAPI.pendingPayments().then(({ data }) => setPayments(data.data || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const verify = async (id, approved) => {
    setProcessing(id)
    try {
      await adminAPI.verifyPayment(id, { approved, rejection_reason: reason[id]||'' })
      toast.success(approved ? 'Payment verified!' : 'Payment rejected')
      load()
    } catch { toast.error('Action failed') }
    finally { setProcessing(null) }
  }

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Verification Queue</h1>
        {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> :
         payments.length === 0 ? (
          <div className="card text-center py-16"><p className="text-4xl mb-2">✅</p><p className="text-gray-500">No pending payments!</p></div>
        ) : (
          <div className="space-y-4">
            {payments.map((p) => (
              <div key={p.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-bold text-gray-900">PKR {Number(p.amount).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{p.payment_method} · Apt #{p.appointment_id?.slice(0,8)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Commission: PKR {Number(p.commission_amount).toLocaleString()} ({p.commission_rate}%)</p>
                  </div>
                  {p.proof_url && (
                    <a href={p.proof_url} target="_blank" rel="noreferrer" className="btn-outline text-sm flex items-center gap-1">
                      <Eye size={15} /> View Proof
                    </a>
                  )}
                </div>
                <div className="mb-3">
                  <input className="input text-sm" placeholder="Rejection reason (if rejecting)"
                    value={reason[p.id]||''} onChange={(e) => setReason({ ...reason, [p.id]: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => verify(p.id, true)} disabled={processing===p.id} className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2.5">
                    <CheckCircle size={16} /> Verify
                  </button>
                  <button onClick={() => verify(p.id, false)} disabled={processing===p.id} className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  )
}

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState(null) // holds user to delete
  const [deleting, setDeleting] = useState(false)

  // The owner admin email — cannot be deleted or deactivated
  const OWNER_EMAIL = 'admin@clinismile.ai'

  useEffect(() => {
    adminAPI.getUsers()
      .then(({ data }) => setUsers(data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (user) => {
    if (user.email === OWNER_EMAIL) {
      return toast.error('The owner admin account cannot be deactivated.')
    }
    try {
      const { data } = await adminAPI.toggleUser(user.id)
      setUsers((prev) =>
        prev.map((u) => u.id === user.id ? { ...u, is_active: data.is_active } : u)
      )
      toast.success('User status updated')
    } catch { toast.error('Failed') }
  }

  const confirmDelete = (user) => {
    if (user.email === OWNER_EMAIL) {
      return toast.error('The owner admin account cannot be deleted.')
    }
    setDeleteDialog(user)
  }

  const handleDelete = async () => {
    if (!deleteDialog) return
    setDeleting(true)
    try {
      await adminAPI.deleteUser(deleteDialog.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteDialog.id))
      toast.success(`${deleteDialog.full_name} deleted permanently`)
      setDeleteDialog(null)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const roleColor = {
    patient: 'badge-blue',
    doctor:  'badge-green',
    admin:   'badge-red',
  }

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-500 text-sm mb-6">{users.length} total users</p>

        {/* Delete Confirmation Dialog */}
        {deleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 fade-in">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗑️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete User?
              </h2>
              <p className="text-gray-500 text-center text-sm mb-1">
                Are you sure you want to permanently delete:
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 my-4 text-center">
                <p className="font-bold text-gray-900">{deleteDialog.full_name}</p>
                <p className="text-sm text-gray-500">{deleteDialog.email}</p>
                <span className={`inline-block mt-2 ${roleColor[deleteDialog.role]}`}>
                  {deleteDialog.role}
                </span>
              </div>
              <p className="text-xs text-red-600 text-center mb-5">
                ⚠️ This action is irreversible. All data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteDialog(null)}
                  className="flex-1 btn-outline py-3"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Email', 'Role', 'Status', 'Activate/Deactivate', 'Delete'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => {
                    const isOwner = u.email === OWNER_EMAIL
                    return (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {u.full_name}
                          {isOwner && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                              Owner
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-500">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className={roleColor[u.role]}>{u.role}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={u.is_active ? 'badge-green' : 'badge-red'}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {isOwner ? (
                            <span className="text-xs text-gray-400">Protected</span>
                          ) : (
                            <button
                              onClick={() => toggle(u)}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                                u.is_active
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                            >
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isOwner ? (
                            <span className="text-xs text-gray-400">Protected</span>
                          ) : (
                            <button
                              onClick={() => confirmDelete(u)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}
export function AdminFeatureFlags() {
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getFlags().then(({ data }) => setFlags(data.data || [])).finally(() => setLoading(false))
  }, [])

  const toggle = async (name, current) => {
    try {
      await adminAPI.toggleFlag(name, !current)
      setFlags((prev) => prev.map((f) => f.name===name ? { ...f, enabled:!current } : f))
      toast.success(`${name} ${!current?'enabled':'disabled'}`)
    } catch { toast.error('Failed') }
  }

  const defaultFlags = [
    { name:'chatbot',       enabled:true,  description:'AI Dental Consultation Chatbot' },
    { name:'payments',      enabled:true,  description:'Payment System (Easypaisa/JazzCash)' },
    { name:'reviews',       enabled:true,  description:'Patient Reviews & Ratings' },
    { name:'media_uploads', enabled:true,  description:'Doctor Clinic Media Uploads' },
    { name:'blog',          enabled:false, description:'Blog / Articles Section' },
  ]

  const displayFlags = flags.length > 0 ? flags : defaultFlags

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Feature Flags</h1>
        <p className="text-gray-500 text-sm mb-8">Enable or disable platform features in real-time</p>
        <div className="space-y-4">
          {displayFlags.map((f) => (
            <div key={f.name} className="card flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900 capitalize">{f.name.replace('_',' ')}</p>
                <p className="text-sm text-gray-500">{f.description}</p>
              </div>
              <button onClick={() => toggle(f.name, f.enabled)}
                className={`relative inline-flex w-14 h-7 rounded-full transition-all duration-200 focus:outline-none ${f.enabled?'bg-primary':'bg-gray-300'}`}>
                <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-1 ${f.enabled?'translate-x-8':'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  )
}