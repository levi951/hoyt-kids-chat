# HANDOFF — hoyt-kids-chat

> **For the next AI coder.** Cold-start context — zero shared memory with prior sessions.
> Last updated: 2026-05-10 by Claude (Sonnet 4.6)

## What this repo is
Family kids chat app for Levi's children: Sophia (13), Logan (11), Charlie/Coco (foster → adopting). Lets the kids chat with themed AI bot personalities (Betty for Kelly, Raptor for Logan, Odysseus for Sophia, Wraybot, Gage, Jane, Mack, Spike). Voice-recognition + character-based TTS + push-to-talk. Currently Phase 9 in the Hoyt AI battleplan.

## Where it runs (production)
- **Host:** Cloudflare Pages (configured via `wrangler.toml`)
- **Path on host:** N/A (Cloudflare Pages serves from repo)
- **Process manager:** N/A
- **Ports:** 443
- **Triggered by:** Browser/PWA sessions from family devices; bot replies via n8n webhook workflows (`*-chat-workflow.json` blueprints)

## Tech stack
- **Frontend:** Vite + TypeScript + React (`src/`, built into `dist/`)
- **Build:** Vite (`vite.config.ts`)
- **Hosting:** Cloudflare Pages (`wrangler.toml`)
- **Workflow engine:** n8n (hosted on Nash at `45.55.247.244`) — workflows shipped as JSON: `gage-chat-workflow.json`, `jane-chat-workflow.json`, `mack-chat-workflow.json`, `spike-chat-workflow.json`, `wraybot-chat-workflow.json`
- **AI proxy:** Hoyt GPT proxy on Nash (per commit `da107a8`)
- **DB:** Supabase (schema in `SUPABASE-SETUP.sql`)
- **Audio:** browser SpeechRecognition + character-based TTS (per `d9e1888`)
- **Auth:** phone-number auth (per `48746b7`)

## Run locally
```bash
cd /Users/levihoyt/Code/hoyt-kids-chat
npm install
npm run dev          # Vite dev server (port 5173 typically)
npm run build        # production build → dist/
```

## Deploy
```bash
# Build then push — Cloudflare Pages auto-deploys
npm run build
git add dist/ <other-files>
git commit -m "..."
git push origin main

# n8n workflows: import the *-chat-workflow.json files into n8n on Nash manually
# See N8N-WORKFLOW-SETUP.md / N8N-SETUP.md
```

## Credentials / env
| Var | Where its value lives | Notes |
|-----|----------------------|-------|
| Supabase URL + anon key | Cloudflare Pages env vars | See `SUPABASE-SETUP.sql` for schema |
| Hoyt GPT proxy URL | Hardcoded / env in workflow JSON | Lives on Nash |
| n8n webhook URLs | Per-bot, auto-configured (per commit `dabe665`) | Zero manual setup |
| Twilio (phone auth) | Cloudflare Pages env vars | Phase 9 dependency |

**Never put actual values in this file.**

## Cross-repo dependencies
- Depends on: Hoyt GPT proxy on Nash `45.55.247.244` (full personality + KB access)
- Depends on: n8n on Nash for workflow orchestration
- Depends on: Supabase for chat history persistence
- Depended on by: Hoyt family (kids + Kelly)
- Persona docs live in: `hoyt-personas` repo / Betty's personality memory file

## Recent commits (last 10)
```
2d3073f feat(claude): add CLAUDE.md — model defaults, role, Beelink fallback
da107a8 feat: wire all bots to Hoyt GPT proxy on Nash — full personality + KB access
11f5840 docs: add n8n webhook setup guide for bot workflows
dabe665 feat: auto-configure webhook URLs based on bot - zero manual setup needed
980cbc2 fix: update wrangler.toml for Cloudflare Pages deployment
76e01e8 Add complete documentation: Audio guide, deployment status, comprehensive README
d9e1888 Add full audio chat: voice recognition, character-based TTS, push-to-talk interface
b7dc1c6 Fix: Remove duplicate return statement in Login.tsx, build now passes
58e5e16 Add family bots: Betty (Kelly), Raptor (Logan), Odysseus (Sophia) with themed personalities
48746b7 feat: add direct shareable links and phone number authentication
```

## Known issues / gotchas
- **⚠️ THIS REPO IS PUBLIC ON GITHUB** at `github.com/levi951/hoyt-kids-chat`. Treat every commit as if Logan's classmates could read it. NEVER commit:
  - Real children's names beyond what's already public (Sophia, Logan, Charlie/Coco are already in commit history)
  - Phone numbers, addresses, school names, photos
  - Supabase service role keys, n8n auth tokens, AI proxy keys
  - Any Personally Identifiable Information about the kids
  - Consider moving this private before Phase 9 ships at scale.
- **Phase 9 status** — not production-deployed yet for daily family use. Plan doc at `/Users/levihoyt/.claude/plans/quiet-conjuring-floyd.md`.
- **Kids data privacy is paramount** — Levi's `feedback_data_privacy_policy.md` rule: anything sensitive = delete, never persist.
- **Don't modify `README.md`** — Levi's rule.
- Workflow JSON blueprints (`*-chat-workflow.json`) must stay in sync with n8n on Nash. Edits in n8n UI don't auto-flow back to git — export and commit.
- Bot personalities (Raptor/Odysseus = Logan/Sophia) are tied to specific kids; don't repurpose without Levi's OK.

## Next intended work
- Decide: move repo to private before Phase 9 launch (RECOMMENDED)
- Wire up family-account auth via Nash + Betty
- Verify audio TTS on iOS Safari (known browser quirks)
- Per Phase 9 plan: integrate with iPhone farm + self-hosted AI

## Where to find more context
- `/Users/levihoyt/.claude/CLAUDE.md` — global PAI config
- `/Users/levihoyt/.claude/plans/quiet-conjuring-floyd.md` — full Phase 9 plan for this app
- `/Users/levihoyt/Desktop/HOYT-AI-MASTER-THREAD-2026-05-10.md` — master state synthesis
- `/Users/levihoyt/Desktop/HOYT-AI-MASTER-MAP.md` — IPs, tokens, ports
- `/Users/levihoyt/HOYT-KB-INDEX.md` — knowledge base index
- `/Users/levihoyt/Code/hoyt-apps/HOYT-TELOS.md` — corporate Telos (mission/goals)
- `README.md`, `START-HERE.md`, `DEPLOYMENT.md`, `N8N-SETUP.md`, `SUPABASE-SETUP.sql`, `AUDIO-CHAT-GUIDE.md` in this repo
