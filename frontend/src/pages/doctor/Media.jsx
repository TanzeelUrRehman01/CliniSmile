import { useState } from 'react'
import { Calendar, Clock, DollarSign, Image, Settings, Upload, Video } from 'lucide-react'
import Sidebar from '../../components/common/Sidebar'
import { doctorsAPI } from '../../services/api'
import toast from 'react-hot-toast'

const sidebarLinks = [
  { to:'/doctor/dashboard',    label:'Dashboard',    icon:Calendar },
  { to:'/doctor/appointments', label:'Appointments', icon:Clock },
  { to:'/doctor/availability', label:'Availability', icon:Settings },
  { to:'/doctor/earnings',     label:'Earnings',     icon:DollarSign },
  { to:'/doctor/media',        label:'Clinic Media', icon:Image },
]

export default function DoctorMedia() {
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [uploadingImg, setUploadingImg] = useState(false)
  const [uploadingVid, setUploadingVid] = useState(false)

  const uploadImage = async (e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 10*1024*1024) return toast.error('Max 10 MB')
    setUploadingImg(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const { data } = await doctorsAPI.uploadImage(fd)
      setImages((prev) => [...prev, data.url])
      toast.success('Image uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploadingImg(false) }
  }

  const uploadVideo = async (e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 50*1024*1024) return toast.error('Max 50 MB')
    setUploadingVid(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const { data } = await doctorsAPI.uploadVideo(fd)
      setVideos((prev) => [...prev, data.url])
      toast.success('Video uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploadingVid(false) }
  }

  return (
    <Sidebar links={sidebarLinks}>
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Clinic Media</h1>
        <p className="text-gray-500 text-sm mb-8">Upload photos and videos to attract more patients</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Image size={18} className="text-primary" /> Clinic Photos</h2>
            <label className="block border-2 border-dashed border-gray-300 hover:border-primary rounded-2xl p-8 text-center cursor-pointer transition-all mb-4">
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              <Upload size={28} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{uploadingImg ? 'Uploading...' : 'Click to upload (max 10 MB)'}</p>
            </label>
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((url, i) => <img key={i} src={url} alt="" className="w-full h-28 object-cover rounded-xl" />)}
              </div>
            )}
          </div>
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Video size={18} className="text-secondary" /> Treatment Videos</h2>
            <label className="block border-2 border-dashed border-gray-300 hover:border-secondary rounded-2xl p-8 text-center cursor-pointer transition-all mb-4">
              <input type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={uploadVideo} />
              <Upload size={28} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{uploadingVid ? 'Uploading...' : 'Click to upload (max 50 MB)'}</p>
            </label>
            {videos.length > 0 && videos.map((url, i) => <video key={i} src={url} controls className="w-full rounded-xl mb-2" />)}
          </div>
        </div>
      </div>
    </Sidebar>
  )
}