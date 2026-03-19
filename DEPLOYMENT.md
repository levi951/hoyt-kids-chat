# HOYT GPT — Deployment Guide

**Target Users:** Levi, John (Spike), Jonny (Mack), Lisa (Jane), Paul (Gage)
**Status:** Ready for deployment
**Timeline:** ~2 hours for full setup

---

## PHASE 1: FRONTEND DEPLOYMENT (15 minutes)

### Option A: Cloudflare Pages (Recommended)

1. **Push to GitHub:**
   ```bash
   cd /Users/levihoyt/Code/hoyt-kids-chat
   git push origin main
   ```

2. **Create Cloudflare Pages project:**
   - Go to dashboard.cloudflare.com → Pages
   - Connect Git repo: `levi951/hoyt-kids-chat`
   - Build settings:
     - Framework: Vite
     - Build command: `npm run build`
     - Build output: `dist`
   - Deploy

3. **Result:** Live at `https://hoyt-gpt.pages.dev` (or custom domain)

4. **Hide from public:**
   - Add Cloudflare WAF rule to require password
   - OR deploy behind authentication (Cloudflare Access)

### Option B: Vercel

1. Import from GitHub
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy

### Option C: Self-hosted (on DigitalOcean)

```bash
# SSH into a droplet
ssh root@YOUR_DROPLET_IP

# Install Node
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
cd /var/www
git clone https://github.com/levi951/hoyt-kids-chat.git
cd hoyt-kids-chat

# Install & build
npm install
npm run build

# Serve with nginx
sudo apt-get install -y nginx
# (configure nginx to serve /dist)

# Enable HTTPS with Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d hoyt-gpt.hoytexteriors.com
```

---

## PHASE 2: SUPABASE SCHEMA SETUP (10 minutes)

1. **Go to Supabase:**
   - Dashboard: https://app.supabase.com
   - Project: `zpvmkkuadsgfzutsmhfk`
   - SQL Editor

2. **Run schema:**
   ```sql
   -- Copy all SQL from SUPABASE-SETUP.sql
   -- Paste into Supabase SQL Editor
   -- Click "Run"
   ```

3. **Verify:**
   - Check "conversations" table exists
   - Check "user_context" table exists
   - Check all indexes created

---

## PHASE 3: N8N WORKFLOW SETUP (60 minutes)

### Step 1: Access n8n
- URL: https://n8n.hoytexteriors.com
- Log in with admin credentials

### Step 2: Set Environment Variables
In n8n settings (or `/opt/.env`):

```bash
ANTHROPIC_API_KEY=sk-ant-...  # Your Claude API key
CLAUDE_MODEL=claude-opus-4
SUPABASE_URL=https://zpvmkkuadsgfzutsmhfk.supabase.co
SUPABASE_API_KEY=eyJhb...  # From Supabase Settings → API
ORACLE_URL=http://tally:5001
ORACLE_API_KEY=spike-key-001
```

### Step 3: Create Workflows
For each bot (spike, wraybot, mack, jane, gage):

1. **New Workflow** → name it `{bot-name}-chat`
2. **Add HTTP Trigger Node:**
   - Method: POST
   - Path: `/{bot-name}-chat`
   - Response: JSON

3. **Add workflow nodes** (see N8N-WORKFLOW-SETUP.md for details):
   - Parse Input
   - Load User Context (Supabase)
   - Load Conversation History
   - Process Files (if any)
   - Query Oracle
   - Build Context
   - Call Claude
   - Store Conversation
   - Return Response

4. **Test with cURL:**
   ```bash
   curl -X POST https://n8n.hoytexteriors.com/webhook/spike-chat \
     -H "Content-Type: application/json" \
     -d '{
       "message": "What jobs do I have?",
       "userId": "john",
       "botId": "spike",
       "sessionId": "test_1",
       "files": [],
       "history": []
     }'
   ```

5. **Publish workflow**

6. **Save webhook URL:** `https://n8n.hoytexteriors.com/webhook/{bot-name}-chat`

### 5 Workflows to Create:
- `spike-chat` → `/webhook/spike-chat`
- `wraybot-chat` → `/webhook/wraybot-chat`
- `mack-chat` → `/webhook/mack-chat`
- `jane-chat` → `/webhook/jane-chat`
- `gage-chat` → `/webhook/gage-chat`

---

## PHASE 4: TEST WEBHOOKS (15 minutes)

For each bot, test via cURL:

```bash
# Test Spike
curl -X POST https://n8n.hoytexteriors.com/webhook/spike-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello Spike",
    "userId": "john",
    "botId": "spike",
    "sessionId": "test_1",
    "files": [],
    "history": []
  }'

# Expect: 200 OK with response
{
  "response": "Hey John, what can I do for you?",
  "sessionId": "test_1",
  "tokensUsed": {"input": 123, "output": 45},
  "timestamp": 1710876654
}
```

---

## PHASE 5: DISTRIBUTE TO TEAM (10 minutes)

### For Team Members:

1. **Go to app:** https://hoyt-gpt.pages.dev (or your deployed URL)
2. **Enter password:** `hoyt2026`
3. **Select your profile:**
   - Levi → Wraybot
   - John → Spike
   - Jonny → Mack
   - Lisa → Jane
   - Paul → Gage
