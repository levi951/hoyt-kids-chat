import { useState } from 'react'
import Home from './screens/Home'
import Chat from './screens/Chat'
import Settings from './screens/Settings'

type Screen = 'home' | 'chat' | 'settings'
type BotType = 'raptor' | 'odysseus'

const BOT_CONFIG = {
  raptor: {
    name: 'Raptor',
    subtitle: 'The Forest Guardian',
    icon: 'pets',
    color: 'teal',
    primaryColor: '#006947',
    containerColor: '#69f6b8',
  },
  odysseus: {
    name: 'Odysseus',
    subtitle: 'The Deep Space Voyager',
    icon: 'rocket_launch',
    color: 'blue',
    primaryColor: '#702ae1',
    containerColor: '#dcc9ff',
  },
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [activeBots, setActiveBots] = useState<BotType | null>(null)
  const [webhookUrls, setWebhookUrls] = useState<Record<BotType, string>>({
    raptor: localStorage.getItem('webhook_raptor') || '',
    odysseus: localStorage.getItem('webhook_odysseus') || '',
  })

  const handleSelectBot = (bot: BotType) => {
    setActiveBots(bot)
    setScreen('chat')
  }

  const handleSaveWebhooks = (urls: Record<BotType, string>) => {
    setWebhookUrls(urls)
    localStorage.setItem('webhook_raptor', urls.raptor)
    localStorage.setItem('webhook_odysseus', urls.odysseus)
  }

  const handleBack = () => {
    setScreen('home')
    setActiveBots(null)
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {screen === 'home' && (
        <Home
          botConfig={BOT_CONFIG}
          onSelectBot={handleSelectBot}
          onOpenSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'chat' && activeBots && (
        <Chat
          bot={activeBots}
          botConfig={BOT_CONFIG[activeBots]}
          webhookUrl={webhookUrls[activeBots]}
          onBack={handleBack}
        />
      )}
      {screen === 'settings' && (
        <Settings
          botConfig={BOT_CONFIG}
          webhookUrls={webhookUrls}
          onSave={handleSaveWebhooks}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}
