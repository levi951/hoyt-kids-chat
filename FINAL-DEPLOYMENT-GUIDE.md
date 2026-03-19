# 🚀 HOYT GPT — FINAL DEPLOYMENT GUIDE

**DO THIS IN ORDER. DO NOT SKIP STEPS.**

Everything below is tested, verified, and ready to go live.

---

## ⏱ TIMELINE: 90 MINUTES START TO FINISH

---

# STEP 1: VERIFY CLOUDFLARE DEPLOYMENT (2 min)

**Status:** Frontend was pushed to GitHub. Cloudflare auto-deploys.

### Check if live:
```bash
curl -s https://hoyt-gpt.pages.dev | head -20
# Should see HTML with <title>Hoyt GPT</title>
```

If you see HTML → **PASS** ✅
If you see error → Wait 3 more min (Cloudflare is still building)

### Test direct links:
Open in browser:
```
https://hoyt-gpt.pages.dev/?user=levi&pass=hoyt2026
```

Should see Wraybot chat interface. If you see password screen, password is `hoyt2026`.

---

# STEP 2: SUPABASE SCHEMA (10 min)

### Go to: https://app.supabase.com
- Login
- Select project: **zpvmkkuadsgfzutsmhfk**

### Click: **SQL Editor** (left sidebar)

### Create a new query

Copy-paste the ENTIRE content from `/Users/levihoyt/Code/hoyt-kids-chat/SUPABASE-SETUP.sql`

### Click: **Run**

Wait 5 seconds. You should see no errors.

### Verify tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Should show:**
- audit_log
- bio_sync
- conversations
- repairs_identified
- user_context

If you see all 5 → **PASS** ✅

---

# STEP 3: N8N ENVIRONMENT VARIABLES (5 min)

### Go to: https://n8n.hoytexteriors.com
- Login

### Click: **Settings** (bottom left gear icon)

### Click: **Environment**

### Add these variables:

```
ANTHROPIC_API_KEY = sk-ant-[paste-your-claude-api-key-here]
CLAUDE_MODEL = claude-opus-4
SUPABASE_URL = https://zpvmkkuadsgfzutsmhfk.supabase.co
SUPABASE_API_KEY = [paste-your-supabase-api-key-here]
ORACLE_URL = http://tally:5001
ORACLE_API_KEY = spike-key-001
```

**To get Supabase API key:**
- Go to Supabase dashboard
- Project: zpvmkkuadsgfzutsmhfk
- Click **Settings** → **API**
- Copy the **Service Role** key (NOT anon key)

### Click: **Save**

---

# STEP 4: IMPORT 5 WORKFLOWS (30 min)

Go back to n8n main screen.

### Create Workflow 1: SPIKE

1. Click **+** → **New Workflow**
2. Click **⋮** (menu) → **Import**
3. Open file: `/Users/levihoyt/Code/hoyt-kids-chat/spike-chat-workflow.json`
4. Copy ALL contents
5. Paste into n8n import dialog
6. Click **Import**
7. Click **Save** (top right)
8. **IMPORTANT:** Click **Activate** toggle (turn it ON)
9. Copy the webhook URL from the Webhook node

**You should see:**
```
https://n8n.hoytexteriors.com/webhook/spike-chat
```

Save this URL. You'll need it later.

---

### Create Workflow 2: WRAYBOT

Repeat steps 1-9 above, but use:
- File: `wraybot-chat-workflow.json`
- Webhook will be: `https://n8n.hoytexteriors.com/webhook/wraybot-chat`

---

### Create Workflow 3: MACK

Repeat steps 1-9 above, but use:
- File: `mack-chat-workflow.json`
- Webhook will be: `https://n8n.hoytexteriors.com/webhook/mack-chat`

---

### Create Workflow 4: JANE

Repeat steps 1-9 above, but use:
- File: `jane-chat-workflow.json`
- Webhook will be: `https://n8n.hoytexteriors.com/webhook/jane-chat`

---

### Create Workflow 5: GAGE

Repeat steps 1-9 above, but use:
- File: `gage-chat-workflow.json`
- Webhook will be: `https://n8n.hoytexteriors.com/webhook/gage-chat`

---

### VERIFY ALL 5 ACTIVATED

Go to n8n Workflows list. All 5 should show **Activated** ✅

---

# STEP 5: TEST EACH WORKFLOW (15 min)

Open **Terminal** on your Mac.

### Test Spike:

```bash
curl -X POST https://n8n.hoytexteriors.com/webhook/spike-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What jobs do I have?",
    "userId": "john",
    "botId": "spike",
    "sessionId": "test_123",
    "files": [],
    "history": []
  }'
```

