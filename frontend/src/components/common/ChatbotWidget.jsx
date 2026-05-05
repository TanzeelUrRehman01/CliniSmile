import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader } from 'lucide-react'
import { chatbotAPI } from '../../services/api'

const WELCOME = {
  role: 'assistant',
  content: `Hello! 👋 I'm CliniSmile AI's dental assistant.\n\nI can help you with:\n• Dental pain & symptoms\n• Oral hygiene advice\n• Treatment information\n• Finding a dentist\n\nWhat dental concern can I help you with today?\n\n⚠️ This is not a medical diagnosis. Please consult a licensed dentist.`,
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open && !sessionId) {
      chatbotAPI.startSession().then(({ data }) => setSessionId(data.session_id)).catch(() => {})
    }
  }, [open])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role:'user', content:text }])
    setLoading(true)
    try {
      const { data } = await chatbotAPI.sendMessage({ message:text, session_id:sessionId })
      setMessages((prev) => [...prev, { role:'assistant', content:data.data.response }])
    } catch {
      setMessages((prev) => [...prev, { role:'assistant', content:'Sorry, I encountered an error. Please try again.' }])
    } finally { setLoading(false) }
  }

  const handleKey = (e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${open?'bg-red-500 hover:bg-red-600':'gradient-hero hover:scale-110'}`}>
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[520px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 fade-in">
          <div className="gradient-hero px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">CliniSmile AI</p>
              <p className="text-white/70 text-xs">Dental Assistant • Online</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role==='user'?'flex-row-reverse':'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role==='user'?'bg-primary':'bg-secondary'}`}>
                  {msg.role==='user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                </div>
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role==='user'?'bg-primary text-white rounded-tr-sm':'bg-white text-gray-700 shadow-sm rounded-tl-sm border border-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"><Bot size={14} className="text-white" /></div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100"><Loader size={16} className="text-gray-400 animate-spin" /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2 items-end">
              <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Ask about your dental concern..."
                className="flex-1 input resize-none text-sm py-2.5 max-h-24" style={{ minHeight:'42px' }} />
              <button onClick={send} disabled={!input.trim()||loading}
                className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-40 flex items-center justify-center transition-all flex-shrink-0">
                <Send size={16} className="text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">Not a substitute for professional diagnosis</p>
          </div>
        </div>
      )}
    </>
  )
}