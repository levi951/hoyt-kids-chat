# 🚀 HOYT GPT — GO LIVE CHECKLIST

**Status:** Ready for deployment
**Target:** March 19, 2026
**Timeline:** 2 hours from now

---

## PHASE 1: FRONTEND (15 min) ✅ DONE

- [x] Code built and tested locally
- [x] Pushed to GitHub: `levi951/hoyt-kids-chat`
- [x] Cloudflare Pages connected (auto-deploy on push)
- [ ] **Verify live at:** https://hoyt-gpt.pages.dev

**Action:** Wait 2-3 min for Cloudflare build, then test the link above.

---

## PHASE 2: SUPABASE (10 min) ⏳ READY

**Status:** Schema SQL is in `/SUPABASE-SETUP.sql`

**Action:**
1. Go to https://app.supabase.com
2. Select project: `zpvmkkuadsgfzutsmhfk`
3. Click **SQL Editor**
4. Copy all SQL from `SUPABASE-SETUP.sql`
5. Paste into SQL Editor
6. Click **Run**
7. Verify 5 tables created (conversations, user_context, repairs_identified, bio_sync, audit_log)

**Verification query:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN
('conversations', 'user_context', 'repairs_identified', 'bio_sync', 'audit_log');
```

---

## PHASE 3: N8N WORKFLOWS (60 min) ⏳ READY

**Status:** 5 workflow JSONs ready in repo

### Step 1: Set Environment Variables (ONCE)
Go to n8n.hoytexteriors.com → **Settings** → **Environment**

Add these (ask Levi for actual values):
```
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-opus-4
SUPABASE_URL=https://zpvmkkuadsgfzutsmhfk.supabase.co
SUPABASE_API_KEY=...
ORACLE_URL=http://tally:5001
ORACLE_API_KEY=spike-key-001
```

### Step 2: Import 5 Workflows

For EACH workflow JSON file:

1. Go to n8n → **+** → **Import**
2. Paste JSON from:
   - `spike-chat-workflow.json`
   - `wraybot-chat-workflow.json`
   - `mack-chat-workflow.json`
   - `jane-chat-workflow.json`
   - `gage-chat-workflow.json`
3. Click **Import**
4. Click **Activate** toggle
5. **Copy webhook URL** (from Webhook node)

### Step 3: Test Each Workflow

```bash
# Test Spike
curl -X POST https://n8n.hoytexteriors.com/webhook/spike-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Spike","userId":"john","botId":"spike","sessionId":"test_1","files":[],"history":[]}'

# Test Wraybot
curl -X POST https://n8n.hoytexteriors.com/webhook/wraybot-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Wraybot","userId":"levi","botId":"wraybot","sessionId":"test_1","files":[],"history":[]}'

# Test Mack
curl -X POST https://n8n.hoytexteriors.com/webhook/mack-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Mack","userId":"jonny","botId":"mack","sessionId":"test_1","files":[],"history":[]}'

# Test Jane
curl -X POST https://n8n.hoytexteriors.com/webhook/jane-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Jane","userId":"lisa","botId":"jane","sessionId":"test_1","files":[],"history":[]}'

# Test Gage
curl -X POST https://n8n.hoytexteriors.com/webhook/gage-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Gage","userId":"paul","botId":"gage","sessionId":"test_1","files":[],"history":[]}'
```

Each should respond in <2 seconds with bot's personality.

---

## PHASE 4: FRONTEND → N8N CONNECTION (15 min) ⏳ READY

### Step 1: Get Webhook URLs from n8n
After activating all 5 workflows, you'll have:

```
spike-chat:    https://n8n.hoytexteriors.com/webhook/spike-chat
wraybot-chat:  https://n8n.hoytexteriors.com/webhook/wraybot-chat
mack-chat:     https://n8n.hoytexteriors.com/webhook/mack-chat
jane-chat:     https://n8n.hoytexteriors.com/webhook/jane-chat
gage-chat:     https://n8n.hoytexteriors.com/webhook/gage-chat
```

### Step 2: Configure in Frontend
Each team member:
1. Opens https://hoyt-gpt.pages.dev/?user=john&pass=hoyt2026 (example for John)
2. Clicks **⚙️ Settings**
3. Pastes webhook URL: `https://n8n.hoytexteriors.com/webhook/spike-chat`
4. Clicks **Save Webhook**
5. Sees QR code (optional - for sharing)
6. Clicks **Back to Chat**
7. Types a message → Should get response in <2 seconds

---

## PHASE 5: TEST END-TO-END (15 min) ⏳ READY

