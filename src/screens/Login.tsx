import { useState } from 'react'

interface User {
  id: string
  name: string
  role: string
}

interface LoginProps {
  onLogin: (username: string) => void
  onPhoneLogin: (phone: string) => void
  users: Record<string, User>
  phoneCredentials: Record<string, string>
}

// Simple password protection - these can be changed via environment variables
const MASTER_PASSWORD = 'hoyt2026'

export default function Login({ onLogin, onPhoneLogin, users, phoneCredentials }: LoginProps) {
  const [loginMode, setLoginMode] = useState<'password' | 'username' | 'phone'>('password')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [phonePassword, setPhonePassword] = useState('')
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

  const handlePhoneSubmit = () => {
    if (phonePassword === MASTER_PASSWORD && phone && phoneCredentials[phone]) {
      onPhoneLogin(phone)
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

          {/* Tab Selection: Quick Select, Manual, or Phone */}
          <div className="flex gap-2 mb-8 border-b border-gray-800">
            <button
              onClick={() => {
                setLoginMode('username')
                setPasswordError(false)
              }}
              className={`px-4 py-3 font-bold uppercase tracking-widest text-sm transition-colors border-b-2 ${
                loginMode === 'username'
                  ? 'text-red-500 border-red-500'
                  : 'text-gray-500 border-transparent hover:text-gray-400'
              }`}
            >
              Quick Select
            </button>
            <button
              onClick={() => {
                setLoginMode('phone')
                setPasswordError(false)
              }}
              className={`px-4 py-3 font-bold uppercase tracking-widest text-sm transition-colors border-b-2 ${
                loginMode === 'phone'
                  ? 'text-red-500 border-red-500'
                  : 'text-gray-500 border-transparent hover:text-gray-400'
              }`}
            >
              Phone
            </button>
          </div>

          {/* Quick Select or Phone Entry */}
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

              {/* Phone Entry Prompt */}
              <button
                onClick={() => setLoginMode('phone')}
                className="w-full py-3 sm:py-4 border border-gray-800 hover:border-red-900 bg-gray-950 hover:bg-gray-900 transition-all text-gray-400 hover:text-red-500 font-bold text-sm sm:text-base"
              >
                Phone Number Access
              </button>
            </>
          ) : loginMode === 'phone' ? (
            <>
              {/* Phone Login Form */}
              <div className="mb-6 sm:mb-8">
                <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 uppercase tracking-widest">Phone Number Access</p>
                <div className="space-y-4">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone (e.g., 612-323-2406)"
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-950 border border-gray-800 focus:border-red-900 text-white placeholder:text-gray-600 focus:outline-none transition-colors text-sm sm:text-base"
                    autoFocus
                  />
                  <input
                    type="password"
                    value={phonePassword}
                    onChange={(e) => setPhonePassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                    placeholder="Enter password"
                    className={`w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-950 border ${
                      passwordError ? 'border-red-600' : 'border-gray-800 focus:border-red-900'
                    } text-white placeholder:text-gray-600 focus:outline-none transition-colors text-sm sm:text-base`}
                  />
                  {passwordError && (
                    <p className="text-red-500 text-xs sm:text-sm text-center font-bold">Invalid phone or password. Try again.</p>
                  )}
                  <button
                    onClick={handlePhoneSubmit}
                    disabled={!phone || !phonePassword}
                    className="w-full py-3 sm:py-4 text-white font-bold uppercase tracking-widest rounded transition-all disabled:opacity-30 text-sm sm:text-base"
                    style={{
                      backgroundColor: phone && phonePassword ? '#AF0808' : '#333',
                    }}
                  >
                    Access My Bot
                  </button>
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={() => {
                  setLoginMode('username')
                  setPhone('')
                  setPhonePassword('')
                }}
                className="w-full py-3 sm:py-4 border border-gray-800 hover:border-red-900 bg-gray-950 hover:bg-gray-900 transition-all text-gray-400 hover:text-red-500 font-bold text-sm sm:text-base"
              >
                Back to Quick Select
              </button>
            </>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 px-6 py-4 sm:py-6 text-center text-gray-600 text-xs">
        <p>The company your dad tells you to call. © 2026 Hoyt Exteriors.</p>
      </footer>
    </div>
  )
}
