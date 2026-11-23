<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## KrishiSetu implementation status

- Completed: landing, login, registration, farmer portal, officer portal, administrator portal, and the documented core routes.
- Data mode: sample/demo records are explicitly labelled; no Supabase or live policy data is silently represented as real.
- Shared components: `components/portal-layout.tsx` and `components/ui-kit.tsx`.
- Validation: `npm run typecheck` and `npm run build` pass.
- Remaining integration work: production authentication/data storage and role protection, policy and grievance APIs, document storage, live provider verification for IVR/SMS, and real notification providers.

## Backend implementation status

- Added a FastAPI `/api/v1` demo backend with SQLite persistence.
- Completed demo OTP login, session cookies, farmer profile/dashboard, schemes, eligibility, loan/subsidy calculations, benefit summaries, applications, grievances, discrepancies, officer/admin actions, Twilio voice webhooks and the browser IVR simulator.
- All demo records are marked `is_demo=true` or explicitly exposed as demo responses.
- Frontend login now calls the backend demo OTP endpoints through `frontend/lib/api.ts`.
- Backend verification: `uv run pytest` — 7 tests passed.
- Frontend verification: `npm run typecheck` and `npm run build` passed.
- Known gaps: Supabase PostgreSQL/Auth/Storage/RLS are not configured; Twilio voice code is implemented but live credentials, public HTTPS webhooks and SMS delivery have not been verified; Gemini integration remains unverified.
- Next task: integrate remaining farmer/officer data pages with the existing backend; production Supabase/Auth/RLS remains a separate prerequisite.

## Login connection fix

- Corrected `NEXT_PUBLIC_API_URL` to `http://localhost:8000`; the backend and frontend now use the documented 8000/3000 ports.
- Restarted Next.js after the environment change.
- Verified send-OTP, verify-OTP and authenticated profile calls against the live backend.

## Registration integration

- Completed `POST /api/v1/auth/register` with demo OTP verification, duplicate-mobile rejection, unique farmer ID generation and persisted farmer profile fields.
- Connected `/register` to send OTP and register APIs with loading and error states.
- Backend verification: `uv run pytest` — 10 tests passed.
- Frontend verification: `npm run typecheck` passed; `npm run build` passed.
- Live verification: backend on port `8000`, frontend on port `3000`; status, OTP and `/register` smoke checks passed.
- Known next task: integrate Supabase credentials and migrations/RLS if provided, or continue frontend data-page integration using the working demo API.

## One-click demo login

- Added `POST /api/v1/auth/demo-login` for the seeded farmer, officer and admin accounts.
- Demo login requires `DEMO_LOGIN_ENABLED=true` and is rejected in production.
- Login screen exposes a button for each role; clicking it creates a demo session and opens that portal without requesting profile details or OTP.
- Backend verification: `uv run pytest` — 12 tests passed, including each role and production denial.
- Frontend verification: `npm run typecheck` and `npm run build` passed.
- Live verification: all three role endpoints returned the expected role; `/login` returned HTTP 200.
- Local services: frontend `http://localhost:3000`, backend `http://localhost:8000`.

## Twilio voice integration

- Added signed Twilio webhooks, Hindi/English menus, policy RAG responses gated on verified citations, OTP-gated private actions, confirmed grievance/callback requests, call history and officer escalation APIs.
- `/farmer/ivr` distinguishes the browser keypad simulator from live phone readiness and shows a farmer's authorized call/escalation history. The simulator does not fabricate private account results.
- `/officer/voice-escalations` lists requests for officers and supports audited, ordered follow-up status changes.
- The root `POST /ivr` remains available as a signature-validated compatibility alias for the canonical `/api/v1/voice/incoming` webhook.
- `TWILIO_WEBHOOK_PUBLIC_URL` takes precedence; `PUBLIC_BASE_URL` is used as a fallback when the Twilio-specific URL is unset.
- Configuration and limitations: `docs/VOICE_AGENT_INTEGRATION.md`.
- Verified locally: `uv run pytest -q` — 31 passed; `npm run typecheck` and `npm run build` passed; `npm run lint` reported 0 errors and 6 existing warnings in unrelated files.
- Unverified: live Twilio calls/SMS, public HTTPS webhook delivery, production data/auth adapter, and spoken policy answers until policy sources are reviewed and verified.

## Unified backend port

- The FastAPI app already mounts the RAG router under `/api/v1/rag`; AI queries and other APIs share port `8000`.
- Updated frontend API configuration and setup docs to use port `8000`; Next.js remains on its separate frontend port `3000`.
