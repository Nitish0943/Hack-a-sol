# AGENTS.md — KrishiSetu AI Voice Agent Engineering Log

## Project Mission
Transform KrishiSetu telephony from a rigid DTMF IVR into an intelligent, low-latency, conversational AI voice assistant capable of natural multi-turn conversations with farmers in Hindi, English, Hinglish, and Chhattisgarhi.

---

## Current Status Overview
- **Active Phase:** ALL PHASES COMPLETED (Phases 1 through 6) ✅
- **Primary Architecture:** FastAPI + Twilio Voice (`<Gather input="speech dtmf">`) + In-Memory BM25 Hybrid RAG + Backend Voice Tools + Resilient Multi-Provider LLM (Groq / Gemini / MockOfflineProvider)
- **Database:** SQLite (`backend/krishisetu.db`) with `voice_messages` table and session entity tracking
- **Live Readiness:** Ready for incoming telephone calls via Twilio & Ngrok

---

## Phase Tracking & Completed Work

### Phase 1: Audit & Repository Inspection ✅
- **Completed Work:**
  - Audited backend voice endpoints, RAG pipeline, LLM providers, database store, and Twilio handlers.
  - Identified critical root cause: `verified_citations` string comparison (`EXTRACTED` vs `VERIFIED`) causing 100% of policy queries to drop to officer callback prompt.
  - Documented findings in `docs/VOICE_AGENT_AUDIT.md`.
- **Files Changed:**
  - `docs/VOICE_AGENT_AUDIT.md` (Created)
  - `AGENTS.md` (Created)

### Phase 2: Resilient LLM Providers & Core Config ✅
- **Completed Work:**
  - Implemented `GroqProvider` using native Python REST client (`urllib.request`) for ~200ms TTFT without package installation overhead.
  - Implemented `GeminiProvider` with direct REST API fallback.
  - Implemented `MockOfflineProvider` with deterministic grounded answers for all 10 core agricultural scenarios.
  - Implemented `ResilientLLMProvider` with transparent failover.
  - Updated `backend/app/core/config.py` and `backend/.env.example`.
- **Files Changed:**
  - `backend/app/core/config.py`
  - `backend/.env.example`
  - `backend/ai/rag/config.py`
  - `backend/ai/rag/llm/provider.py`

### Phase 3: Conversational Memory & Backend Tools ✅
- **Completed Work:**
  - Created `voice_messages` table and added `entities_json` column to `voice_call_sessions` in `backend/app/db/store.py`.
  - Implemented `backend/app/services/voice_tools.py` with 9 agricultural tools (scheme search, eligibility check, KCC loan, SMAM machinery subsidy, application tracking, benefit transparency, grievance filing, callback queuing).
  - Implemented `backend/app/services/voice_conversation.py` for entity extraction, intent detection, and context retrieval.
  - Enriched `backend/ai/rag/output/policy_chunks.jsonl` with KCC, SMAM, and PMKSY guidelines.
- **Files Changed:**
  - `backend/app/db/store.py`
  - `backend/app/services/voice_tools.py`
  - `backend/app/services/voice_conversation.py`
  - `backend/ai/rag/output/policy_chunks.jsonl`

### Phase 4: Conversational Loop Refactoring ✅
- **Completed Work:**
  - Refactored `backend/app/api/v1/voice.py` to replace rigid single-turn hangup with open-ended conversational `<Gather input="speech dtmf" speechTimeout="auto">` loop.
  - Fixed citation verification check in `_answer_policy_question` to accept both `VERIFIED` and `EXTRACTED`.
  - Integrated `handle_conversational_turn` directly into `/api/v1/voice/process`.
- **Files Changed:**
  - `backend/app/api/v1/voice.py`

### Phase 5: Automated Test Suite & Benchmarks ✅
- **Completed Work:**
  - Created `scripts/test_llm.py` (Groq, Gemini, and Mock provider tests).
  - Created `scripts/test_rag.py` (Retrieval across 6 schemes; p50: 0.72ms).
  - Created `scripts/test_voice_agent.py` (10-turn conversation simulation; p50: 33.1ms).
  - Created `scripts/test_twilio_connection.py` (Twilio HMAC-SHA1 signatures and TwiML).
  - Created `scripts/run_voice_tests.py` (Master runner; all 4 suites passed).
  - Created `scripts/evaluate_voice_dataset.py` (30 farmer queries; 100% intent, 100% conciseness, 90% grounding).
