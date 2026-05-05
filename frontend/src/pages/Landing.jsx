import { Link } from 'react-router-dom'
import { Search, Brain, Calendar, ShieldCheck, Star, ArrowRight } from 'lucide-react'
import Navbar from '../components/common/Navbar'

const features = [
  { icon: Brain,       title: 'AI Chatbot',          desc: 'Get instant dental guidance from our AI assistant — 24/7.',              color: 'bg-blue-50 text-blue-600' },
  { icon: Search,      title: 'Find Verified Doctors',desc: 'Discover PMDC-verified dental specialists near you.',                    color: 'bg-green-50 text-green-600' },
  { icon: Calendar,    title: 'Easy Booking',         desc: 'Browse real-time availability and book in under 2 minutes.',            color: 'bg-purple-50 text-purple-600' },
  { icon: ShieldCheck, title: 'AI Verification',      desc: 'Our OCR pipeline verifies doctor credentials automatically.',           color: 'bg-orange-50 text-orange-600' },
]

const stats = [
  { label: 'Verified Doctors', value: '200+' },
  { label: 'Appointments Booked', value: '5,000+' },
  { label: 'Cities Covered', value: '12+' },
  { label: 'Patient Satisfaction', value: '4.8★' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="gradient-hero text-white py-24 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI-Powered Dental Care Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white">
            Your Smile Deserves<br /><span className="text-yellow-300">Smart Care</span>
          </h1>
          <p className="text-xl text-white/85 max-w-2xl mx-auto mb-10">
            Connect with verified dentists near you. Get AI-powered consultations, book appointments, and manage your dental health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/doctors" className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg flex items-center gap-2 justify-center">
              <Search size={20} /> Find a Dentist
            </Link>
            <Link to="/register/patient" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 justify-center">
              Get Started Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-primary">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why CliniSmile?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gradient-hero text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-white/80 mb-8 text-lg">Join thousands of patients who found their perfect dentist on CliniSmile.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register/patient" className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg">Register as Patient</Link>
            <Link to="/register/doctor" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">Join as Doctor</Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10 px-4 text-center">
        <p className="text-xl font-bold text-white mb-2">🦷 CliniSmile</p>
        <p className="text-sm">Powered by Clinismile.</p>
        <p className="text-xs mt-4">© 2026 CliniSmile AI. All rights reserved.</p>
      </footer>
    </div>
  )
}