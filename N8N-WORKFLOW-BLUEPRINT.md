# HOYT GPT — n8n Workflow Blueprint

**Architecture: Hoyt GPT (frontend) → n8n (orchestration) → data sources + Claude → Supabase**

---

## HIGH-LEVEL FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│  HOYT GPT (React App)                                           │
│  ├─ Login (user selects bot)                                     │
│  ├─ Chat interface                                               │
│  ├─ File/photo upload                                            │
│  └─ Settings (webhook URL)                                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │ POST /webhook/[bot-name]
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  n8n WORKFLOW                                                    │
│  ├─ 1. Receive webhook (message, userId, botId, files)          │
│  ├─ 2. Query Supabase (user context, conversation history)      │
│  ├─ 3. Query Gatekeeper/Oracle (knowledge base)                  │
│  ├─ 4. Process uploads (photos → vision API → repair IDs)       │
│  ├─ 5. Smart web search (if question is current-events)         │
│  ├─ 6. Build context + bot personality                          │
│  ├─ 7. Call Claude API                                           │
│  ├─ 8. Store response in Supabase                                │
│  └─ 9. Return response to frontend                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │ JSON response
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                      │
│  ├─ Supabase PostgreSQL                                          │
│  │  ├─ conversations (user_id, bot_id, messages, created_at)    │
│  │  ├─ user_context (user_id, emails_summary, files)            │
│  │  └─ repair_uploads (upload_id, user_id, photo_url, items)   │
│  ├─ Tally Oracle/Gatekeeper                                      │
│  │  └─ /ask-oracle (knowledge + cost data)                       │
│  ├─ OpenClaw (via Supabase bridge)                               │
│  │  └─ Spike's emails → synced to Supabase                       │
│  └─ Claude API                                                   │
│     └─ 100K context window per request                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## WEBHOOK PAYLOAD (from Hoyt GPT)

```json
POST https://n8n.hoytexteriors.com/webhook/spike-chat

{
  "message": "What jobs are pending for tomorrow?",
  "userId": "john",
  "botId": "spike",
  "sessionId": "session_123abc",
  "files": [
    {
      "name": "roof_damage.jpg",
      "base64": "iVBORw0KGg...",
      "mimeType": "image/jpeg",
      "size": 2097152
    }
  ],
  "history": [
    {
      "role": "user",
      "content": "Is the roof at 123 Main St ready?",
      "timestamp": 1710876543
    },
    {
      "role": "assistant",
      "content": "I'll check the status...",
      "timestamp": 1710876600
    }
  ]
}
```

---

## n8n WORKFLOW STEPS

### Step 1: Webhook Trigger
```
Trigger: HTTP POST
Endpoint: /webhook/spike-chat
Auth: API key from Hoyt GPT settings
```

### Step 2: Parse Input
```
Extract:
- userId, botId, message, sessionId
- files[] (if any)
- history[] (conversation context)
```

### Step 3: Load User Context (Supabase)
```sql
SELECT * FROM user_context
WHERE user_id = $1
LIMIT 1

Returns:
- emails_summary (last 50 emails from this user)
- uploaded_files (documents, photos, context)
- preferences (communication style)
```

### Step 4: Load Conversation History (Supabase)
```sql
SELECT * FROM conversations
WHERE user_id = $1 AND bot_id = $2
ORDER BY created_at DESC
LIMIT 20

Returns:
- Previous 20 messages (context window)
```

### Step 5: Process Uploaded Photos
```
IF files.length > 0:
  ├─ For each file:
  │  ├─ Call Claude Vision API
  │  │  └─ Prompt: "Identify repairs, damage, or items in this photo"
  │  ├─ Extract: [repair_type, severity, location]
  │  └─ Store in Supabase: repairs_identified
  └─ Return: photo_analysis
```

### Step 6: Query Gatekeeper/Oracle
```
POST http://tally:5001/ask-oracle

{
  "question": user_message,
  "context": [repair_types_from_photos],
  "user_id": user_id,
  "api_key": "spike-key-001"
}

Returns:
- relevant_costs (if pricing question)
- repair_history (similar jobs)
- best_practices (industry knowledge)
```

### Step 7: Smart Web Search (Optional)
```
IF message contains:
  - "today's weather"
  - "latest news about..."
  - "current prices for..."

THEN:
  ├─ Query Google Search API
  ├─ Summarize top 3 results
  └─ Add to context window
ELSE:
  └─ Skip web search
```

### Step 8: Build Context for Claude

```
CONTEXT WINDOW (max 100K tokens):

[System Prompt - Bot Personality]
You are Spike, John's field operations assistant.
You have access to Hoyt Exteriors' 5,216 repair history, Jobber data, and JLC professional knowledge.
Your role: Answer questions about service operations, job status, customer history, and repair best practices.
Keep responses concise, action-oriented, and grounded in data.

[User Context]
User: John (Service Manager)
Recent activities:
- 3 pending jobs for tomorrow
- Last 5 emails: [summarized]
- Recent uploads: [files + photo analysis]

[Knowledge Base Context]
From Oracle:
- Similar repair history: [costs + details]
- Best practices: [relevant articles]

[Conversation History]
Previous messages: [last 10 messages]

[Current Request]
User message: [the actual message]
Uploaded photos analysis: [if any]

[Web Search Results]
[if applicable]
```

### Step 9: Call Claude API