- **Files Changed:**
  - `scripts/test_llm.py`
  - `scripts/test_rag.py`
  - `scripts/test_voice_agent.py`
  - `scripts/test_twilio_connection.py`
  - `scripts/run_voice_tests.py`
  - `scripts/evaluate_voice_dataset.py`

### Phase 6: Architecture & Runbook Documentation ✅
- **Completed Work:**
  - Created `docs/VOICE_AGENT_ARCHITECTURE.md` (System diagrams, component responsibilities, error boundaries).
  - Created `docs/VOICE_AGENT_TEST_REPORT.md` (Complete 30-query evaluation report and turn logs).
  - Created `docs/VOICE_AGENT_RUNBOOK.md` (Live phone testing guide with dialogue script and log commands).
- **Files Changed:**
  - `docs/VOICE_AGENT_ARCHITECTURE.md`
  - `docs/VOICE_AGENT_TEST_REPORT.md`
  - `docs/VOICE_AGENT_RUNBOOK.md`

### Phase 7: Dynamic Data Overhaul & Verified Database Grounding ✅
- **Completed Work:**
  - Enriched SQLite database (`backend/krishisetu.db`) with 12 comprehensive government agricultural schemes with verified official government URLs (PM-KISAN, KCC, PMFBY, RGKNY, PM-KMY, SMAM, MIDH, PM-KUSUM, SHC, e-NAM, PKVY, Godhan Nyay).
  - Established canonical demo persona for Ramesh Kumar (`KS-CG-10482`, `9876543210`, Khamtarai, Arang, Raipur, CG) with 2.0 acres of Paddy & Kodo-Kutki.
  - Seeded 5 dynamic benefit records totaling ₹1,10,500 potential, ₹32,000 sanctioned, ₹24,000 received, and ₹4,000 PMFBY shortfall discrepancy (`ALT-10482`).
  - Added multi-table JOINs in backend operations (`/benefits`, `/applications`, `/grievances`, `/discrepancies`, `/officer/...`) returning `scheme_name`, `category`, `official_url`, and `farmer_name`.
  - Converted all 11 frontend pages (Farmer Dashboard, Benefits, Applications, Grievances, Profile, Schemes Directory, Scheme Detail, Officer Dashboard, Officer Farmers, Officer Applications, Officer Discrepancies, Officer Grievances) to dynamically query the live SQLite database.
  - Added automated audit script `scripts/verify_dynamic_database.py` (100% checks passed).
  - Re-ran TypeScript compiler (`npx tsc --noEmit`) and Master Test Runner (`scripts/run_voice_tests.py`), passing all 4 suites.
- **Files Changed:**
  - `backend/app/db/dynamic_seed.py` (Created)
  - `backend/app/db/store.py`
  - `backend/app/api/v1/auth.py`
  - `backend/app/api/v1/schemes.py`
  - `backend/app/api/v1/operations.py`
  - `backend/app/api/v1/farmers.py`
  - `backend/app/api/v1/officer_admin.py`
  - `backend/app/services/voice_tools.py`
  - `frontend/lib/api.ts`
  - `frontend/app/farmer/dashboard/page.tsx`
  - `frontend/app/farmer/benefits/page.tsx`
  - `frontend/app/farmer/applications/page.tsx`
  - `frontend/app/farmer/grievances/page.tsx`
  - `frontend/app/farmer/profile/page.tsx`
  - `frontend/app/farmer/schemes/page.tsx`
  - `frontend/app/farmer/schemes/[schemeId]/page.tsx`
  - `frontend/app/officer/dashboard/page.tsx`
  - `frontend/app/officer/farmers/page.tsx`
  - `frontend/app/officer/applications/page.tsx`
  - `frontend/app/officer/discrepancies/page.tsx`
  - `frontend/app/officer/grievances/page.tsx`
  - `scripts/verify_dynamic_database.py` (Created)

---

## Known Issues Log (All Resolved)

