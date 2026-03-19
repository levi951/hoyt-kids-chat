import { useState } from 'react'

interface User {
  id: string
  name: string
  role: string
}

interface BotConfig {
  id: string
  name: string
  icon: string
  accentColor: string
}

interface SettingsProps {
  user: User
  bot: BotConfig
  webhookUrl: string
  onWebhookUpdate: (url: string) => void
  onBack: () => void
  onLogout: () => void
}

export default function Settings({ user, bot, webhookUrl, onWebhookUpdate, onBack, onLogout }: SettingsProps) {
  const [url, setUrl] = useState(webhookUrl)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onWebhookUpdate(url)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256&data=${encodeURIComponent(url)}`

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black border-b border-gray-900 flex items-center justify-between px-6 h-20">
        <h1 className="font-black text-sm uppercase tracking-widest" style={{ color: bot.accentColor }}>
          Settings
        </h1>
        <button
          onClick={onLogout}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-900 transition-colors rounded"
        >
          <span className="material-symbols-outlined text-gray-400 hover:text-white">logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* User Info */}
          <section className="pt-6">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">You are logged in as</p>
            <div className="flex items-center gap-4 p-6 bg-gray-950 border border-gray-800 rounded">
              <div
                className="w-12 h-12 rounded flex items-center justify-center text-white"
                style={{ backgroundColor: bot.accentColor }}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {bot.icon}
                </span>
              </div>
              <div>
                <p className="text-white font-bold">{user.name}</p>
                <p className="text-gray-500 text-xs">{user.role} → {bot.name}</p>
              </div>
            </div>
          </section>

          {/* Webhook Configuration */}
          <section>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">Webhook Configuration</p>

            <div className="space-y-6">
              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">
                  n8n Webhook URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://n8n.hoytexteriors.com/webhook/..."
                  className="w-full px-5 py-3 bg-gray-950 border border-gray-800 focus:border-gray-700 text-white placeholder:text-gray-600 focus:outline-none rounded transition-colors font-mono text-sm"
                />
                <p className="text-gray-600 text-xs mt-2">
                  Paste the full webhook URL from your n8n workflow here.
                </p>
              </div>

              {/* QR Code Display */}
              {url && (
                <div className="p-6 bg-gray-950 border border-gray-800 rounded space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">QR Code Setup</p>
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={qrUrl}
                      alt="Webhook URL QR Code"
                      className="w-48 h-48 p-2 bg-white rounded"
                    />
                    <p className="text-gray-600 text-xs text-center">
                      Scan this code to share your webhook URL with another device
                    </p>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!url.trim()}
                className="w-full py-4 text-white font-bold uppercase tracking-widest rounded transition-all disabled:opacity-30"
                style={{
                  backgroundColor: url.trim() ? bot.accentColor : '#333',
                }}
              >
                {saved ? '✓ Saved' : 'Save Webhook'}
              </button>
            </div>
          </section>

          {/* API Reference */}
          <section className="pb-12">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">API Reference</p>
            <div className="p-6 bg-gray-950 border border-gray-800 rounded font-mono text-xs space-y-4">
              <div>
                <p className="text-gray-400 mb-2">REQUEST:</p>
                <pre className="text-gray-300 overflow-x-auto">
{`POST ${url || '[your-webhook-url]'}
Content-Type: application/json

{
  "message": "user message",
  "userId": "${user.id}",
  "botId": "${bot.id}",
  "history": [...]
}`}
                </pre>
              </div>
              <div>
                <p className="text-gray-400 mb-2">RESPONSE:</p>
                <pre className="text-gray-300 overflow-x-auto">
{`{
  "response": "bot reply here"
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-full py-3 border border-gray-800 hover:border-gray-700 bg-gray-950 hover:bg-gray-900 transition-all text-gray-400 hover:text-white font-bold rounded"
          >
            Back to Chat
          </button>
        </div>
      </main>
    </div>
  )
}
