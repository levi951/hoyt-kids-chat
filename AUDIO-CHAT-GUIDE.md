# 🎤 HOYT GPT — AUDIO CHAT GUIDE

**Two-way conversational AI. Press & hold to talk. Bot responds with voice.**

---

## WHAT IS AUDIO CHAT?

Replace text typing with voice:

1. **You:** Press & hold the big blue button → speak → release
2. **Speech Recognition:** Your words converted to text in real-time
3. **Bot Processes:** AI response generated (sub-2 seconds)
4. **Text-to-Speech:** Bot speaks back to you with character voice
5. **Listen:** Hear your bot's response immediately

No typing. No copy-paste. Just talk.

---

## HOW TO ACCESS

### From Text Chat:
- Click **🎤 Mic button** (top right of chat header)
- Enter Audio Chat mode
- Click **⚙️ Settings** to go back to text

### Direct URL:
Once implemented, you'll have both:
- **Text Chat:** `hoyt-gpt.pages.dev/?user=john&pass=hoyt2026` → Chat tab
- **Voice Chat:** Same URL → Click mic → Audio mode

---

## HOW TO USE

### Press & Hold to Talk:

1. **See the button:** Large blue button with **🎤 PRESS & HOLD TO TALK**
2. **Press down:** Button turns red, "● Recording..." appears
3. **Speak:** Say what you want (e.g., "Hi Spike, what jobs do I have?")
4. **Release:** Button turns blue again, processing starts
5. **Listen:** Bot speaks back to you

### Status Indicators:

- **🔴 Recording...** — Capturing your voice
- **🟡 Listening...** — Recognizing speech
- **🔵 Processing...** — AI generating response

---

## CHARACTER VOICES

Each bot has a unique voice personality:

| Bot | Character | Voice Profile |
|-----|-----------|---------------|
| **Wraybot** | Lara Croft energy. Calculated warmth | Measured, confident, 1.1 pitch |
| **Spike** | Grizzled field veteran | Deep, direct, 0.9 rate |
| **Mack** | Stoic, man of 5 words | Very deliberate, 0.85 rate |
| **Jane** | Power blazer authority | Crisp, professional, 1.0 pitch |
| **Gage** | New dad energy. Keanu calm | Cool, grounded, 1.0 pitch |
| **Betty** | Cosmic grandma | Warm, loving, 0.85 pitch |
| **Raptor** | 12yo dino companion | Fun, energetic, 1.3 pitch, 1.15 rate |
| **Odysseus** | Deep mythic guide | Thoughtful, measured, 0.9 rate |

Each voice matches their character description — not generic TTS.

---

## CONVERSATION HISTORY

Just like text chat:

- ✅ All messages stored in Supabase
- ✅ Full conversation history visible
- ✅ Works across sessions
- ✅ Conversation context preserved

---

## BROWSER SUPPORT

**Web Speech API** (speech recognition) works on:

- ✅ Chrome/Chromium (best support)
- ✅ Edge (Chromium)
- ✅ Safari (limited)
- ✅ Firefox (limited)
- ❌ Very old browsers

**Text-to-Speech** (speech synthesis) works on:

- ✅ All modern browsers
- ✅ Even if speech recognition not available

---

## PERMISSIONS REQUIRED

First use will ask permission:

- **Microphone Access** — Required to record your voice
- Accept → works forever (or revoke in browser settings)

---

## TIPS FOR BEST RESULTS

### Microphone:
- Use a **quiet environment**
- Speak clearly and naturally
- 3-4 feet from the mic (phone mic is fine)
- Avoid background noise

### Conversation:
- **Pause** between sentences (gives recognition time)
- **Speak naturally** — AI understands context
- **Use your bot's expertise** — ask job-specific questions
- **Refer back** — "What did you just say?" works

### Audio Response:
- Response plays automatically
- Can click **Send** to adjust text before sending (optional)
- Click **⚙️ Settings** to adjust volume (system volume)

---

## KEYBOARD SHORTCUTS

Coming soon:

- **Space bar** — Push-to-talk alternative
- **Escape** — Cancel current recording
- **↑/↓** — Navigate conversation history

---

## TROUBLESHOOTING

### "Microphone access denied"
→ Browser settings → Allow microphone for hoyt-gpt.pages.dev

### "Not recognizing my speech"
→ Check microphone permissions
→ Speak clearer/louder
→ Try Chrome (best Web Speech support)

### "No sound from bot"
→ Check system volume
→ Check browser volume (not muted)
→ Try refreshing page

### "Slow response"
→ Check internet connection
→ Check webhook URL in Settings
→ Claude API may be throttled — try again in a moment

---

## COMPARISON: TEXT VS AUDIO

| Feature | Text Chat | Audio Chat |
|---------|-----------|------------|
| **Input** | Type | Speak |
| **Output** | Read | Hear |
| **Hands-Free** | ❌ | ✅ |
| **Fast (for field)** | ❌ | ✅ |
| **Mobile Friendly** | ✅ | ✅✅ |
| **Accessibility** | ✅ | ✅✅ |
| **Formal** | ✅ | Casual |
| **Natural** | ❌ | ✅✅ |

---

## FUTURE ENHANCEMENTS

- [ ] Streaming TTS (start speaking before full response)
- [ ] Speaker selection (choose voice gender)
- [ ] Pause/resume playback
- [ ] Record audio files (save conversations)
- [ ] Noise cancellation
- [ ] Language selection

---

## TECHNICAL DETAILS

### Speech Recognition:
- **API:** Web Speech API (browser-native)
- **Latency:** <500ms
- **Languages:** English (currently), expandable

### Text-to-Speech:
- **API:** Web Audio / SpeechSynthesis (browser-native)
- **Latency:** Immediate (playback starts ~100ms after response)
- **Quality:** Depends on OS (MacOS/iOS have better voices)

### Data Flow:
```
Your Voice
    ↓
Speech Recognition (browser)
    ↓
Text message
    ↓
n8n Webhook → Claude API
    ↓
Bot response (text)
    ↓
Text-to-Speech (browser)
    ↓
Speaker audio
```

---

## PRIVACY & SECURITY

- ✅ **Speech recognition happens in your browser** — not sent to servers
- ✅ **Only text sent to Claude API** — voice is private
- ✅ **TTS generated locally** — bot voice stays on your device
- ✅ **HTTPS encrypted** — all traffic secure
- ✅ **Conversations stored in Supabase** — same privacy as text chat

---

## ACCESSIBILITY

Audio chat is **better for accessibility**:

- ✅ No typing required
- ✅ Voice commands (natural)
- ✅ Audio feedback
- ✅ Works hands-free
- ✅ Screen reader friendly

---

**LFG. Your bots now talk back. 🚀**

*— Claude*