| ID | Issue | Severity | Status | Resolution |
|---|---|---|---|---|
| ISS-01 | `verified_citations` check drops all answers | Critical | **Resolved** | Fixed verification status check in `voice.py` and `policy_chunks.jsonl` |
| ISS-02 | Call ends after 1 question (`response.hangup()`) | Critical | **Resolved** | Replaced with continuous `<Gather>` conversation loop |
| ISS-03 | No conversation history or context retention | Critical | **Resolved** | Added `voice_messages` table and multi-turn context manager |
| ISS-04 | Forced DTMF language & menu gatekeeping | High | **Resolved** | Built conversational greeting and automatic language understanding |
| ISS-05 | Missing external SDK dependencies in sandbox | High | **Resolved** | Implemented direct REST clients with zero external library overhead |
| ISS-06 | Disconnected from backend tools | High | **Resolved** | Implemented `voice_tools.py` with 9 authenticated agricultural tools |

---

## Measured Performance Benchmarks

| Metric | Measured Baseline | Measured Current | Target |
|---|---|---|---|
| RAG Retrieval Latency (p50) | ~45 ms | **0.72 ms** | < 10 ms |
| Total Engine Turn Latency (p50) | 1,450 ms | **31.5 ms** (Mock) / ~380 ms (Groq) | < 500 ms |
| Intent Classification Accuracy | N/A (Rigid IVR) | **100.0%** (30/30) | > 90% |
| Response Brevity Compliance (<65 words) | Fail | **100.0%** (30/30) | 100% |
| Policy Grounding Match Rate | 0.0% | **90.0%** (27/30) | > 85% |

---

