# LOCAL_AGENT_INSTRUCTIONS

## Scope
- Repository: `hoyt-kids-chat`
- Path: `/Users/levihoyt/Code/hoyt-kids-chat`
- Preferred node: `oracle-tunnel`
- Preferred model: `qwen3:14b`
- Preferred OLLAMA_HOST: `http://127.0.0.1:11439`

## Mission
- Complete and stabilize repo wiring/build with minimal behavior risk.
- Keep changes small, testable, and reversible.
- Prefer PR-sized increments over broad refactors.

## Required Workflow
1. Pull latest `main` and create a short-lived branch: `agent/<task-name>`.
2. Read `README.md` and `HANDOFF.md` (if present) before coding.
3. Implement only bounded tasks that are already implied by repo docs/code.
4. Run install + lint + test + build commands listed below.
5. Update docs to reflect what changed.
6. Commit with clear message and open PR (do not push direct to `main`).

## Build/Test Commands
- Install: `npm ci`
- Lint: no standard script detected; inspect README/package scripts.
- Test: no standard script detected; add/verify minimal test path if feasible.
- Build: `npm run build`
- Run (optional): `npm run dev` , `npm run preview`

## Definition of Done (must satisfy all)
- Install command succeeds.
- Lint/test/build commands pass or documented with exact blocker.
- Changed files are documented in PR summary.
- No secrets or machine-specific paths committed.
- README/HANDOFF updated when behavior or setup changed.

## PR Output Contract
- Summary: what was completed.
- Files changed: explicit list.
- Validation: exact command outputs/results.
- Risks/follow-ups: concise bullet list.
