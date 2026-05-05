import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Search, MapPin, Star } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import { doctorsAPI } from '../services/api'
import toast from 'react-hot-toast'

const specialties = ['All','General Dentist','Orthodontist','Periodontist','Endodontist','Prosthodontist','Oral Surgeon']

function DoctorCard({ item }) {
  const d = item.doctor
  return (
    <div className="card hover:shadow-hover fade-in">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {d.full_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900">Dr. {d.full_name}</h3>
          <p className="text-sm text-primary font-medium">{d.specialty}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={12} /> {d.clinic_name} · {d.city}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            {Number(d.average_rating).toFixed(1)}
          </span>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-900">PKR {Number(d.consultation_fee).toLocaleString()}</span>
        </div>
        <Link to={`/doctors/${d.id}`} className="btn-primary text-sm px-4 py-2">Book</Link>
      </div>
      {item.distance_km && (
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <MapPin size={11} /> {item.distance_km.toFixed(1)} km away
        </p>
      )}
    </div>
  )
}

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [city, setCity] = useState('')
  const [specialty, setSpecialty] = useState('All')
  const [view, setView] = useState('list')

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = {}
      if (city) params.city = city
      if (specialty !== 'All') params.specialty = specialty
      const { data } = await doctorsAPI.search(params)
      setDoctors(data.data || [])
    } catch { toast.error('Failed to load doctors') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDoctors() }, [])

  const mapCenter = [33.6844, 73.0479]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="gradient-hero py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Find a Verified Dentist</h1>
          <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input className="input pl-10" placeholder="Search by city or clinic name..."
                value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <select className="input md:w-52" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              {specialties.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="btn-primary px-8" onClick={fetchDoctors}>Search</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <p className="text-gray-500 text-sm">{doctors.length} doctors found</p>
        <div className="flex gap-2">
          {['list','map'].map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${view===v?'bg-primary text-white':'bg-white text-gray-600 border border-gray-200'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {view === 'list' ? (
          loading ? <div className="text-center py-20 text-gray-400">Loading doctors...</div> :
          doctors.length === 0 ? (
            <div className="text-center py-20"><p className="text-2xl mb-2">🦷</p><p className="text-gray-500">No doctors found.</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((item, i) => <DoctorCard key={i} item={item} />)}
            </div>
          )
        ) : (
          <div className="h-[600px] rounded-2xl overflow-hidden shadow-card">
            <MapContainer center={mapCenter} zoom={12} style={{ height:'100%', width:'100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
              {doctors.map((item, i) => {
                const d = item.doctor
                if (!d.latitude || !d.longitude) return null
                return (
                  <Marker key={i} position={[d.latitude, d.longitude]}>
                    <Popup>
                      <strong>Dr. {d.full_name}</strong><br />
                      {d.specialty}<br />
                      PKR {Number(d.consultation_fee).toLocaleString()}<br />
                      <Link to={`/doctors/${d.id}`} className="text-primary font-medium">View Profile →</Link>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  )
}