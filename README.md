# Chat Buddies

Simple, smart chat interface for kids, employees, and team members. Built on React + Tailwind with n8n webhook integration.

## Features

- 🦖 **Multiple Bots** — Raptor (The Forest Guardian) & Odysseus (The Deep Space Voyager)
- 💬 **Clean Chat UI** — Simple message interface with local message history
- ⚙️ **Settings** — Configure n8n webhook URLs for each bot
- 💾 **Local Storage** — Conversations persist per bot
- 📱 **Responsive** — Works on mobile & desktop
- 🎨 **Tailwind Styled** — Clean, modern design

## Getting Started

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

### Production Build

```bash
npm run build
```

Output is in `dist/` — ready for Cloudflare Pages, Netlify, or any static host.

## Architecture

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **State:** React hooks + localStorage
- **Backend:** n8n webhooks (POST `/message`)
- **Hosting:** Cloudflare Pages (auto-deploy from `main` branch)

## Webhook Integration

Each bot connects to an n8n webhook. Settings screen allows you to paste webhook URLs:

```
POST https://n8n.hoytexteriors.com/webhook/raptor-chat
Content-Type: application/json

{
  "message": "user message",
  "bot": "raptor",
  "history": [{ role: "user", content: "...", timestamp: 123456 }]
}
```

Expected response:

```json
{
  "response": "bot message here"
}
```

## Adding a New Bot

Edit `src/App.tsx` and add to `BOT_CONFIG`:

```typescript
newbot: {
  name: 'New Bot',
  subtitle: 'Description',
  icon: 'star',
  color: 'blue',
  primaryColor: '#0066cc',
  containerColor: '#ccddff',
}
```

## Deployment

### Cloudflare Pages

1. Connect GitHub repo to Cloudflare Pages dashboard
2. Set Build command: `npm run build`
3. Set Output directory: `dist`
4. Deploy!

That's it. Every push to `main` auto-deploys.

---

Built by Levi Hoyt + Claude. **The company your dad tells you to call.** 🚀
