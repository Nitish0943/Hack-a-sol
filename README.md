# KrishiSetu (कृषि सेतु)
### Next-Generation Agricultural Entitlement Intelligence & Benefit Transparency Platform
**Problem Statement GT-01 — Agricultural Policy, Loan & Subsidy Transparency Platform**

---

## 🌾 Overview & Vision
Indian farmers—particularly smallholders, tenant cultivators, and sharecroppers—face systemic barriers navigating complex government agricultural support schemes. They are frequently confronted with unexplainable rejections, opaque policy calculations, land title disputes, and silent DBT payment failures.

**KrishiSetu is not just an informational portal or another generic AI chatbot.**
It is a comprehensive **Agricultural Entitlement Intelligence and Benefit Transparency Platform** designed around a fundamental principle:

> **Do not just tell a farmer which scheme exists. Help the farmer understand what support may be available, what is preventing access, and what legitimate next steps they can take.**

---

## 🏛️ System Architecture

```
                             ┌───────────────────────────────────────────────┐
                             │             KrishiSetu Platform               │
                             └───────────────────────┬───────────────────────┘
                                                     │
             ┌───────────────────────────────────────┴───────────────────────────────────────┐
             │                                                                               │
             ▼                                                                               ▼
┌─────────────────────────┐                                                     ┌─────────────────────────┐
│ Next.js 16 (App Router) │                                                     │     FastAPI Gateway     │
│   Liquid Glass UI       │                                                     │  Deterministic Engines  │
├─────────────────────────┤                                                     ├─────────────────────────┤
│ • Farmer Portal         │                                                     │ • Eligibility Engine    │
│ • Officer Desk          │ ◄──────────────── REST APIs ──────────────────────► │ • Integrity Audit       │
│ • Admin Governance      │                   (JSON v1)                         │ • Scheme Change Radar   │
│ • Voice / Audio (Web)   │                                                     │ • Blocker Diagnosis     │
│ • IVR Phone Simulator   │                                                     │ • Benefit Calculator    │
│ • i18n (Hi / Cghi / En) │                                                     │ • Async SQLite Database │
└─────────────────────────┘                                                     └─────────────────────────┘
```

---

## ✨ 14 Core Functional Modules

1. **Farmer Registration & Profile with Cultivator Identity Bridge**:
   - Collects necessary demographic, geographic, and land data without asking for sensitive Aadhaar numbers or bank PINs.
   - Decouples legal land ownership from actual cultivation, providing legal recognition for tenant farmers, sharecroppers (बटाईदार), and oral lessees.

2. **Intelligent Scheme Discovery**:
   - Catalogs verified Central & State schemes (PM-KISAN, KCC, PMFBY, RGKNY, PM-KMY, SMAM, MIDH).
   - Filter by income support, agricultural credit, insurance, and equipment subsidies.

3. **Deterministic Eligibility Intelligence Engine**:
   - Zero hallucination: All assessments are computed by structured, versioned business rules.
   - 4 clear outcomes: `POTENTIALLY_ELIGIBLE`, `NOT_ELIGIBLE_BASED_ON_AVAILABLE_INFO`, `NEEDS_ADDITIONAL_VERIFICATION`, `INCOMPLETE_INFORMATION`.
   - Complete condition trace showing passed, failed, and unverified criteria with statutory clause citations.

4. **Farmer Financial Digital Twin (Lifecycle Ledger)**:
   - Strictly separates potential, applied, approved, sanctioned, disbursed, and received funds across 6 lifecycle stages.
   - Never combines unreceived or estimated amounts into misleading balances.

5. **Policy-to-Payment Integrity Engine**:
   - Compares expected entitlement against official sanction orders.
   - Automatically flags variances, scale of finance under-allocations, and undisbursed sanctions.

6. **Cultivator Identity Bridge**:
   - Provides a formal verification pathway for non-titleholder cultivators with Gram Sabha and Panchayat attestation.

7. **Scheme Change Impact Radar**:
   - Versioned circular tracking with clause-level diffing between previous and active guidelines.
   - Analyzes vulnerable beneficiary impact counts and required remediation steps.

8. **Access Blocker Diagnosis**:
   - Interactive troubleshooting for common failures: Aadhaar-NPCI bank DBT mapper issues, pending Bhuiyan mutation, Girdawari gaps.

9. **Loan & Subsidy Calculator**:
   - Exact mathematical breakdown of KCC interest subvention (4% net interest), SMAM farm machinery (50%), micro-irrigation (70%), and RGKNY input assistance (₹9,000/acre).

10. **Application Tracking & Grievance Redressal**:
    - Complete dossier history and 15-day Citizen Charter SLA tracking with formal ticket reference generation.

11. **Extension Officer Workbench**:
    - Agricultural Extension Officers (RAEO) can inspect farmer dossiers, review cultivator declarations, endorse sharecroppers, and investigate discrepancy variances.

12. **Administrator Governance Portal**:
    - Role-Based Access Control (RBAC), statutory scheme rule management, policy diff publishing, and immutable audit logs.

13. **Accessible Telephone Assistance Simulator (IVR 1800-890-SETU)**:
    - Interactive DTMF keypad dialer (1-9, *, #) with audio voice response and live backend key processing.

14. **Multilingual Accessibility**:
    - Full support for Hindi (हिन्दी), Chhattisgarhi (छत्तीसगढ़ी), and English.
    - One-click Web Speech API read-aloud functionality across all pages.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 20.9+ and npm
- Python 3.12+

### 1. Start the Backend API
In terminal 1:
```powershell
cd backend
# Create virtual environment if needed
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt   # or uv sync
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/status`

### 2. Start the Frontend
In terminal 2:
```powershell
cd frontend
npm install
npm run dev
```
- Open `http://localhost:3000` in your browser.

---

## 🧪 Testing & Verification

### Run Backend Unit Tests:
```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
```
Output:
```
============================== 9 passed in 1.67s ==============================
```

### Run Frontend Typecheck & Production Build:
```powershell
cd frontend
npm run typecheck
npm run build
```
Output:
```
✓ Compiled successfully in 5.3s
✓ Generating static pages using 7 workers (31/31)
```

---

## 👥 Demo Personas & Logins
Explore all portals using 1-click role switcher on `/login`:
- **Farmer Profile**: Ramesh Kumar (`ramesh.kumar`) — Dharsiwa, Raipur
- **Officer Workbench**: Anita Verma (`anita.verma`) — RAEO, Raipur District
- **Platform Administrator**: System Admin (`admin`) — State Governance
