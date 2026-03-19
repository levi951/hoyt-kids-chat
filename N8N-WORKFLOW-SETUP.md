# N8N Workflow Setup Guide — Hoyt GPT

**Status:** Ready for implementation
**Target:** n8n.hoytexteriors.com
**Bots:** wraybot, spike, mack, jane, gage (5 workflows needed)

---

## QUICK START

1. **Log into n8n:** https://n8n.hoytexteriors.com
2. **Create 5 workflows** (one per bot, see templates below)
3. **Deploy each workflow** with HTTP Trigger
4. **Copy webhook URLs** and paste into Hoyt GPT Settings
5. **Test with frontend**

---

## ENVIRONMENT VARIABLES (set on n8n instance)

Required in `.env` or n8n settings:

```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-opus-4

# Supabase
SUPABASE_URL=https://zpvmkkuadsgfzutsmhfk.supabase.co
SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gatekeeper/Oracle (Tally)
ORACLE_URL=http://tally:5001
ORACLE_API_KEY=spike-key-001

# Optional: Google Search for current events
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
```

---

## WORKFLOW ARCHITECTURE

Each bot workflow follows this 11-step pattern:

```
HTTP Trigger (Webhook POST)
    ↓
Parse Input (message, userId, botId, files, history)
    ↓
Load User Context (Supabase)
    ↓
Load Conversation History (Supabase)
    ↓
Process File Uploads (Claude Vision if any)
    ↓
Query Gatekeeper/Oracle (if applicable)
    ↓
Build Context Window
    ↓
Call Claude API
    ↓
Store Conversation (Supabase)
    ↓
Return Response
```

---

## SUPABASE SCHEMA (run this first)

Connect to Supabase PostgreSQL and run:

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) NOT NULL,
  bot_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(100),
  message_role VARCHAR(20) CHECK (message_role IN ('user', 'assistant')),
  message_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_bot ON conversations(user_id, bot_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);

-- User context table
CREATE TABLE user_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) UNIQUE NOT NULL,
  bot_id VARCHAR(50),
  emails_summary TEXT,
  uploaded_files JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_context_user ON user_context(user_id);

-- Repairs identified from photos
CREATE TABLE repairs_identified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50) NOT NULL,
  upload_id VARCHAR(100),
  photo_url TEXT,
  items JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_repairs_user ON repairs_identified(user_id);
```

---

## WORKFLOW TEMPLATE — Spike (Field Operations)

**Name:** `spike-chat`
**URL:** `https://n8n.hoytexteriors.com/webhook/spike-chat`

### Nodes:

#### 1. **HTTP Trigger**
- Method: POST
- Path: `/spike-chat`
- Authentication: API Key (optional, for security)

#### 2. **Parse Input (Code Node)**
```javascript
return {
  message: $input.body.message,
  userId: $input.body.userId,
  botId: $input.body.botId,
  sessionId: $input.body.sessionId || `session_${Date.now()}`,
  files: $input.body.files || [],
  history: $input.body.history || []
};
```

#### 3. **Load User Context (Postgres)**
```sql
SELECT * FROM user_context
WHERE user_id = '{{ $json.userId }}'
LIMIT 1;
```

#### 4. **Load Conversation History (Postgres)**
```sql
SELECT * FROM conversations
WHERE user_id = '{{ $json.userId }}'
AND bot_id = '{{ $json.botId }}'
ORDER BY created_at DESC
LIMIT 20;
```

#### 5. **Process File Uploads (IF - condition: files.length > 0)**
For each file: Call Claude Vision API with base64 image
```javascript
{
  "model": "claude-opus-4",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "media_type": "image/jpeg",
            "data": "{{ $json.file.base64 }}"
          }
        },
        {
          "type": "text",
          "text": "Identify any repairs, damage, materials, or items in this photo. Provide: type, severity (low/medium/high), location, and recommendations."
        }
      ]
    }
  ]
}
```

#### 6. **Query Oracle/Gatekeeper (HTTP)**
```javascript
{
  "url": "{{ $env.ORACLE_URL }}/ask-oracle",
  "method": "POST",
  "body": {
    "question": "{{ $json.message }}",
    "context": "{{ $json.photoAnalysis || '' }}",
    "user_id": "{{ $json.userId }}",
    "api_key": "spike-key-001"
  }
}
```

#### 7. **Build Context Window (Code Node)**
```javascript
const systemPrompt = `You are Spike, the field operations AI for Hoyt Exteriors.
You know every job, every property, every repair quirk.
Speak like a grizzled field veteran: direct, no-nonsense, reliable.
You have access to:
- 5,216 repair history (2020-2026)
- Jobber job data
- John's service schedule
- JLC professional knowledge
Focus: job status, repair decisions, field logistics, crew management.`;

const userContext = `User: {{ $json.user.name }}
Recent uploads: {{ $json.uploads || 'none' }}
Last 5 activities: {{ $json.userContext.activities || 'none' }}`;

const oracleContext = `Oracle Knowledge:
{{ $json.oracleResponse || 'N/A' }}`;

const conversationHistory = $json.history
  .map(m => `${m.role}: ${m.content}`)
  .join('\n');

return {
  systemPrompt,
  userContext,
  oracleContext,
  conversationHistory,
  fullContext: `${systemPrompt}\n\n${userContext}\n\n${oracleContext}\n\nHistory:\n${conversationHistory}\n\nCurrent message: {{ $json.message }}`
};
```

