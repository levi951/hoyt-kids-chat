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

// Simple password protection - these can be changed via environment variables
const MASTER_PASSWORD = 'hoyt2026'

export default function Login({ onLogin, users }: LoginProps) {
  const [loginMode, setLoginMode] = useState<'password' | 'username'>('password')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const userList = Object.values(users).sort((a, b) => a.name.localeCompare(b.name))

  const handlePasswordSubmit = () => {
    if (password === MASTER_PASSWORD) {
      setAuthenticated(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
      setTimeout(() => setPasswordError(false), 3000)
    }
  }

  const handleUsernameSelect = (userId: string) => {
    onLogin(userId)
  }

  const handleUsernameEntry = () => {
    if (username.trim()) {
      onLogin(username)
    }
  }

  // Password gate - show before anything else
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black mb-2" style={{ color: '#AF0808' }}>
              HOYT
            </h1>
            <p className="text-gray-400 text-sm uppercase tracking-widest">AI Crew Portal</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Enter access code"
              className={`w-full px-6 py-4 bg-gray-950 border ${
                passwordError ? 'border-red-600' : 'border-gray-800 focus:border-gray-700'
              } text-white placeholder:text-gray-600 focus:outline-none transition-colors text-center tracking-widest`}
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm text-center font-bold">Access denied. Try again.</p>
            )}
            <button
              onClick={handlePasswordSubmit}
              className="w-full py-4 text-white font-black uppercase tracking-widest transition-all"
              style={{ backgroundColor: '#AF0808' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#8B0606')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#AF0808')}
            >
              Access
            </button>
          </div>

          <footer className="text-center text-gray-600 text-xs mt-12">
            <p>The company your dad tells you to call. © 2026 Hoyt Exteriors.</p>
          </footer>
        </div>
      </div>
    )
  }

  // Main login - after password auth
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-red-900 px-6 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black" style={{ color: '#AF0808' }}>
              HOYT
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">AI Crew Access Portal</p>
          </div>
          <button
            onClick={() => {
              setAuthenticated(false)
              setPassword('')
            }}
            className="text-gray-600 hover:text-red-500 transition-colors text-sm"
            title="Logout"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Branding */}
          <div className="mb-8 sm:mb-12">
            <p className="text-gray-500 text-xs sm:text-sm tracking-widest">WELCOME BACK</p>
            <h2 className="text-white text-2xl sm:text-3xl font-black mt-2">Connect to Your Bot</h2>
          </div>

          {/* Quick Select or Manual Entry */}
          {loginMode === 'username' ? (
            <>
              {/* Quick Select Grid */}
              <div className="mb-6 sm:mb-8">
                <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 uppercase tracking-widest">Select Your Profile</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {userList.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUsernameSelect(user.id)}
                      className="group p-4 sm:p-6 border border-gray-800 hover:border-red-900 bg-gray-950 hover:bg-gray-900 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold group-hover:text-red-500 transition-colors text-sm sm:text-base">
                            {user.name}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">{user.role}</p>
                        </div>
                        <span className="text-gray-700 group-hover:text-red-500 transition-colors material-symbols-outlined text-lg sm:text-2xl">
                          arrow_forward
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6 sm:my-8">
                <div className="flex-1 border-t border-gray-800"></div>
                <span className="text-gray-600 text-xs uppercase tracking-widest">or</span>
                <div className="flex-1 border-t border-gray-800"></div>
              </div>

              {/* Manual Entry Prompt */}
              <button
                onClick={() => setLoginMode('manual')}
                className="w-full py-3 sm:py-4 border border-gray-800 hover:border-red-900 bg-gray-950 hover:bg-gray-900 transition-all text-gray-400 hover:text-red-500 font-bold text-sm sm:text-base"
              >
                Enter Username Manually
              </button>
            </>
          ) : (
            <>
              {/* Manual Entry Form */}
              <div className="mb-6 sm:mb-8">
                <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 uppercase tracking-widest">Manual Access</p>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUsernameEntry()}
                    placeholder="Enter username (e.g., levi, john, lisa)"
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-950 border border-gray-800 focus:border-red-900 text-white placeholder:text-gray-600 focus:outline-none transition-colors text-sm sm:text-base"
                    autoFocus
                  />
                  <button
                    onClick={handleUsernameEntry}
                    disabled={!username.trim()}
                    className="w-full py-3 sm:py-4 text-white font-bold bg-red-900 hover:bg-red-800 disabled:bg-gray-800 disabled:text-gray-500 transition-all text-sm sm:text-base"
                    style={{ backgroundColor: username.trim() ? '#AF0808' : '#333' }}
                  >
                    Access My Bot
                  </button>
                </div>
              </div>

              {/* Back to Quick Select */}
              <button
                onClick={() => {
                  setLoginMode('username')
                  setUsername('')
                }}
                className="w-full py-3 sm:py-4 border border-gray-800 hover:border-red-900 bg-gray-950 hover:bg-gray-900 transition-all text-gray-400 hover:text-red-500 font-bold text-sm sm:text-base"
              >
                Back to Quick Select
              </button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-6 py-4 sm:py-6 text-center text-gray-600 text-xs">
        <p>The company your dad tells you to call. © 2026 Hoyt Exteriors.</p>
      </footer>
    </div>
  )
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
