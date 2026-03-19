import { useState } from 'react'

interface User {
  id: string
  name: string
  role: string
}

interface LoginProps {
  onLogin: (username: string) => void
  users: Record<string, User>
}

export default function Login({ onLogin, users }: LoginProps) {
  const [input, setInput] = useState('')
  const [showQuickSelect, setShowQuickSelect] = useState(true)

  const userList = Object.values(users).sort((a, b) => a.name.localeCompare(b.name))

  const handleQuickSelect = (userId: string) => {
    onLogin(userId)
  }

  const handleManualLogin = () => {
    if (input.trim()) {
      onLogin(input)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-red-900 px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black" style={{ color: '#AF0808' }}>
            HOYT
          </h1>
          <p className="text-gray-400 text-sm mt-1">AI Crew Access Portal</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Branding */}
          <div className="mb-12">
            <p className="text-gray-500 text-sm tracking-widest">WELCOME BACK</p>
            <h2 className="text-white text-3xl font-black mt-2">Connect to Your Bot</h2>
          </div>

          {/* Quick Select or Manual Entry */}
          {showQuickSelect ? (
            <>
              {/* Quick Select Grid */}
              <div className="mb-8">
                <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest">Select Your Profile</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userList.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleQuickSelect(user.id)}
                      className="group p-6 border border-gray-800 hover:border-red-900 bg-gray-950 hover:bg-gray-900 transition-all text-left"
                      style={{ '--hover-color': '#AF0808' } as any}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold group-hover:text-red-500 transition-colors">{user.name}</p>
                          <p className="text-gray-500 text-xs mt-1">{user.role}</p>
                        </div>
                        <span className="text-gray-700 group-hover:text-red-500 transition-colors material-symbols-outlined">
                          arrow_forward
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 border-t border-gray-800"></div>
                <span className="text-gray-600 text-xs uppercase tracking-widest">or</span>
                <div className="flex-1 border-t border-gray-800"></div>
              </div>

              {/* Manual Entry Prompt */}
              <button
                onClick={() => setShowQuickSelect(false)}
                className="w-full py-4 border border-gray-800 hover:border-red-900 bg-gray-950 hover:bg-gray-900 transition-all text-gray-400 hover:text-red-500 font-bold"
              >
                Enter Username Manually
              </button>
            </>
          ) : (
            <>
              {/* Manual Entry Form */}
              <div className="mb-8">
                <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest">Manual Access</p>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualLogin()}
                    placeholder="Enter username (e.g., levi, john, lisa)"
                    className="w-full px-6 py-4 bg-gray-950 border border-gray-800 focus:border-red-900 text-white placeholder:text-gray-600 focus:outline-none transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={handleManualLogin}
                    disabled={!input.trim()}
                    className="w-full py-4 text-white font-bold bg-red-900 hover:bg-red-800 disabled:bg-gray-800 disabled:text-gray-500 transition-all"
                    style={{ backgroundColor: input.trim() ? '#AF0808' : '#333' }}
                  >
                    Access My Bot
                  </button>
                </div>
              </div>

              {/* Back to Quick Select */}
              <button
                onClick={() => setShowQuickSelect(true)}
                className="w-full py-4 border border-gray-800 hover:border-red-900 bg-gray-950 hover:bg-gray-900 transition-all text-gray-400 hover:text-red-500 font-bold"
              >
                Back to Quick Select
              </button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-6 py-6 text-center text-gray-600 text-xs">
        <p>The company your dad tells you to call. © 2026 Hoyt Exteriors.</p>
      </footer>
    </div>
  )
}
