import { useEffect, useRef, useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface BotConfig {
  name: string
  subtitle: string
  icon: string
  primaryColor: string
  containerColor: string
}

interface ChatProps {
  bot: 'raptor' | 'odysseus'
  botConfig: BotConfig
  webhookUrl: string
  onBack: () => void
}

export default function Chat({ bot, botConfig, webhookUrl, onBack }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load conversation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`chat_${bot}`)
    if (saved) {
      setMessages(JSON.parse(saved))
    }
  }, [bot])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || !webhookUrl) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          bot,
          history: messages,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'I got your message!',
        timestamp: Date.now(),
      }

      setMessages((prev) => {
        const updated = [...prev, assistantMessage]
        localStorage.setItem(`chat_${bot}`, JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble understanding that. Can you try again?',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f7f9' }}>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_0_rgba(0,0,0,0.06)] flex items-center justify-between px-6 h-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-2xl hover:scale-95 transition-transform"
            style={{ color: botConfig.primaryColor }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-bold text-xl" style={{ color: botConfig.primaryColor }}>
            Chat Buddies
          </h1>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: botConfig.containerColor }}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ color: botConfig.primaryColor, fontVariationSettings: "'FILL' 1" }}
          >
            {botConfig.icon}
          </span>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 mt-20 mb-32 px-4 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                style={{ backgroundColor: botConfig.containerColor }}
              >
                <span
                  className="material-symbols-outlined text-6xl"
                  style={{ color: botConfig.primaryColor, fontVariationSettings: "'FILL' 1" }}
                >
                  {botConfig.icon}
                </span>
              </div>
              <h2 className="font-black text-3xl mb-2" style={{ color: botConfig.primaryColor }}>
                Meet {botConfig.name}
              </h2>
              <p className="text-gray-600">Say hello and start chatting!</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: botConfig.containerColor }}
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ color: botConfig.primaryColor, fontVariationSettings: "'FILL' 1" }}
                  >
                    {botConfig.icon}
                  </span>
                </div>
              )}
              <div
                className={`p-4 rounded-xl shadow-sm max-w-xs ${
                  msg.role === 'user'
                    ? 'bg-white text-gray-900 rounded-br-none'
                    : 'text-white rounded-bl-none'
                }`}
                style={msg.role === 'assistant' ? { backgroundColor: botConfig.containerColor } : {}}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-3">
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: botConfig.containerColor }}
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ color: botConfig.primaryColor }}
                >
                  {botConfig.icon}
                </span>
              </div>
              <div className="flex gap-1.5 p-3 rounded-full" style={{ backgroundColor: botConfig.containerColor }}>
                {[0, 0.2, 0.4].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor: botConfig.primaryColor,
                      animationDelay: `${delay}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      <footer className="fixed bottom-24 left-0 w-full px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3 bg-gray-100 p-2 rounded-lg shadow-xl">
          <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-600 hover:scale-95 transition-transform">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              add
            </span>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Message ${botConfig.name}...`}
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 placeholder:text-gray-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
            style={{ backgroundColor: botConfig.primaryColor }}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
          </button>
        </div>
      </footer>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full h-24 flex justify-around items-center px-4 pb-4 bg-white/80 backdrop-blur-xl shadow-[0_-12px_40px_0_rgba(0,0,0,0.06)] rounded-t-3xl z-40">
        <NavLink icon="pets" label="Raptor" active={bot === 'raptor'} />
        <NavLink icon="grid_view" label="Home" active={false} onClick={onBack} />
        <NavLink icon="rocket_launch" label="Odysseus" active={bot === 'odysseus'} />
      </nav>
    </div>
  )
}

interface NavLinkProps {
  icon: string
  label: string
  active: boolean
  onClick?: () => void
}

function NavLink({ icon, label, active, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-6 py-2 rounded-2xl transition-all ${
        active ? 'bg-teal-100' : 'hover:bg-gray-100'
      }`}
      style={active ? { color: '#006947' } : {}}
    >
      <span className="material-symbols-outlined mb-1">{icon}</span>
      <span className="font-medium text-xs">{label}</span>
    </button>
  )
}
