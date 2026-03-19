import { useEffect, useRef, useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface User {
  id: string
  name: string
  role: string
  botId: string
}

interface BotConfig {
  id: string
  name: string
  role: string
  icon: string
  accentColor: string
  description: string
}

interface ChatProps {
  user: User
  bot: BotConfig
  webhookUrl: string
  onSettingsOpen: () => void
  onLogout: () => void
  onAudioSwitch?: () => void
}

export default function Chat({ user, bot, webhookUrl, onSettingsOpen, onLogout, onAudioSwitch }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load conversation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`chat_${user.id}_${bot.id}`)
    if (saved) {
      setMessages(JSON.parse(saved))
    }
  }, [user.id, bot.id])

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
        headers: {
          'Content-Type': 'application/json',
          'X-Hoyt-Key': 'hoyt-gpt-key-2026',
        },
        body: JSON.stringify({
          message: input,
          userId: user.id,
          botId: bot.id,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
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
        localStorage.setItem(`chat_${user.id}_${bot.id}`, JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Check your webhook URL in settings.',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black border-b border-gray-900 flex items-center justify-between px-3 sm:px-6 h-16 sm:h-20">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: bot.accentColor }}
          >
            <span
              className="material-symbols-outlined text-base sm:text-lg text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {bot.icon}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-xs sm:text-sm uppercase tracking-widest truncate" style={{ color: bot.accentColor }}>
              {bot.name}
            </h1>
            <p className="text-gray-500 text-xs truncate">{user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {onAudioSwitch && (
            <button
              onClick={onAudioSwitch}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-900 transition-colors rounded text-sm sm:text-base"
              title="Voice Chat"
            >
              <span className="material-symbols-outlined text-gray-400 hover:text-white">mic</span>
            </button>
          )}
          <button
            onClick={onSettingsOpen}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-900 transition-colors rounded text-sm sm:text-base"
            title="Settings"
          >
            <span className="material-symbols-outlined text-gray-400 hover:text-white">settings</span>
          </button>
          <button
            onClick={onLogout}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-900 transition-colors rounded text-sm sm:text-base"
            title="Logout"
          >
            <span className="material-symbols-outlined text-gray-400 hover:text-white">logout</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 mt-16 sm:mt-20 mb-24 sm:mb-32 px-3 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12 sm:py-16 mt-8 sm:mt-12">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded flex items-center justify-center mx-auto mb-4 sm:mb-6"
                style={{ backgroundColor: bot.accentColor }}
              >
                <span
                  className="material-symbols-outlined text-4xl sm:text-5xl text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {bot.icon}
                </span>
              </div>
              <h2 className="font-black text-xl sm:text-2xl mb-2">{bot.name}</h2>
              <p className="text-gray-500 text-xs sm:text-sm px-4">{bot.description}</p>
              {!webhookUrl && (
                <p className="text-red-500 text-xs mt-4">
                  ⚠️ Webhook not configured. Go to Settings to add your webhook URL.
                </p>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: bot.accentColor }}
                >
                  <span
                    className="material-symbols-outlined text-xs sm:text-sm text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {bot.icon}
                  </span>
                </div>
              )}
              <div
                className={`px-3 sm:px-5 py-2 sm:py-3 rounded-lg max-w-xs sm:max-w-md ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-none ml-auto'
                    : 'bg-gray-900 text-white rounded-bl-none border border-gray-800'
                }`}
                style={msg.role === 'user' ? { borderTop: `2px solid ${bot.accentColor}` } : {}}
              >
                <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-2 sm:gap-3">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: bot.accentColor }}
              >
                <span
                  className="material-symbols-outlined text-xs sm:text-sm text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {bot.icon}
                </span>
              </div>
              <div className="flex gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-900">
                {[0, 0.2, 0.4].map((delay) => (
                  <div
                    key={delay}
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor: bot.accentColor,
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
      <footer className="fixed bottom-0 left-0 w-full px-3 sm:px-6 py-3 sm:py-4 bg-black border-t border-gray-900 safe-area-inset-bottom">
        <div className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Message ${bot.name}...`}
            className="flex-1 px-3 sm:px-5 py-2 sm:py-3 bg-gray-900 border border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-600 focus:outline-none rounded transition-colors text-xs sm:text-base"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading || !webhookUrl}
            className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center text-white rounded transition-all disabled:opacity-30"
            style={{ backgroundColor: bot.accentColor }}
            title="Send message"
          >
            <span className="material-symbols-outlined text-sm sm:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
          </button>
        </div>
      </footer>
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