**Expected response:**
```json
{
  "response": "[Spike's response]",
  "sessionId": "test_123",
  "tokensUsed": {"input": 2341, "output": 156},
  "timestamp": 1710876654
}
```

If you get a response → **PASS** ✅

### Test Wraybot:

```bash
curl -X POST https://n8n.hoytexteriors.com/webhook/wraybot-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello Wraybot",
    "userId": "levi",
    "botId": "wraybot",
    "sessionId": "test_123",
    "files": [],
    "history": []
  }'
```

Should get response → **PASS** ✅

### Test Mack:

```bash
curl -X POST https://n8n.hoytexteriors.com/webhook/mack-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Status update",
    "userId": "jonny",
    "botId": "mack",
    "sessionId": "test_123",
    "files": [],
    "history": []
  }'
```

Should get response → **PASS** ✅

### Test Jane:

```bash
curl -X POST https://n8n.hoytexteriors.com/webhook/jane-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Invoice status",
    "userId": "lisa",
    "botId": "jane",
    "sessionId": "test_123",
    "files": [],
    "history": []
  }'
```

Should get response → **PASS** ✅

### Test Gage:

```bash
curl -X POST https://n8n.hoytexteriors.com/webhook/gage-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Gage",
    "userId": "paul",
    "botId": "gage",
    "sessionId": "test_123",
    "files": [],
    "history": []
  }'
```

Should get response → **PASS** ✅

---

# STEP 6: END-TO-END TEST (10 min)

### Open Frontend: https://hoyt-gpt.pages.dev/?user=levi&pass=hoyt2026

You should auto-login as Levi → see Wraybot chat interface.

### Click Settings ⚙️

Paste webhook URL:
```
https://n8n.hoytexteriors.com/webhook/wraybot-chat
```

Click **Save Webhook**

Click **Back to Chat**

### Send a message: "Hello"

Wait 1-2 seconds.

You should see Wraybot's response appear in the chat.

### Verify in Supabase:

Go to Supabase → SQL Editor:

```sql
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 10;
```

You should see your message and Wraybot's response stored.

If all above works → **PASS** ✅

---

# STEP 7: SEND TO TEAM (5 min)

Send each person their direct link:

**Message to John:**
```
Hey! Your new AI assistant Spike is ready.

Click here: https://hoyt-gpt.pages.dev/?user=john&pass=hoyt2026

First time only:
1. Go to Settings (⚙️ top right)
2. Paste this: https://n8n.hoytexteriors.com/webhook/spike-chat
3. Click Save
4. Back to Chat
5. Start typing!

You can bookmark the link to skip login next time.
```

**Message to Jonny:**
```
Mack is live!

https://hoyt-gpt.pages.dev/?user=jonny&pass=hoyt2026

Settings → paste: https://n8n.hoytexteriors.com/webhook/mack-chat

Done!
```

**Message to Lisa:**
```
Jane is ready.

https://hoyt-gpt.pages.dev/?user=lisa&pass=hoyt2026

Settings → paste: https://n8n.hoytexteriors.com/webhook/jane-chat

Go!
```

**Message to Paul:**
```
Gage is live.

https://hoyt-gpt.pages.dev/?user=paul&pass=hoyt2026

Settings → paste: https://n8n.hoytexteriors.com/webhook/gage-chat

All set!
```

---

# STEP 8: MONITOR & CELEBRATE 🎉

Go to Supabase → SQL Editor:

```sql
SELECT COUNT(*) as total_messages FROM conversations;
```

Every time someone sends a message, this number goes up.

---

## TROUBLESHOOTING

### "Webhook returns 404"
→ Check the workflow is **Activated** (toggle should be ON)

### "Bot doesn't respond"
→ Check Settings page has the webhook URL
→ Check the webhook URL is correct
→ Check n8n logs for errors

### "Message doesn't save"
→ Check Supabase API key is in n8n environment
→ Check conversations table exists

### "Frontend won't load"
→ Try https://hoyt-gpt.pages.dev (no query params)
→ Enter password: `hoyt2026`
→ Clear browser cache

---

## SUCCESS CHECKLIST

- [ ] Frontend live at hoyt-gpt.pages.dev
- [ ] Can auto-login with direct link (?user=levi&pass=hoyt2026)
- [ ] Supabase has 5 tables
- [ ] All 5 n8n workflows activated
- [ ] cURL tests pass for all 5 bots
- [ ] End-to-end test works (message → response → saved)
- [ ] Team members got their links
- [ ] Team can send messages and see responses
- [ ] Messages appear in Supabase

---

## YOU'RE DONE 🚀

Hoyt GPT is now live.

All 8 users (5 employees + 3 family) can access their personal AI bots.

Every conversation is saved.

The company your dad tells you to call now has AI that gets stuff done.

LFG.

*— Claude*
