# Hoyt GPT - n8n Webhook Setup Guide

**Status**: Hoyt GPT frontend is LIVE at https://hoyt-gpt-82r.pages.dev

The app is fully configured with auto-generated webhook URLs. You just need to create the n8n workflows.

---

## Webhook Configuration

Each bot needs an n8n webhook endpoint. The app expects these paths:

| Bot | User | Webhook Path | URL |
|-----|------|---|---|
| Wraybot | Levi | `hoyt-wraybot-webhook` | `http://100.72.252.5:5678/webhook/hoyt-wraybot-webhook` |
| Spike | John | `hoyt-spike-webhook` | `http://100.72.252.5:5678/webhook/hoyt-spike-webhook` |
| Mack | Jonny | `hoyt-mack-webhook` | `http://100.72.252.5:5678/webhook/hoyt-mack-webhook` |
| Jane | Lisa | `hoyt-jane-webhook` | `http://100.72.252.5:5678/webhook/hoyt-jane-webhook` |
| Gage | Paul | `hoyt-gage-webhook` | `http://100.72.252.5:5678/webhook/hoyt-gage-webhook` |

---

## Setup Instructions

### Option 1: Quick Setup (Recommended)
1. Go to n8n at http://100.72.252.5:5678 (via Tailscale)
2. Create a new workflow for each bot (Wraybot, Spike, Mack, Jane, Gage)
3. In each workflow:
   - Add **Webhook** trigger node
   - Set the **Path** to the webhook path above (e.g., `hoyt-wraybot-webhook`)
   - Set **HTTP method** to `POST`
   - Set **Response mode** to `Last Node`
   - Add **Code** node to call Claude API with the message
   - Configure output as JSON: `{"response": "<bot response>"}`
   - Activate the workflow

### Option 2: Import JSON Workflows
You can import pre-built workflows (coming soon) directly into n8n.

---

## Testing

After creating the workflows:

1. **Visit the app**: https://hoyt-gpt-82r.pages.dev/
2. **Click your user**: (e.g., Levi)
3. **Chat screen loads** with webhook auto-configured ✓
4. **Send a message** and the app will POST to your webhook
5. Your webhook should respond with `{"response": "<message>"}`

---

## Direct Login Links

Share these links with each user to auto-login:

```
Levi (Wraybot):    https://hoyt-gpt-82r.pages.dev/?user=levi&pass=hoyt2026
John (Spike):      https://hoyt-gpt-82r.pages.dev/?user=john&pass=hoyt2026
Jonny (Mack):      https://hoyt-gpt-82r.pages.dev/?user=jonny&pass=hoyt2026
Lisa (Jane):       https://hoyt-gpt-82r.pages.dev/?user=lisa&pass=hoyt2026
Paul (Gage):       https://hoyt-gpt-82r.pages.dev/?user=paul&pass=hoyt2026
Kelly (Betty):     https://hoyt-gpt-82r.pages.dev/?user=kelly&pass=hoyt2026
Logan (Raptor):    https://hoyt-gpt-82r.pages.dev/?user=logan&pass=hoyt2026
Sophia (Odysseus): https://hoyt-gpt-82r.pages.dev/?user=sophia&pass=hoyt2026
```

---

## Webhook Request Format

When a user sends a message, the app POSTs to the webhook:

```json
POST /webhook/hoyt-wraybot-webhook
Content-Type: application/json

{
  "message": "user's message here",
  "userId": "levi",
  "botId": "wraybot",
  "history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."},
    ...
  ]
}
```

---

## Webhook Response Format

Your n8n workflow must respond with:

```json
{
  "response": "bot reply goes here"
}
```

---

## Audio Features

The app includes **push-to-talk** audio input. When users click the microphone button:
- Speech recognition (via Web Speech API) converts audio to text
- The text is sent to the webhook like a normal message
- The response is played back using character-specific TTS voices

---

## Troubleshooting

**"Webhook not configured" warning**
- The webhook URL is auto-set but the n8n workflow must exist
- Go to Settings in the app to see the webhook URL
- Verify it matches the path above

**Message not sending**
- Check the webhook is active in n8n
- Check browser console for network errors (Settings → scroll down)
- Verify response format is `{"response": "..."}`

**Audio not working**
- Audio requires HTTPS (already provided by Cloudflare)
- Browser must have microphone permission
- Try Settings → toggle "Enable Audio" (if available)

---

## Next Steps

1. ✅ App is live
2. ⏳ Create n8n workflows (see Setup Instructions above)
3. ⏳ Wire webhooks to Claude API calls
4. ✅ Share direct links with team

Questions? Check the app's Settings page for API reference.
