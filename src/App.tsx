import { useState, useEffect } from 'react'
import Login from './screens/Login'
import Chat from './screens/Chat'
import AudioChat from './screens/AudioChat'
import Settings from './screens/Settings'

type Screen = 'login' | 'chat' | 'audio' | 'settings'
type BotId = 'wraybot' | 'spike' | 'mack' | 'jane' | 'tally' | 'gage' | 'raptor' | 'odysseus' | 'betty' | 'nash'

interface User {
  id: string
  name: string
  role: string
  botId: BotId
}

interface BotConfig {
  id: BotId
  name: string
  role: string
  icon: string
  accentColor: string
  description: string
}

// Noir aesthetic: Black + Hoyt Red (#AF0808) + Stainless (#C8C8C8)
const BOT_CATALOG: Record<BotId, BotConfig> = {
  wraybot: { id: 'wraybot', name: 'Wraybot', role: 'Master Controller', icon: 'admin_panel_settings', accentColor: '#AF0808', description: 'The Command Center' },
  spike: { id: 'spike', name: 'Spike', role: 'Field Operations', icon: 'construction', accentColor: '#C8C8C8', description: 'Service & Field Ops' },
  mack: { id: 'mack', name: 'Mack', role: 'Project Manager', icon: 'directions_run', accentColor: '#AF0808', description: 'Routing & Scheduling' },
  jane: { id: 'jane', name: 'Jane', role: 'Office Manager', icon: 'folder_open', accentColor: '#C8C8C8', description: 'Admin & Billing' },
  tally: { id: 'tally', name: 'Tally', role: 'Accounting Vault', icon: 'security', accentColor: '#AF0808', description: 'Financial Intelligence' },
  gage: { id: 'gage', name: 'Gage', role: 'Voice Agent', icon: 'phone', accentColor: '#C8C8C8', description: 'Inbound Handler' },
  raptor: { id: 'raptor', name: 'Raptor', role: 'Dino Companion', icon: 'pets', accentColor: '#00D474', description: 'Clever. Fast. Ready for adventure. 🦖' },
  odysseus: { id: 'odysseus', name: 'Odysseus', role: 'Myth Guide', icon: 'rocket_launch', accentColor: '#9945FF', description: 'Deep thoughts. Cosmic journeys. Always here.' },
  betty: { id: 'betty', name: 'Betty', role: 'Cosmic Grandma', icon: 'star', accentColor: '#00D4FF', description: 'Love, wisdom, and cosmic wonder ✨' },
  nash: { id: 'nash', name: 'Nash', role: 'Automation Engine', icon: 'precision_manufacturing', accentColor: '#C8C8C8', description: 'n8n Backbone' },
}

// User → Bot mapping
const USER_ROSTER: Record<string, User> = {
  levi: { id: 'levi', name: 'Levi Hoyt', role: 'Owner', botId: 'wraybot' },
  john: { id: 'john', name: 'John', role: 'Service Manager', botId: 'spike' },
  jonny: { id: 'jonny', name: 'Jonny', role: 'Project Manager', botId: 'mack' },
  lisa: { id: 'lisa', name: 'Lisa', role: 'Office Manager', botId: 'jane' },
  paul: { id: 'paul', name: 'Paul Hoyt', role: 'Patriarch', botId: 'gage' },
  logan: { id: 'logan', name: 'Logan', role: 'Explorer', botId: 'raptor' },
  sophia: { id: 'sophia', name: 'Sophia', role: 'Scholar', botId: 'odysseus' },
  kelly: { id: 'kelly', name: 'Kelly', role: 'Family', botId: 'betty' },
}

// Phone numbers for team members (easy password alternative)
const PHONE_CREDENTIALS: Record<string, string> = {
  '612-323-2406': 'john',      // John's phone
  '612-867-5309': 'jonny',     // Jonny's phone (placeholder)
  '612-555-0123': 'lisa',      // Lisa's phone (placeholder)
  '651-212-4965': 'levi',      // Hoyt main line (Levi)
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentBot, setCurrentBot] = useState<BotConfig | null>(null)
  const [webhookUrl, setWebhookUrl] = useState<string>('')

  useEffect(() => {
    // Check URL parameters first (direct link: ?user=john&pass=hoyt2026)
    const params = new URLSearchParams(window.location.search)
    const urlUser = params.get('user')
    const urlPass = params.get('pass')

    if (urlUser && urlPass === 'hoyt2026') {
      // Direct link with password - auto-login
      const user = USER_ROSTER[urlUser.toLowerCase()]
      if (user) {
        setCurrentUser(user)
        setCurrentBot(BOT_CATALOG[user.botId])
        setWebhookUrl(localStorage.getItem(`webhook_${user.botId}`) || '')
        localStorage.setItem('hoyt_user', JSON.stringify(user))
        setScreen('chat')
        // Clean up URL (remove query params)
        window.history.replaceState({}, '', window.location.pathname)
        return
      }
    }

    // Otherwise check localStorage
    const saved = localStorage.getItem('hoyt_user')
    if (saved) {
      const user: User = JSON.parse(saved)
      setCurrentUser(user)
      setCurrentBot(BOT_CATALOG[user.botId as BotId])
      setWebhookUrl(localStorage.getItem(`webhook_${user.botId}`) || '')
      setScreen('chat')
    }
  }, [])

  const handleLogin = (username: string) => {
    const user = USER_ROSTER[username.toLowerCase()]
    if (user) {
      setCurrentUser(user)
      setCurrentBot(BOT_CATALOG[user.botId])
      setWebhookUrl(localStorage.getItem(`webhook_${user.botId}`) || '')
      localStorage.setItem('hoyt_user', JSON.stringify(user))
      setScreen('chat')
    }
  }

  // Phone + password auth (alternative to username selection)
  const handlePhoneLogin = (phone: string) => {
    const username = PHONE_CREDENTIALS[phone]
    if (username) {
      handleLogin(username)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentBot(null)
    localStorage.removeItem('hoyt_user')
    setScreen('login')
  }

  const handleWebhookUpdate = (url: string) => {
    if (currentUser) {
      setWebhookUrl(url)
      localStorage.setItem(`webhook_${currentUser.botId}`, url)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {screen === 'login' && <Login onLogin={handleLogin} onPhoneLogin={handlePhoneLogin} users={USER_ROSTER} phoneCredentials={PHONE_CREDENTIALS} />}
      {screen === 'chat' && currentUser && currentBot && (
        <Chat
          user={currentUser}
          bot={currentBot}
          webhookUrl={webhookUrl}
          onSettingsOpen={() => setScreen('settings')}
          onLogout={handleLogout}
          onAudioSwitch={() => setScreen('audio')}
        />
      )}
      {screen === 'audio' && currentUser && currentBot && (
        <AudioChat
          user={currentUser}
          bot={currentBot}
          webhookUrl={webhookUrl}
          onSettingsOpen={() => setScreen('settings')}
          onLogout={handleLogout}
        />
      )}
      {screen === 'settings' && currentUser && currentBot && (
        <Settings
          user={currentUser}
          bot={currentBot}
          webhookUrl={webhookUrl}
          onWebhookUpdate={handleWebhookUpdate}
          onBack={() => setScreen('chat')}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
