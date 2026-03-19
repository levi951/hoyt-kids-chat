# Hoyt GPT Chat Proxy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy a FastAPI chat proxy on Nash that gives all 8 Hoyt bots personality, KB access, and responds to the Hoyt GPT frontend.

**Architecture:** FastAPI server on Nash (45.55.247.244:8080), public-facing with API key auth. Each bot has a hardcoded personality + queries Tally Oracle for KB context. Frontend updated to POST to this proxy with API key header.

**Tech Stack:** Python 3.10+, FastAPI, uvicorn, httpx, anthropic SDK, systemd, React/TypeScript frontend

---

### Task 1: Create FastAPI proxy server

**Files:**
- Create: `/opt/hoyt-gpt-proxy/server.py`
- Create: `/opt/hoyt-gpt-proxy/requirements.txt`

**Step 1: SSH to Nash and create directory**
```bash
ssh -i ~/.ssh/hoyt-fleet-key root@45.55.247.244
mkdir -p /opt/hoyt-gpt-proxy
```

**Step 2: Write requirements.txt**
```
fastapi==0.110.0
uvicorn==0.27.1
httpx==0.27.0
anthropic==0.21.0
python-dotenv==1.0.1
```

**Step 3: Write server.py** (full code — see below)

**Step 4: Install dependencies**
```bash
cd /opt/hoyt-gpt-proxy
pip3 install -r requirements.txt
```

**Step 5: Test server starts**
```bash
HOYT_API_KEY=hoyt-gpt-key-2026 ANTHROPIC_API_KEY=sk-ant-... uvicorn server:app --host 0.0.0.0 --port 8080
# Expected: "Application startup complete"
curl http://localhost:8080/health
# Expected: {"status":"ok","service":"hoyt-gpt-proxy"}
```

---

### Task 2: Create systemd service

**Files:**
- Create: `/etc/systemd/system/hoyt-gpt-proxy.service`

**Step 1: Write service file**
```ini
[Unit]
Description=Hoyt GPT Chat Proxy
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/hoyt-gpt-proxy
EnvironmentFile=/opt/hoyt-gpt-proxy/.env
ExecStart=/usr/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8080
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**Step 2: Create .env file**
```bash
cat > /opt/hoyt-gpt-proxy/.env << 'ENVEOF'
HOYT_API_KEY=hoyt-gpt-key-2026
ANTHROPIC_API_KEY=<from /opt/openclaw.env>
ORACLE_URL=http://100.97.216.17:5001/ask-oracle
ORACLE_KEY=wraybot-key-001
ENVEOF
```

**Step 3: Enable and start**
```bash
systemctl daemon-reload
systemctl enable hoyt-gpt-proxy
systemctl start hoyt-gpt-proxy
systemctl status hoyt-gpt-proxy
# Expected: Active: active (running)
```

**Step 4: Open firewall port**
```bash
ufw allow 8080/tcp
# OR: iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
```

**Step 5: Verify externally**
```bash
curl http://45.55.247.244:8080/health
# Expected: {"status":"ok","service":"hoyt-gpt-proxy"}
```

---

### Task 3: Update App.tsx — swap webhook URLs to proxy

**Files:**
- Modify: `/Users/levihoyt/Code/hoyt-kids-chat/src/App.tsx`

**Step 1: Replace N8N_BASE_URL with proxy URL**

Change:
```typescript
const N8N_BASE_URL = 'http://100.72.252.5:5678/webhook'
const WEBHOOK_PATHS: Record<BotId, string> = { ... }
const getWebhookUrl = (botId: BotId): string => {
  return `${N8N_BASE_URL}/${WEBHOOK_PATHS[botId]}`
}
```

To:
```typescript
const CHAT_PROXY_URL = 'http://45.55.247.244:8080/chat'
const HOYT_API_KEY = 'hoyt-gpt-key-2026'

const getWebhookUrl = (_botId: BotId): string => {
  return CHAT_PROXY_URL
}

export { HOYT_API_KEY }
```

**Step 2: Commit**
```bash
git add src/App.tsx
git commit -m "feat: swap webhook URLs to hoyt-gpt-proxy on Nash"
```

---

### Task 4: Update Chat.tsx — add API key header + correct POST body

**Files:**
- Modify: `/Users/levihoyt/Code/hoyt-kids-chat/src/screens/Chat.tsx`

**Step 1: Find the fetch call in Chat.tsx and add X-Hoyt-Key header**

Change the fetch to:
```typescript
const res = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Hoyt-Key': 'hoyt-gpt-key-2026',
  },
  body: JSON.stringify({
    message: userMessage,
    userId: user.id,
    botId: bot.id,
    history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
  }),
})
const data = await res.json()
const reply = data.response || data.output || 'No response'
```

**Step 2: Commit**
```bash
git add src/screens/Chat.tsx
git commit -m "feat: add API key header to Chat.tsx fetch calls"
```

---

### Task 5: Update AudioChat.tsx — add API key header

**Files:**
- Modify: `/Users/levihoyt/Code/hoyt-kids-chat/src/screens/AudioChat.tsx`

**Step 1: Find the fetch call in AudioChat.tsx and add X-Hoyt-Key header**

Same pattern as Chat.tsx:
```typescript
const res = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Hoyt-Key': 'hoyt-gpt-key-2026',
  },
  body: JSON.stringify({
    message: transcript,
    userId: user.id,
    botId: bot.id,
    history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
  }),
})
```

**Step 2: Build and deploy**
```bash
cd /Users/levihoyt/Code/hoyt-kids-chat
npm run build
npx wrangler pages deploy dist/
git add -A && git commit -m "feat: add API key header to AudioChat.tsx"
git push origin main
```

---

### Task 6: End-to-end test

**Step 1: Test proxy directly**
```bash
curl -X POST http://45.55.247.244:8080/chat \
  -H "Content-Type: application/json" \
  -H "X-Hoyt-Key: hoyt-gpt-key-2026" \
  -d '{"message":"What is Hoyt Exteriors?","userId":"levi","botId":"wraybot","history":[]}'
# Expected: {"response":"<wraybot reply about Hoyt Exteriors>"}
```

**Step 2: Test auth rejection**
```bash
curl -X POST http://45.55.247.244:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","userId":"test","botId":"wraybot","history":[]}'
# Expected: {"detail":"Unauthorized"}
```

**Step 3: Test from the app**
- Open https://hoyt-gpt-82r.pages.dev/?user=levi&pass=hoyt2026
- Send a message as Wraybot
- Verify response comes back with bot personality

**Step 4: Test KB access**
- Ask Spike: "What does a typical siding repair cost?"
- Expected: Response includes actual data from the 5,216 job Oracle