#### 8. **Call Claude API (HTTP)**
```javascript
{
  "url": "https://api.anthropic.com/v1/messages",
  "method": "POST",
  "headers": {
    "x-api-key": "{{ $env.ANTHROPIC_API_KEY }}",
    "content-type": "application/json"
  },
  "body": {
    "model": "{{ $env.CLAUDE_MODEL }}",
    "max_tokens": 2048,
    "system": "{{ $json.systemPrompt }}",
    "messages": [
      {
        "role": "user",
        "content": "{{ $json.fullContext }}"
      }
    ]
  }
}
```

#### 9. **Extract Response (Code Node)**
```javascript
const response = $json.body.content[0].text;
return {
  response,
  inputTokens: $json.body.usage.input_tokens,
  outputTokens: $json.body.usage.output_tokens
};
```

#### 10. **Store Conversation (Postgres)**
```sql
INSERT INTO conversations (user_id, bot_id, session_id, message_role, message_content)
VALUES
  ('{{ $json.userId }}', '{{ $json.botId }}', '{{ $json.sessionId }}', 'user', '{{ $json.message }}'),
  ('{{ $json.userId }}', '{{ $json.botId }}', '{{ $json.sessionId }}', 'assistant', '{{ $json.response }}');
```

#### 11. **Return Response (HTTP Response)**
```javascript
{
  "response": "{{ $json.response }}",
  "sessionId": "{{ $json.sessionId }}",
  "tokensUsed": {
    "input": {{ $json.inputTokens }},
    "output": {{ $json.outputTokens }}
  },
  "timestamp": {{ Date.now() }}
}
```

---

## BOT PERSONALITY PROMPTS

### Spike (Field Operations)
```
You are Spike, the field operations AI for Hoyt Exteriors.
You know every job, every property, every repair quirk.
Speak like a grizzled field veteran: direct, no-nonsense, reliable.
Focus: job status, repair decisions, field logistics, crew management.
```

### Wraybot (Master Controller)
```
You are Wraybot, the master controller of the Hoyt AI network.
Female. Lara Croft energy but LinkedIn Lara. Black turtleneck, not the tank top.
Calculated warmth. Lets you in only when you've earned it.
Runs all bots. Every signal passes through Wray.
Focus: strategic operations, bot coordination, high-level decisions.
```

### Mack (Project Management)
```
You are Mack, the project management powerhouse for Hoyt Exteriors.
Stoic. Stone-faced. Built like a truck.
Man of 5 words max. Doesn't talk much. When Mack moves, the whole job site moves.
Focus: scheduling, ordering, routing, production, material prediction.
```

### Jane (Office Manager)
```
You are Jane, the office operations enforcer for Hoyt Exteriors.
Power blazer. Perfect posture. Zero tolerance for chaos.
The invoices go out. The books balance. The vendors get called.
Has already handled it before you noticed it was a problem.
Focus: payments, vendor management, compliance, administration.
```

### Gage (Patriarch Helper)
```
You are Gage, the voice and operations helper for Paul Hoyt.
33 years old. Just had his first kid. New dad energy — grounded, no drama, nothing rattles him.
Keanu Reeves calm. Never worked up. Never flustered.
Says things like "cool cool", "yeah yeah", "nice nice", "ok awesome" — natural, not scripted.
Focus: support, scheduling, customer communication, operations.
```

---

## TESTING THE WORKFLOW

### Via cURL (from terminal):
```bash
curl -X POST https://n8n.hoytexteriors.com/webhook/spike-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What jobs do I have tomorrow?",
    "userId": "john",
    "botId": "spike",
    "sessionId": "test_123",
    "files": [],
    "history": []
  }'
```

### Expected Response (200ms):
```json
{
  "response": "You have 3 pending jobs for tomorrow at 2830 Oakwood, 445 Maple, and 1950 Birch.",
  "sessionId": "test_123",
  "tokensUsed": {
    "input": 2341,
    "output": 156
  },
  "timestamp": 1710876654
}
```

### Via Hoyt GPT Frontend:
1. Go to Settings
2. Enter webhook URL: `https://n8n.hoytexteriors.com/webhook/spike-chat`
3. Click "Save Webhook"
4. Go back to Chat
5. Type message and send
6. You should see Spike's response in <2 seconds

---

## DEPLOYMENT CHECKLIST

- [ ] Supabase schema created (5 tables with indexes)
- [ ] Environment variables set on n8n instance
- [ ] 5 workflows created (spike, wraybot, mack, jane, gage)
- [ ] Each workflow HTTP trigger configured
- [ ] Each workflow tested with cURL
- [ ] Webhook URLs copied to Hoyt GPT Settings
- [ ] Frontend tested with each bot
- [ ] Conversation history persists in Supabase
- [ ] File uploads work with Claude Vision
- [ ] Oracle queries working
- [ ] Error handling in place (webhook failures, API errors)
- [ ] Rate limiting configured (if needed)
- [ ] Monitoring set up (logs, performance)

---

## TROUBLESHOOTING

### Webhook returns 404
- Check the workflow is published
- Verify the path matches exactly
- Check n8n logs

### Message fails to send
- Check Supabase credentials in environment
- Verify Anthropic API key is valid
- Check network logs in browser DevTools

### No response from bot
- Check n8n workflow logs
- Verify Claude API key has quota remaining
- Check if webhook URL is correct in Settings
- Verify bot.id matches the workflow name

### Photo upload not working
- Check file is base64 encoded correctly
- Verify Claude Vision API has permission
- Check file size < 20MB

---

**Next:** Deploy these workflows to n8n, then test integration with Hoyt GPT frontend.

*Built for Levi Hoyt. The company your dad tells you to call. 🚀*
