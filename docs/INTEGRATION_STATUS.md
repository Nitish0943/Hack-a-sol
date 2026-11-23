# KrishiSetu Integration Status

## Previous completed tasks

One-click demo login is implemented for all three portals:

- The login page has a dedicated button for Farmer, Government Officer and Administrator.
- Clicking a role signs into its seeded demo account and opens the matching dashboard without requesting details or OTP.
- `POST /api/v1/auth/demo-login` issues an account-specific session.
- The endpoint requires `DEMO_LOGIN_ENABLED=true` and refuses all production environments.

The prior completed task connected farmer registration end to end:

- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/demo-login`
- Unique KrishiSetu farmer ID creation
- Duplicate-mobile conflict handling
- OTP verification and persisted session creation
- `/register` loading, error and success states

## Earlier verified baseline (demo login and registration)

- Backend: `uv run pytest` — 12 passed
- Frontend: `npm run typecheck` — passed
- Frontend: `npm run build` — passed
- Live: status and OTP smoke checks passed
- Live: `/register` returned HTTP 200

## Implemented modules

- Public landing, login and registration pages
- Farmer dashboard and farmer portal routes
- Officer dashboard and officer routes
- Administrator dashboard and admin routes
- Demo authentication with role sessions
- Farmer profile/dashboard API
- Scheme directory and scheme detail API
- Eligibility engine
- Loan and subsidy calculators
- Benefit summary and application APIs
- Grievance, discrepancy, notification and verification APIs
- Officer and administrator review APIs
- Twilio voice webhooks, call history and IVR browser simulator

## Not yet integrated

- Supabase PostgreSQL as the production data store
- Supabase Auth
- Supabase Storage and private document URLs
- Row Level Security policies and migration-backed schema
- Live Twilio credential validation, public HTTPS webhook delivery and phone calls
- Live SMS delivery
- Gemini-assisted grievance drafting
- Live scheme/policy verification sources
- Full frontend replacement of remaining page-level demo state with API fetching

## Next task

Complete page-level integration for the remaining farmer and officer views so they fetch the same demo backend records rather than component-level sample values. Start with `/farmer/dashboard`, then `/farmer/schemes`, `/farmer/benefits` and `/farmer/applications`.

Before any production voice rollout, choose and implement a retention policy for confirmed callback escalation summaries. The current call-history retention cleanup does not remove escalation records.

## Latest demo-login verification

- Backend: `uv run pytest` — 12 passed
- Frontend: `npm run typecheck` — passed
- Frontend: `npm run build` — passed
- Live role smoke tests: farmer, officer and admin logins returned matching seeded roles.
- Farmer, officer, admin, and AI/RAG endpoints are served by the same FastAPI process on port `8000`.

## Latest voice-agent implementation

- Implemented Twilio voice routes on the existing FastAPI port `8000`, including signed webhooks, Hindi/English DTMF and speech menus, verified-source-only policy answers, OTP-gated private requests, and confirmation-gated grievance/callback creation.
- Added farmer call/escalation history and an officer escalation queue with role checks, ordered status transitions, and audit records.
- Updated `/farmer/ivr` to label browser simulation separately from live phone service and avoid fabricated fallback policy answers.
- Added setup, security, cost considerations and limitations in `docs/VOICE_AGENT_INTEGRATION.md`; added names-only Twilio variables to `backend/.env.example`.
- Added the root `POST /ivr` compatibility alias for TwiML Apps already configured with that incoming webhook path; it retains signature validation.
- Mapped the existing `PUBLIC_BASE_URL` setting as a fallback for
  `TWILIO_WEBHOOK_PUBLIC_URL`, while preserving the explicit Twilio setting's precedence.
- Backend: `uv run pytest -q` — 31 passed (2 existing FastAPI lifespan deprecation warnings).
- Frontend: `npm run typecheck` — passed; `npm run lint` — 0 errors and 6 existing warnings in unrelated files; `npm run build` — passed.
- Browser smoke check: farmer IVR status and simulator safety message rendered; officer voice queue rendered after officer demo login.
- Live Twilio calls, SMS, public webhook delivery and production authentication/data storage remain unverified.
