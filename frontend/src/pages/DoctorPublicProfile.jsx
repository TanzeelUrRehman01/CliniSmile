import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Star, Image, Video, Calendar } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import { doctorsAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function DoctorPublicProfile() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    doctorsAPI.getProfile(id)
      .then(({ data: res }) => { setData(res.data); setLoading(false) })
      .catch(() => { toast.error('Doctor not found'); setLoading(false) })
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg">Loading profile...</div>
  if (!data) return null

  const images = data.media?.filter((m) => m.type === 'image') || []
  const videos = data.media?.filter((m) => m.type === 'video') || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="gradient-hero py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
            {data.full_name.charAt(0)}
          </div>
          <div className="text-white text-center md:text-left">
            <h1 className="text-3xl font-bold mb-1">Dr. {data.full_name}</h1>
            <p className="text-white/80 text-lg font-medium">{data.specialty}</p>
            <p className="text-white/70 flex items-center gap-1 mt-2 justify-center md:justify-start">
              <MapPin size={16} /> {data.clinic_name} · {data.city}
            </p>
            <div className="flex items-center gap-4 mt-3 justify-center md:justify-start">
              <span className="flex items-center gap-1 text-yellow-300 font-semibold">
                <Star size={16} fill="currentColor" /> {Number(data.average_rating).toFixed(1)} ({data.total_reviews} reviews)
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                PKR {Number(data.consultation_fee).toLocaleString()} / visit
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {data.bio && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed">{data.bio}</p>
            </div>
          )}
          {images.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Image size={18} /> Clinic Photos</h2>
              <div className="grid grid-cols-3 gap-2">
                {images.map((m, i) => <img key={i} src={m.url} alt={m.caption||'Clinic'} className="rounded-xl object-cover w-full h-28" />)}
              </div>
            </div>
          )}
          {videos.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Video size={18} /> Treatment Videos</h2>
              {videos.map((v, i) => <video key={i} src={v.url} controls className="w-full rounded-xl mb-2" />)}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card border-2 border-primary/20">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={18} className="text-primary" /> Book Appointment</h3>
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} className="text-primary" /><span>{data.clinic_address}</span>
              </div>
              {(data.easypaisa_account || data.jazzcash_account) && (
                <div className="bg-accent rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Mobile Payment</p>
                  {data.easypaisa_account && <p className="text-sm font-medium">Easypaisa: {data.easypaisa_account}</p>}
                  {data.jazzcash_account && <p className="text-sm font-medium">JazzCash: {data.jazzcash_account}</p>}
                </div>
              )}
              <div className="text-center py-2">
                <p className="text-2xl font-bold text-primary">PKR {Number(data.consultation_fee).toLocaleString()}</p>
                <p className="text-xs text-gray-400">Consultation Fee</p>
              </div>
            </div>
            <Link to={`/patient/book/${data.id}`} className="btn-primary w-full text-center py-3 block">Book Now</Link>
          </div>
        </div>
      </div>
    </div>
  )
}