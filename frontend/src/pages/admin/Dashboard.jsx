import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserCheck, CreditCard, DollarSign, Clock, ToggleLeft, Shield } from 'lucide-react'
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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.dashboard().then(({ data }) => setStats(data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [])

  const kpis = stats ? [
    { label:'Total Users',                    value:stats.total_users,                     icon:Users,    color:'bg-blue-50 text-blue-600' },
    { label:'Total Doctors',                  value:stats.total_doctors,                   icon:UserCheck,color:'bg-green-50 text-green-600' },
    { label:'Total Appointments',             value:stats.total_appointments,              icon:Clock,    color:'bg-purple-50 text-purple-600' },
    { label:'Platform Revenue (PKR)',         value:stats.total_revenue_pkr?.toLocaleString(),icon:DollarSign,color:'bg-yellow-50 text-yellow-600' },
    { label:'Pending Doctor Verifications',   value:stats.pending_doctor_verifications,    icon:UserCheck,color:'bg-orange-50 text-orange-600' },
    { label:'Pending Payment Verifications',  value:stats.pending_payment_verifications,   icon:CreditCard,color:'bg-red-50 text-red-600' },
  ] : []

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform overview and management</p>
        </div>
        {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {kpis.map((k) => (
              <div key={k.label} className="card flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${k.color}`}><k.icon size={22} /></div>
                <div><p className="text-2xl font-bold text-gray-900">{k.value}</p><p className="text-sm text-gray-500">{k.label}</p></div>
              </div>
            ))}
          </div>
        )}
        {stats?.pending_doctor_verifications > 0 && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-2xl p-5">
            <p className="font-semibold text-orange-800">⚠️ {stats.pending_doctor_verifications} doctor(s) awaiting verification</p>
            <Link to="/admin/doctors" className="text-sm text-orange-700 underline mt-1 inline-block">Review now →</Link>
          </div>
        )}
      </div>
    </Sidebar>
  )
}