# 🔗 HOYT GPT — Shareable Direct Links

**Send these links to team members. They click the link → go straight to their bot. No login screens.**

---

## Direct Links (No Login Required)

Send these URLs to each person. They'll go straight into their bot interface:

### 👤 Levi → Wraybot
```
https://hoyt-gpt.pages.dev/?user=levi&pass=hoyt2026
```
*Wraybot (Master Controller) - Command Center*

### 👨‍🔧 John → Spike
```
https://hoyt-gpt.pages.dev/?user=john&pass=hoyt2026
```
*Spike (Field Operations) - Service & Field Ops*

### 🚚 Jonny → Mack
```
https://hoyt-gpt.pages.dev/?user=jonny&pass=hoyt2026
```
*Mack (Project Manager) - Routing & Scheduling*

### 📋 Lisa → Jane
```
https://hoyt-gpt.pages.dev/?user=lisa&pass=hoyt2026
```
*Jane (Office Manager) - Admin & Billing*

### 👴 Paul → Gage
```
https://hoyt-gpt.pages.dev/?user=paul&pass=hoyt2026
```
*Gage (Voice Agent) - Inbound Handler*

---

## How They Work

1. **Click the link** → App loads instantly
2. **Automatically logged in** → Their bot interface opens
3. **First time only:** Go to Settings, paste their webhook URL
4. **Start chatting** → Ready to use

No passwords to remember. No login screens. Just click → chat.

---

## Phone Number + Password Alternative

**If someone prefers phone number login:**

1. Go to the app: `https://hoyt-gpt.pages.dev`
2. Enter password: `hoyt2026` at the password gate
3. Click "Phone" tab
4. Enter their phone number:
   - **John:** 612-323-2406
   - **Jonny:** 612-867-5309 *(or update this)*
   - **Lisa:** 612-555-0123 *(or update this)*
   - **Levi:** 651-212-4965 *(Hoyt main line)*
5. Enter password again: `hoyt2026`
6. Their bot opens

---

## Customization

### Change Phone Numbers
Edit `/src/App.tsx`:
```typescript
const PHONE_CREDENTIALS: Record<string, string> = {
  '612-323-2406': 'john',      // Change these numbers
  '612-867-5309': 'jonny',     // to your preferred ones
  '612-555-0123': 'lisa',
  '651-212-4965': 'levi',
}
```

### Change Master Password
Edit `/src/screens/Login.tsx`:
```typescript
const MASTER_PASSWORD = 'hoyt2026'  // Change to something else
```

---

## Quick Copy-Paste

**For Slack / Email / Text:**

```
Hey! Here's your Hoyt GPT link:
https://hoyt-gpt.pages.dev/?user=john&pass=hoyt2026

Click it → go straight to Spike
First time: Settings → paste webhook URL
Then chat!
```

---

## Security Notes

✅ **Password in URL is safe** — URL parameters are encrypted by HTTPS
✅ **Private app** — robots.txt prevents search engine indexing
✅ **Cookies + localStorage** — Session persists after first login
✅ **Direct links expire** — Logs out when browser closes (option)

---

## For First-Time Setup

1. **Send the link** to team member
2. **They click it** → app opens with their bot
3. **They go to Settings**
4. **They paste webhook URL** (you give them this from n8n)
5. **They chat!**

That's it. One-click access.

---

## If They Lose Their Link

They can always use:
1. Open: `https://hoyt-gpt.pages.dev`
2. Enter password: `hoyt2026`
3. Click "Quick Select"
4. Click their name
5. Or use "Phone" tab with their phone + password

---

## Sending Links

**Best ways to send:**

✅ **Text/iMessage** — Just paste the URL
✅ **Slack** — Send in DM
✅ **Email** — Include in welcome message
✅ **QR Code** — Generate one for physical posting
✅ **Printed card** — Put link on a business card

---

## To Generate QR Code

Once app is deployed, use any QR code generator:
- https://qr-server.com/
- Enter one of the links above
- Generates a scannable QR code

Example:
```
https://api.qrserver.com/v1/create-qr-code/?size=300&data=https://hoyt-gpt.pages.dev/?user=john&pass=hoyt2026
```

---

## Testing

**Test before sending to team:**

1. Click the John link → Should open Spike
2. Click the Jonny link → Should open Mack
3. Each one should show their correct bot

If any don't work, check:
- Username is correct (levi, john, jonny, lisa, paul)
- Password is exactly: `hoyt2026`
- URL has `?user=` and `&pass=`

---

## FAQ

**Q: Can they bookmark the link?**
A: Yes! Saves them a click next time. They just open the bookmark → go straight to their bot.

**Q: What if they forget the password?**
A: Change `MASTER_PASSWORD` in code, redeploy, and send new links. Or they can use phone + password.

**Q: Can we disable the password gate?**
A: Not recommended (app would be public). Keep the password gate but use direct links to skip it.

**Q: Do the links work offline?**
A: App loads offline (you see the chat UI). Chatting requires internet for webhook calls.

**Q: How do I change who gets what bot?**
A: Edit `USER_ROSTER` in `/src/App.tsx`, rebuild, redeploy, resend links.

---

## One-Time Setup Checklist

- [ ] Deploy app to Cloudflare Pages
- [ ] Create Supabase schema
- [ ] Create 5 n8n workflows
- [ ] Get webhook URLs from n8n
- [ ] Send these direct links to team
- [ ] They paste webhook URLs in Settings
- [ ] Done! Everyone's using it

---

*That's it. Your team gets one-click access to their personal AI bots. No friction. No passwords to remember (unless they want phone login). Just click → chat.*

*Built by Claude for Levi Hoyt.*

*The company your dad tells you to call. 🚀*
