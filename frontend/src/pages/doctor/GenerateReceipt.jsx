import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, Clock, DollarSign, Image, Settings, Printer, Download } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const sidebarLinks = [
  { to:'/doctor/dashboard',    label:'Dashboard',    icon:Calendar },
  { to:'/doctor/appointments', label:'Appointments', icon:Clock },
  { to:'/doctor/availability', label:'Availability', icon:Settings },
  { to:'/doctor/earnings',     label:'Earnings',     icon:DollarSign },
  { to:'/doctor/media',        label:'Clinic Media', icon:Image },
]

export default function GenerateReceipt() {
  const { appointmentId } = useParams()
  const { user } = useAuthStore()
  const printRef = useRef()
  const [r, setR] = useState({ patient_name:'',patient_phone:'',patient_age:'',appointment_date:new Date().toISOString().split('T')[0],diagnosis:'',procedures:'',medications:'',next_appointment:'',checkup_schedule:'Every 6 months',notes:'' })
  const set = (k) => (e) => setR({ ...r, [k]: e.target.value })

  const handleDownloadPDF = async () => {
    toast('Generating PDF...', { icon:'📄' })
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(printRef.current, { scale:2 })
    const pdf = new jsPDF({ orientation:'portrait', unit:'px', format:[canvas.width/2, canvas.height/2] })
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width/2, canvas.height/2)
    pdf.save(`receipt-${appointmentId?.slice(0,8)}.pdf`)
    toast.success('PDF downloaded!')
  }

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Generate Receipt</h1>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="btn-outline flex items-center gap-2 text-sm"><Printer size={16} /> Print</button>
            <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-2 text-sm"><Download size={16} /> Download PDF</button>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <h2 className="font-bold text-gray-900">Receipt Details</h2>
            <div><label className="label">Patient Name</label><input className="input" value={r.patient_name} onChange={set('patient_name')} placeholder="Ahmed Ali" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Age</label><input className="input" value={r.patient_age} onChange={set('patient_age')} /></div>
              <div><label className="label">Phone</label><input className="input" value={r.patient_phone} onChange={set('patient_phone')} /></div>
            </div>
            <div><label className="label">Date</label><input type="date" className="input" value={r.appointment_date} onChange={set('appointment_date')} /></div>
            <div><label className="label">Diagnosis</label><textarea className="input" rows={2} value={r.diagnosis} onChange={set('diagnosis')} /></div>
            <div><label className="label">Procedures</label><textarea className="input" rows={2} value={r.procedures} onChange={set('procedures')} /></div>
            <div><label className="label">Medications</label><textarea className="input" rows={3} value={r.medications} onChange={set('medications')} /></div>
            <div><label className="label">Next Appointment</label><input type="date" className="input" value={r.next_appointment} onChange={set('next_appointment')} /></div>
            <div><label className="label">Checkup Schedule</label>
              <select className="input" value={r.checkup_schedule} onChange={set('checkup_schedule')}>
                {['Monthly','Every 3 months','Every 6 months','Annually','As needed'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="label">Doctor Notes</label><textarea className="input" rows={2} value={r.notes} onChange={set('notes')} /></div>
          </div>

          <div>
            <div ref={printRef} className="bg-white rounded-2xl shadow-card p-8">
              <div className="flex items-start justify-between border-b-2 border-primary pb-5 mb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-primary">🦷 CliniSmile AI</h2>
                  <p className="text-sm text-gray-500 mt-1">Dr. {user?.full_name}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Date: {r.appointment_date}</p>
                  <p>Ref: {appointmentId?.slice(0,8)?.toUpperCase()}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Patient</p>
                <div className="bg-accent rounded-xl p-3 text-sm grid grid-cols-3 gap-2">
                  <div><p className="text-gray-500 text-xs">Name</p><p className="font-medium">{r.patient_name||'—'}</p></div>
                  <div><p className="text-gray-500 text-xs">Age</p><p className="font-medium">{r.patient_age||'—'}</p></div>
                  <div><p className="text-gray-500 text-xs">Phone</p><p className="font-medium">{r.patient_phone||'—'}</p></div>
                </div>
              </div>
              {[['Diagnosis',r.diagnosis],['Procedures',r.procedures],['Medications',r.medications],['Next Appointment',r.next_appointment],['Checkup Schedule',r.checkup_schedule],['Notes',r.notes]].map(([label,value]) => value ? (
                <div key={label} className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>
                </div>
              ) : null)}
              <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                <p>Powered by <strong className="text-primary">CliniSmile AI</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}