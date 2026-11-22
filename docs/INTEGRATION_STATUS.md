# KrishiSetu Integration Status

## Last completed task

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

## Verified

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
- Simulated IVR APIs

## Not yet integrated

- Supabase PostgreSQL as the production data store
- Supabase Auth
- Supabase Storage and private document URLs
- Row Level Security policies and migration-backed schema
- Live telephony provider/webhook signatures
- SMS provider
- Gemini-assisted grievance drafting
- Live scheme/policy verification sources
- Full frontend replacement of remaining page-level demo state with API fetching

## Next task

Complete page-level integration for the remaining farmer and officer views so they fetch the same demo backend records rather than component-level sample values. Start with `/farmer/dashboard`, then `/farmer/schemes`, `/farmer/benefits` and `/farmer/applications`.

## Latest demo-login verification

- Backend: `uv run pytest` — 12 passed
- Frontend: `npm run typecheck` — passed
- Frontend: `npm run build` — passed
- Live role smoke tests: farmer, officer and admin logins returned matching seeded roles.
- Local backend listens on port `8001` because port `8000` is held by a stale environment listener.
