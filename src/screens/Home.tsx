import { ReactNode } from 'react'

interface BotConfig {
  raptor: { name: string; subtitle: string; icon: string; color: string }
  odysseus: { name: string; subtitle: string; icon: string; color: string }
}

interface HomeProps {
  botConfig: BotConfig
  onSelectBot: (bot: 'raptor' | 'odysseus') => void
  onOpenSettings: () => void
}

export default function Home({ botConfig, onSelectBot, onOpenSettings }: HomeProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_0_rgba(0,0,0,0.06)] flex items-center justify-between px-6 h-20">
        <h1 className="font-bold text-2xl" style={{ color: '#006947' }}>
          Chat Buddies
        </h1>
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full hover:scale-95 transition-transform active:scale-95"
          style={{ backgroundColor: '#e5e9eb' }}
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-20 mb-24 px-4 py-12 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Welcome */}
          <div className="text-center mb-12">
            <h2 className="font-black text-4xl mb-2" style={{ color: '#006947' }}>
              Who do you want to chat with?
            </h2>
            <p className="text-gray-600 text-lg">Pick your buddy and start exploring!</p>
          </div>

          {/* Bot Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raptor Card */}
            <BotCard
              name={botConfig.raptor.name}
              subtitle={botConfig.raptor.subtitle}
              icon={botConfig.raptor.icon}
              color="#006947"
              containerBg="#69f6b8"
              onClick={() => onSelectBot('raptor')}
            />

            {/* Odysseus Card */}
            <BotCard
              name={botConfig.odysseus.name}
              subtitle={botConfig.odysseus.subtitle}
              icon={botConfig.odysseus.icon}
              color="#702ae1"
              containerBg="#dcc9ff"
              onClick={() => onSelectBot('odysseus')}
            />
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full h-24 flex justify-around items-center px-4 pb-4 bg-white/80 backdrop-blur-xl shadow-[0_-12px_40px_0_rgba(0,0,0,0.06)] rounded-t-3xl z-50">
        <NavItem icon="pets" label="Raptor" active={false} />
        <NavItem icon="grid_view" label="Home" active={true} />
        <NavItem icon="rocket_launch" label="Odysseus" active={false} />
      </nav>
    </div>
  )
}

interface BotCardProps {
  name: string
  subtitle: string
  icon: string
  color: string
  containerBg: string
  onClick: () => void
}

function BotCard({ name, subtitle, icon, color, containerBg, onClick }: BotCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-left p-8 rounded-2xl transition-all hover:shadow-lg active:scale-95"
      style={{ backgroundColor: containerBg, color }}
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: color }}>
        <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <h3 className="font-bold text-2xl mb-1">{name}</h3>
      <p className="opacity-80">{subtitle}</p>
    </button>
  )
}

interface NavItemProps {
  icon: string
  label: string
  active: boolean
}

function NavItem({ icon, label, active }: NavItemProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-2 rounded-2xl transition-all ${
        active ? 'bg-teal-100' : 'hover:bg-gray-100'
      }`}
      style={active ? { color: '#006947' } : {}}
    >
      <span className="material-symbols-outlined mb-1">{icon}</span>
      <span className="font-medium text-xs">{label}</span>
    </div>
  )
}