4. **Go to Settings**
5. **Paste webhook URL** from n8n
6. **Click "Save Webhook"**
7. **Test send message**

### iOS Home Screen Installation:
1. Open in Safari
2. Tap Share → "Add to Home Screen"
3. Name: "Hoyt GPT"
4. Now appears as app icon (works offline for UI, requires internet for chat)

### Android Chrome Installation:
1. Open in Chrome
2. Menu → "Install app"
3. Follow prompts

---

## CONFIGURATION GUIDE

### Update Password (optional):
Edit `/src/screens/Login.tsx`:
```typescript
const MASTER_PASSWORD = 'your-new-password'
```

### Update Bot List (optional):
Edit `/src/App.tsx`:
```typescript
const BOT_CATALOG = { ... }
const USER_ROSTER = { ... }
```

### Change Colors (optional):
Update `accentColor` in `BOT_CATALOG`:
```typescript
spike: { accentColor: '#C8C8C8', ... }
```

---

## TROUBLESHOOTING

### Issue: "Webhook not configured"
- **Solution:** Check webhook URL is saved in Settings
- **Check:** Settings page shows your webhook URL

### Issue: "Failed to send message"
- **Check:** Network tab in DevTools (should show POST to n8n)
- **Check:** n8n workflow is published
- **Check:** n8n logs for errors

### Issue: No response from bot
- **Check:** Supabase connection (run test query)
- **Check:** Claude API key is valid
- **Check:** n8n workflow has all required fields
- **Test:** cURL the webhook directly

### Issue: "Error loading user context"
- **Check:** Supabase credentials in n8n
- **Check:** user_context table exists
- **Check:** user_id matches (should be lowercase)

### Issue: Photos not uploading
- **Check:** File size < 20MB
- **Check:** Format is JPG/PNG
- **Check:** Claude Vision API key has permission
- **Test:** cURL with base64 image

---

## MONITORING & MAINTENANCE

### Daily Checks:
- [ ] App is loading (no 500 errors)
- [ ] Webhooks are responding (< 2s latency)
- [ ] Supabase queries are fast
- [ ] Claude API isn't hitting rate limits

### Weekly Checks:
- [ ] Review conversation logs in Supabase
- [ ] Check n8n error logs
- [ ] Monitor token usage on Claude API
- [ ] Verify all 5 bots are responding

### Monthly Checks:
- [ ] Analyze conversation patterns
- [ ] Optimize slow queries
- [ ] Review audit logs
- [ ] Update bot personalities if needed

### Commands for Monitoring:

```bash
# SSH into n8n server
ssh root@n8n.hoytexteriors.com

# View n8n logs
tail -f /var/log/n8n.log

# Check Supabase (via psql)
psql -h aws-1-us-east-2.pooler.supabase.com -U postgres -d postgres
\c zpvmkkuadsgfzutsmhfk
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM repairs_identified;
```

---

## SECURITY CHECKLIST

- [x] Password protected (hoyt2026)
- [x] HTTPS enforced (Cloudflare/Let's Encrypt)
- [x] API keys stored in environment (not in code)
- [x] Conversation history stored encrypted in Supabase
- [ ] Rate limiting configured on n8n
- [ ] WAF rules set up (Cloudflare)
- [ ] Regular backups configured (Supabase auto)
- [ ] Audit logging enabled

---

## NEXT STEPS (Optional Enhancements)

1. **Multi-user authentication:**
   - Replace password with OAuth via Supabase Auth
   - Per-user account management

2. **Photo upload to S3:**
   - Store photos in Cloudflare R2 or AWS S3
   - Reference URLs in Supabase

3. **Email integration:**
   - Sync emails from OpenClaw bridge
   - Include email summaries in context

4. **Native mobile apps:**
   - Build React Native app from same codebase
   - iOS App Store / Google Play distribution

5. **Advanced analytics:**
   - Track which bots are most used
   - Monitor response latency
   - Cost tracking (Claude API spend)

6. **Voice input/output:**
   - Add voice recording to chat
   - Use Retell AI for voice responses (like Gage)

---

## SUPPORT

**Issues?**
1. Check n8n logs: `ssh n8n server → tail -f logs`
2. Check Supabase query: `Supabase SQL Editor → run test`
3. Check frontend: Browser DevTools → Network → check webhook response
4. Test webhook: Use cURL command above

**Contacts:**
- Claude (AI) - Implementation, debugging, workflow design
- Levi Hoyt - Business decisions, password changes, deployment approval

---

## FILES REFERENCE

- **Frontend:** `/Users/levihoyt/Code/hoyt-kids-chat/`
- **Supabase setup:** `SUPABASE-SETUP.sql` (in repo)
- **n8n workflows:** `N8N-WORKFLOW-SETUP.md` (in repo)
- **Architecture:** `N8N-WORKFLOW-BLUEPRINT.md` (in repo)

---

**Status:** ✅ Ready for Levi to deploy
**Deployment est. time:** 2 hours
**Go live target:** Today

*Built by Claude for Hoyt Exteriors. The company your dad tells you to call. 🚀*