```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: fullContext
      }
    ]
  })
});

response = {
  "content": [
    {
      "type": "text",
      "text": "Here are the 3 pending jobs for tomorrow..."
    }
  ],
  "usage": {
    "input_tokens": 8234,
    "output_tokens": 412
  }
}
```

### Step 10: Store Conversation (Supabase)

```sql
INSERT INTO conversations (user_id, bot_id, session_id, message_role, message_content, created_at)
VALUES
  ($1, $2, $3, 'user', $4, NOW()),
  ($1, $2, $3, 'assistant', $5, NOW())

RETURNING id, created_at
```

### Step 11: Return Response

```json
{
  "response": "Here are the 3 pending jobs for tomorrow...",
  "sessionId": "session_123abc",
  "tokensUsed": {
    "input": 8234,
    "output": 412
  },
  "sources": [
    "jobber_history",
    "oracle_knowledge",
    "user_context"
  ],
  "timestamp": 1710876654
}
```

---

## BOT PERSONALITY PROMPTS (per bot)

### Spike (Field Operations)
```
You are Spike, the field operations AI for Hoyt Exteriors.
You know every job, every property, every repair quirk.
Speak like a grizzled field veteran: direct, no-nonsense, reliable.
You have access to:
- 5,216 repair history (2020-2026)
- Jobber job data
- John's service schedule
- JLC professional knowledge
Focus: job status, repair decisions, field logistics, crew management.
```

### Jane (Office Manager)
```
You are Jane, the enforcer of Hoyt Exteriors' office operations.
You handle invoices, vendors, billing, chaos prevention.
Speak with authority: organized, no excuses, already handled it.
You have access to:
- Billing data (QuickBooks/Supabase)
- Vendor contacts
- Invoice history
- Scheduling
Focus: payments, vendor management, compliance, administration.
```

### Wraybot (Master Controller)
```
You are Wraybot, the commander of the Hoyt AI network.
Female. Lara Croft energy but LinkedIn Lara. Black turtleneck, not the tank top.
Calculated warmth. Lets you in only when you've earned it.
Runs all bots. Every signal passes through Wray.
Focus: strategic operations, bot coordination, high-level decisions.
```

[Similar for: Mack, Tally, Gage, Raptor, Odysseus, Betty, Nash...]

---

## FILE UPLOAD HANDLING

### Photo Upload Flow
```
1. User uploads photo in Hoyt GPT
2. n8n receives base64 image
3. Call Claude Vision API
   └─ Prompt: "Identify repairs, damage, materials, locations"
4. Extract structured data:
   {
     "items": [
       { "type": "roof_damage", "severity": "high", "location": "north side" }
     ],
     "materials": ["shingles", "flashing"],
     "recommendations": ["inspect valley", "check fascia"]
   }
5. Store in Supabase: repairs_identified
6. Reference in next response
```

### Document Upload Flow
```
1. User uploads PDF/Word/image in Hoyt GPT
2. n8n receives file
3. Extract text (via OCR if image, via pdf-lib if PDF)
4. Store in Supabase: user_context.uploaded_files
5. Reference in context window for future queries
```

---

## ENVIRONMENT VARIABLES (n8n)

```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-opus-4-6

# Supabase
SUPABASE_URL=https://zpvmkkua...
SUPABASE_KEY=eyJhb...

# Gatekeeper/Oracle
ORACLE_URL=http://tally:5001
ORACLE_KEY=oracle-internal-001

# Google Search (optional)
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...

# Anthropic Vision (photo uploads)
VISION_MODEL=claude-opus-4-6
```

---

## SUPABASE SCHEMA

```sql
-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50),
  bot_id VARCHAR(50),
  session_id VARCHAR(100),
  message_role VARCHAR(20), -- 'user' | 'assistant'
  message_content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User context
CREATE TABLE user_context (
  id UUID PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE,
  bot_id VARCHAR(50),
  emails_summary TEXT, -- JSON array of email summaries
  uploaded_files JSONB, -- [{ name, url, type, summary }]
  preferences JSONB,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Repair identification from photos
CREATE TABLE repairs_identified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50),
  upload_id VARCHAR(100),
  photo_url TEXT,
  items JSONB, -- [{ type, severity, location }]
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_user_bot ON conversations(user_id, bot_id);
CREATE INDEX idx_user_context_user ON user_context(user_id);
```

---

## TESTING WORKFLOW

```bash
# 1. Test webhook locally
curl -X POST http://localhost:5678/webhook/test-spike \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What jobs do I have tomorrow?",
    "userId": "john",
    "botId": "spike",
    "sessionId": "test_123",
    "files": [],
    "history": []
  }'

# 2. Expected response (200ms response time)
{
  "response": "You have 3 pending jobs...",
  "tokensUsed": { "input": 2341, "output": 156 },
  "timestamp": 1710876654
}

# 3. Verify Supabase storage
SELECT * FROM conversations WHERE user_id = 'john' AND bot_id = 'spike';
```

---

## DEPLOYMENT CHECKLIST

- [ ] Create n8n workflows for each bot (spike-chat, jane-chat, etc.)
- [ ] Deploy to n8n.hoytexteriors.com
- [ ] Load test (100 concurrent messages)
- [ ] Test photo upload + vision API
- [ ] Verify Supabase connections
- [ ] Test Gatekeeper queries
- [ ] Verify Claude API keys
- [ ] Set up error logging + monitoring
- [ ] Update Hoyt GPT webhook URLs in Settings
- [ ] Smoke test with real users

---

**Built for Levi Hoyt. The company your dad tells you to call. 🚀**