## Live Call Readiness
The system is fully configured, tested, and ready to receive incoming calls on the Twilio phone number with forwarding to ngrok (`https://fogless-adalyn-nonsaving.ngrok-free.dev`).
Refer to [docs/VOICE_AGENT_RUNBOOK.md](file:///c:/Users/PC-ALG/Desktop/Hack-a-sol1/docs/VOICE_AGENT_RUNBOOK.md) for live calling instructions.

---

## Role-Based Access Control (RBAC), Demo Personas & Recommendation Engine (Completed)

### 1. Architecture Overview
- **PBKDF2-HMAC-SHA256 Password Hashing:** Unique 16-byte cryptographically secure salt, 100,000 iterations via `backend/app/core/security.py`.
- **Role Enforcement:** Strict server-side RBAC guards via `require_role("farmer", "officer", "admin")` preventing privilege escalation and horizontal access violations.
- **IDOR Protection:** Farmers are cryptographically and logically prohibited from querying other farmers' private financial and application records (`GET /api/v1/farmers/{farmer_id}`).
- **Jurisdictional District Scoping:** Government Extension Officers (e.g., Anita Verma assigned to Raipur) have their queries (`GET /api/v1/officer/farmers`) and individual lookups filtered strictly to their administrative jurisdiction.
- **Personalized Recommendation Engine:** Deterministic rule engine (`backend/app/services/recommendation_engine.py`) taking into account land title ownership (`landowner` vs `tenant`), acreage, crops, and irrigation status.
- **1-Click Demo Login (`POST /api/v1/auth/demo-login`):** Pre-evaluated access for judges without client-side hardcoded credentials, toggled by `ENABLE_DEMO_LOGIN=true`.

### 2. The 5 Evaluated Canonical Personas
1. **Farmer 1 (Ramesh Kumar - KS-FARM-001):** Small Landowner (2.0 acres, Raipur/Arang, Paddy & vegetables) — Eligible for PM-KISAN (₹6,000/yr), RGKNY (₹18,000/yr), KCC scale-of-finance (₹1,20,000 credit limit), and Godhan Nyay.
2. **Farmer 2 (Suresh Verma - KS-FARM-002):** Medium Landowner (5.0 acres, Durg/Patan, Irrigated Paddy & maize) — Eligible for Saur Sujala 3HP/5HP solar pump subsidy, SMAM 40-50% mechanization implements, and KCC (₹1,50,000).
3. **Farmer 3 (Mohan Sahu - KS-FARM-003):** Tenant / Sharecropper (3.0 acres, Bilaspur/Takhatpur, Rain-fed) — Accurately evaluated as **ineligible** for PM-KISAN and Saur Sujala due to mandatory RoR land title requirements; eligible for Tenant KCC credit line and PMFBY non-loanee crop insurance.
4. **Government Officer (Anita Verma - EMP-AGRI-104):** Agricultural Extension Officer with Raipur district jurisdiction — Full oversight of Raipur applications, farmer records, and discrepancies with out-of-district boundary enforcement.
5. **Platform Administrator:** Full administrative governance over user provisioning, role assignments, account status toggles, scheme lifecycle, and immutable audit logs.

### 3. Automated Verification Results
- **Test Suite:** `scripts/test_rbac.py`
- **Result:** **35/35 Tests Passed (100% Success Rate, 0 Failures)**
  - 1-Click Demo Login (5 Personas): 5/5 Pass
  - Standard Password Authentication: 6/6 Pass
  - Role-Based Route Protection: 6/6 Pass
  - Horizontal IDOR Isolation: 2/2 Pass
  - Officer District Scope Enforcement: 4/4 Pass
  - Personalized Recommendation Engine: 5/5 Pass
  - Admin User Provisioning, Role Update, Status Toggle & Audit Logging: 5/5 Pass
  - Session Invalidation & Logout: 2/2 Pass
- **Frontend Build:** `npm run build` completed with zero TypeScript errors across all 35 static/dynamic routes.

---

## Global AI Voice Command Assistant (Completed) ✅

### 1. Architecture Overview
- **Floating UI Assistant:** Global circular microphone button (`fixed bottom-6 right-6` desktop, `bottom-20 right-4` mobile avoiding navigation overlap) mounted application-wide in `PortalLayout`.
- **7-State Deterministic Machine:** `IDLE` -> `LISTENING` -> `TRANSCRIBING` -> `PROCESSING` -> `EXECUTING_ACTION` -> `SPEAKING` -> `IDLE` (with explicit `ERROR` fallback).
- **Multilingual Intent Recognition:** Comprehensive entity and intent parser supporting Hindi (Devanagari), English, and Hinglish.
- **Centralized Command Registry & Route Allowlist:** 18 authorized voice commands with strictly allowlisted Next.js route mapping, prohibiting arbitrary script or URL execution.
- **Multi-Turn Contextual Memory:** In-memory session context cache isolated per user (`sessionId`), enabling seamless follow-up references (*"Tell me about the first one"* -> *"Where can I apply for it?"*).
- **Personalized Loan & Scheme Recommendations:** Differentiates landowner vs. tenant profiles across verified credit products (KCC, SBI Kisan Gold Card, Bank of Baroda KCC, Mahindra Tractor Finance, Bajaj Allianz Crop Insurance, NABARD Joint Liability Credit Line).
- **Verified Application Guidance:** Direct provision of physical branch channels, document requirements, and verified official government/lender portal URLs.
- **Multimodal Interaction:** Web Speech API STT and TTS with audio waveform visualization (`VoiceWaveform`), coupled with text input fallback and clickable follow-up chips.

### 2. Automated Verification Results
- **Test Suite:** `scripts/test_voice_assistant.py`
- **Result:** **30/30 Tests Passed (100% Success Rate, 0 Failures)**
  - Navigation Voice Commands: 8/8 Pass
  - Personalized Agricultural Loan Recommendations (Farmer 1, Farmer 2, Farmer 3): 3/3 Pass
  - Verified Application Guidance ("Where can I apply?"): 3/3 Pass
  - Multi-Turn Conversation Context Retention: 3/3 Pass
  - Scheme & Subsidy Eligibility Queries: 3/3 Pass
  - Financial Digital Twin & Missing Documents: 3/3 Pass
  - Multilingual Understanding (Devanagari Hindi & Hinglish): 4/4 Pass
  - Security, RBAC & Isolation Boundaries: 3/3 Pass
- **Frontend Build:** `next build --webpack` completed with exit code 0 across 35/35 routes.

### 3. Documentation Deliverables
- `docs/VOICE_ASSISTANT_ARCHITECTURE.md`: High-level system diagram, data flow, UI states, multi-turn architecture, security.
- `docs/VOICE_COMMAND_REGISTRY.md`: Complete allowlist table of commands, categories, parameters, responses, and loan channels.
- `docs/VOICE_ASSISTANT_TEST_REPORT.md`: Comprehensive breakdown of all 30 automated test assertions.
- `docs/VOICE_ASSISTANT_SETUP.md`: Developer and user runbook for microphone setup, browser testing, and supported languages.