### Test as Levi:
1. Open: https://hoyt-gpt.pages.dev/?user=levi&pass=hoyt2026
2. Should auto-login to Wraybot
3. Go to Settings
4. Paste: `https://n8n.hoytexteriors.com/webhook/wraybot-chat`
5. Click Save
6. Back to Chat
7. Type: "Hello Wraybot"
8. Should see response in <2 seconds ✅

### Test as John:
1. Open: https://hoyt-gpt.pages.dev/?user=john&pass=hoyt2026
2. Should auto-login to Spike
3. Settings → paste spike webhook
4. Back to Chat
5. Type: "What's my status?"
6. Should see Spike's response ✅

### Verify Supabase Storage:
```sql
SELECT COUNT(*) FROM conversations;
-- Should show messages from tests above
```

---

## PHASE 6: DISTRIBUTE TO TEAM (15 min) ⏳ READY

Send each team member:

**For Levi:**
```
App: https://hoyt-gpt.pages.dev/?user=levi&pass=hoyt2026
Settings → Paste webhook: https://n8n.hoytexteriors.com/webhook/wraybot-chat
Chat with Wraybot!
```

**For John:**
```
App: https://hoyt-gpt.pages.dev/?user=john&pass=hoyt2026
Settings → Paste webhook: https://n8n.hoytexteriors.com/webhook/spike-chat
Chat with Spike!
```

**For Jonny:**
```
App: https://hoyt-gpt.pages.dev/?user=jonny&pass=hoyt2026
Settings → Paste webhook: https://n8n.hoytexteriors.com/webhook/mack-chat
Chat with Mack!
```

**For Lisa:**
```
App: https://hoyt-gpt.pages.dev/?user=lisa&pass=hoyt2026
Settings → Paste webhook: https://n8n.hoytexteriors.com/webhook/jane-chat
Chat with Jane!
```

**For Paul:**
```
App: https://hoyt-gpt.pages.dev/?user=paul&pass=hoyt2026
Settings → Paste webhook: https://n8n.hoytexteriors.com/webhook/gage-chat
Chat with Gage!
```

---

## FINAL VERIFICATION

- [ ] Frontend live at hoyt-gpt.pages.dev
- [ ] All 5 users can auto-login with direct links
- [ ] Supabase has 5 tables created
- [ ] All 5 n8n workflows imported and activated
- [ ] cURL tests pass for all 5 bots
- [ ] End-to-end test works (message sent → stored in DB → response received)
- [ ] Team members receive their webhook URLs
- [ ] Team can login and chat

---

## KNOWN ISSUES / GOTCHAS

**Issue:** App won't load
**Fix:** Clear browser cache, try incognito mode

**Issue:** Webhook returns 404
**Fix:** Check workflow is activated, path matches exactly

**Issue:** No response from bot
**Fix:** Check Supabase credentials, Anthropic API key has quota

**Issue:** Messages not saving
**Fix:** Check Supabase connection, verify conversations table exists

---

## SUCCESS METRICS

You'll know it's working when:

✅ App loads at hoyt-gpt.pages.dev
✅ Password gate appears
✅ Can login with ?user=levi&pass=hoyt2026
✅ Settings page shows webhook URL input
✅ Can send message "Hi"
✅ Get response from bot in <2 seconds
✅ Message appears in Supabase conversations table
✅ All 5 bots respond with their personalities
✅ Team members receive their links and can chat

---

## ESTIMATED TIME

| Phase | Time | Status |
|-------|------|--------|
| 1. Frontend | 15 min | ✅ DONE |
| 2. Supabase | 10 min | ⏳ Ready |
| 3. N8N | 60 min | ⏳ Ready |
| 4. Connection | 15 min | ⏳ Ready |
| 5. Testing | 15 min | ⏳ Ready |
| 6. Distribution | 15 min | ⏳ Ready |
| **TOTAL** | **~2 hours** | 🚀 |

---

## NEXT ACTIONS (IN ORDER)

1. ✅ Wait for Cloudflare to deploy (2-3 min) → test hoyt-gpt.pages.dev
2. ⏳ Run Supabase schema SQL
3. ⏳ Set n8n environment variables
4. ⏳ Import 5 workflow JSONs into n8n
5. ⏳ Activate each workflow
6. ⏳ Run cURL tests to verify
7. ⏳ Test end-to-end with one user
8. ⏳ Send team their direct links

---

**You've got this. LFG. 🚀**

*Built by Claude. Deployed by Levi. The company your dad tells you to call.*
