# CLAUDE.md — hoyt-kids-chat

> Hoyt Exteriors AI fleet — "the company your dad tells you to call."

## Role

Hoyt kids chat app — safe AI chat interface for Sophia (13), Logan (11), Charlie/Coco (foster). n8n-powered workflows, age-appropriate responses, family context. Deployed on Betty's server; tied to Kelly's supervision layer.

## Model defaults

- **Default:** Sonnet 4.6 — React/Node + n8n workflow integration
- **Local fallback:** Beelink LiteLLM at `http://100.86.1.109:11435` (key `sk-hoyt-local-2026`)

## Infra

- **n8n automation:** Nash server `45.55.247.244` — workflow engine
- **Bot host:** Betty server `146.190.161.191`
- **See:** N8N-SETUP.md, DEPLOYMENT.md, GO-LIVE-CHECKLIST.md

## Cross-repo

- Betty bots: https://github.com/levi951/hoyt-oracle-bots
- n8n nodes: https://github.com/levi951/n8n-nodes-hoyt
- Monorepo: https://github.com/levi951/hoyt-apps

## Conventions

- Children's data — extremely careful with any PII. No names in logs.
- Kelly must approve any personality/response changes
- This is Phase 9 on the roadmap — don't rush production deploy
