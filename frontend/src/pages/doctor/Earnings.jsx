import { useEffect, useState } from 'react'
import { Calendar, Clock, DollarSign, Image, Settings, TrendingUp } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import { paymentsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const sidebarLinks = [
  { to:'/doctor/dashboard',    label:'Dashboard',    icon:Calendar },
  { to:'/doctor/appointments', label:'Appointments', icon:Clock },
  { to:'/doctor/availability', label:'Availability', icon:Settings },
  { to:'/doctor/earnings',     label:'Earnings',     icon:DollarSign },
  { to:'/doctor/media',        label:'Clinic Media', icon:Image },
]

export default function DoctorEarnings() {
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const { data } = await paymentsAPI.doctorEarnings()
        setEarnings(data.data)
      } catch (err) {
        console.error('[EARNINGS] Error:', err.message)
        toast.error('Failed to load earnings')
      } finally {
        setLoading(false)
      }
    }
    loadEarnings()
  }, [])

  if (loading) {
    return (
      <Sidebar links={sidebarLinks}>
        <div className="fade-in">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Earnings</h1>
          <div className="text-center py-20 text-gray-400">Loading...</div>
        </div>
      </Sidebar>
    )
  }

  const formatPKR = (amount) => `PKR ${Number(amount).toLocaleString()}`

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Earnings</h1>
        <p className="text-gray-500 text-sm mb-8">Track your income after platform commission</p>
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {[
            { label:'This Month',              value: earnings ? formatPKR(earnings.this_month) : 'PKR 0', icon:DollarSign,  color:'bg-green-50 text-green-600' },
            { label:'Total Earned',            value: earnings ? formatPKR(earnings.total_earned) : 'PKR 0', icon:TrendingUp,  color:'bg-blue-50 text-blue-600' },
            { label:'Platform Commission (25%)',value: earnings ? formatPKR(earnings.total_commission) : 'PKR 0',icon:DollarSign,  color:'bg-orange-50 text-orange-600' },
          ].map((s) => (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}><s.icon size={22} /></div>
              <div><p className="text-xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          ))}
        </div>
        {earnings && earnings.total_earned === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
            <p>Earnings data will appear after payment verifications.</p>
          </div>
        ) : null}
      </div>
    </Sidebar>
  )
}