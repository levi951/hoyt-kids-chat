import { useState } from 'react'

interface BotConfig {
  raptor: { name: string; subtitle: string; icon: string; primaryColor: string; containerColor: string }
  odysseus: { name: string; subtitle: string; icon: string; primaryColor: string; containerColor: string }
}

interface SettingsProps {
  botConfig: BotConfig
  webhookUrls: Record<'raptor' | 'odysseus', string>
  onSave: (urls: Record<'raptor' | 'odysseus', string>) => void
  onBack: () => void
}

export default function Settings({ botConfig, webhookUrls, onSave, onBack }: SettingsProps) {
  const [urls, setUrls] = useState(webhookUrls)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave(urls)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f7f9' }}>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_0_rgba(0,0,0,0.06)] flex items-center justify-between px-6 h-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-2xl hover:scale-95 transition-transform text-teal-600"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-bold text-xl text-teal-600">Chat Buddies</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-28 pb-32 px-6 max-w-2xl mx-auto w-full">
        <header className="mb-10">
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Buddy Connections</h2>
          <p className="text-gray-600 text-lg">Connect your explorers to their webhooks.</p>
        </header>

        {/* Connection Cards */}
        <div className="grid gap-6">
          {/* Raptor Card */}
          <SettingCard
            name={botConfig.raptor.name}
            subtitle={botConfig.raptor.subtitle}
            icon={botConfig.raptor.icon}
            color={botConfig.raptor.primaryColor}
            containerBg={botConfig.raptor.containerColor}
            webhook={urls.raptor}
            onWebhookChange={(val) => setUrls({ ...urls, raptor: val })}
            status="Connected"
          />

          {/* Odysseus Card */}
          <SettingCard
            name={botConfig.odysseus.name}
            subtitle={botConfig.odysseus.subtitle}
            icon={botConfig.odysseus.icon}
            color={botConfig.odysseus.primaryColor}
            containerBg={botConfig.odysseus.containerColor}
            webhook={urls.odysseus}
            onWebhookChange={(val) => setUrls({ ...urls, odysseus: val })}
            status="Connected"
          />
        </div>

        {/* Save Button */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="w-full py-4 text-white font-bold text-lg rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
            style={{ backgroundColor: '#006947' }}
          >
            <span className="material-symbols-outlined">save</span>
            {saved ? 'Saved!' : 'Save Connections'}
          </button>
          <button className="w-full py-4 text-gray-600 font-bold text-sm hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xl">help</span>
            How do I find my Webhook URLs?
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-xl p-6 flex items-start gap-6">
          <div className="bg-yellow-500 w-14 h-14 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Pro Tip</h4>
            <p className="text-gray-700 text-sm">Once connected, your buddies can learn from conversations in real-time!</p>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full h-24 flex justify-around items-center px-4 pb-4 bg-white/80 backdrop-blur-xl shadow-[0_-12px_40px_0_rgba(0,0,0,0.06)] rounded-t-3xl z-50">
        <NavLink icon="pets" label="Raptor" />
        <NavLink icon="grid_view" label="Home" />
        <NavLink icon="rocket_launch" label="Odysseus" />
      </nav>
    </div>
  )
}

interface SettingCardProps {
  name: string
  subtitle: string
  icon: string
  color: string
  containerBg: string
  webhook: string
  onWebhookChange: (value: string) => void
  status: string
}

function SettingCard({
  name,
  subtitle,
  icon,
  color,
  containerBg,
  webhook,
  onWebhookChange,
  status,
}: SettingCardProps) {
  return (
    <div
      className="rounded-xl p-8 transition-all hover:shadow-lg relative overflow-hidden"
      style={{ backgroundColor: '#eef1f3' }}
    >
      {/* Status Badge */}
      <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ backgroundColor: `${color}20` }}>
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          {status}
        </span>
      </div>

      {/* Bot Info */}
      <div className="flex items-start gap-5 mb-8">
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
        >
          <span
            className="material-symbols-outlined text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-bold" style={{ color }}>
            {name}
          </h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <label className="font-bold text-gray-600 text-sm px-2 block">
          n8n Webhook URL ({name})
        </label>
        <div className="relative">
          <input
            type="text"
            value={webhook}
            onChange={(e) => onWebhookChange(e.target.value)}
            placeholder="Paste webhook URL here..."
            className="w-full border-none rounded-lg px-6 py-4 text-gray-900 focus:ring-2 transition-all shadow-sm"
            style={{ '--ring-color': color } as any}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">
            link
          </span>
        </div>
      </div>
    </div>
  )
}

interface NavLinkProps {
  icon: string
  label: string
}

function NavLink({ icon, label }: NavLinkProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-2 rounded-2xl hover:bg-gray-100 transition-all">
      <span className="material-symbols-outlined mb-1 text-2xl text-gray-500">{icon}</span>
      <span className="font-medium text-xs text-gray-500">{label}</span>
    </div>
  )
}
