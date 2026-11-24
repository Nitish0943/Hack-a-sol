# KrishiSetu — Role-Based Access Control (RBAC), Demo Accounts & Recommendation Engine Verification Report

**Date:** November 24, 2026  
**Status:** ALL PHASES IMPLEMENTED & VERIFIED (35/35 Automated Tests Passing)  
**Test Suite:** `scripts/test_rbac.py`  
**Frontend Build:** `npm run build` Verified (Zero Compilation or TypeScript Errors)

---

## 1. Implementation Summary

### Security & Password Architecture
- **PBKDF2-HMAC-SHA256:** Implemented in `backend/app/core/security.py` using a cryptographically random 16-byte salt with 100,000 iterations.
- **Session Tokens:** URL-safe 32-byte cryptographically secure random session tokens with UTC timestamp expiration (`calculate_session_expiry`).
- **Server-Side Role Guard:** Role requirements enforced via FastAPI dependency `require_role("farmer", "officer", "admin")`.
- **Horizontal Access & IDOR Isolation:** `GET /api/v1/farmers/{farmer_id}` strictly verifies that authenticated farmers can only query their own records, returning HTTP 403 Forbidden for cross-farmer queries.
- **Officer Jurisdictional District Scoping:** Officers (e.g. Anita Verma assigned to Raipur) have farmer queries (`GET /api/v1/officer/farmers`) and individual lookup endpoints constrained strictly to their assigned district.

### 5 Canonical Demo Personas
1. **Farmer 1 (Ramesh Kumar - KS-FARM-001):**
   - **Credentials:** `farmer1@krishisetu.demo` / `9876543210` / `DemoFarmer1@2026`
   - **Profile:** 2.0 acres landowner in Khamtarai, Arang, Raipur. Paddy and vegetable crops.
   - **Recommendations:** Eligible for PM-KISAN (₹6,000/yr), RGKNY (₹18,000/yr), KCC scale-of-finance crop credit (₹1,20,000 limit), and Godhan Nyay.
   - **Applications & Discrepancies:** Sanction shortfall of ₹4,000 on PMFBY flagged in Financial Digital Twin.
2. **Farmer 2 (Suresh Verma - KS-FARM-002):**
   - **Credentials:** `farmer2@krishisetu.demo` / `9876543211` / `DemoFarmer2@2026`
   - **Profile:** 5.0 acres irrigated landowner in Jamgaon, Patan, Durg. Paddy and maize.
   - **Recommendations:** Eligible for PM-KISAN, Saur Sujala 3HP/5HP solar pump subsidy, and SMAM farm mechanization subsidy (40-50% on rotavators/power tillers).
   - **Financial Twin:** ₹1,50,000 received on KCC; ₹45,000 sanctioned for solar pump.
3. **Farmer 3 (Mohan Sahu - KS-FARM-003):**
   - **Credentials:** `farmer3@krishisetu.demo` / `9876543212` / `DemoFarmer3@2026`
   - **Profile:** 3.0 acres tenant / sharecropper in Belpan, Takhatpur, Bilaspur. Rain-fed cultivation.
   - **Recommendations:** Correctly evaluated as **not eligible** for PM-KISAN and Saur Sujala due to mandatory land title (RoR) ownership requirements; eligible for Tenant KCC credit line and PMFBY non-loanee crop insurance.
   - **Applications:** Sharecropper credit line approved with village cultivation certificate.
4. **Government Extension Officer (Anita Verma - EMP-AGRI-104):**
   - **Credentials:** `officer@krishisetu.demo` / `9876500001` / `DemoOfficer@2026`
   - **Scope:** Agriculture Department, Raipur District jurisdiction. Access to application review, grievance escalation, and cultivator verification queues.
5. **Platform Administrator:**
   - **Credentials:** `admin@krishisetu.demo` / `9876500002` / `DemoAdmin@2026`
   - **Scope:** System-wide governance, user provisioning, role assignments, account status toggling, and audit log analysis.

---

## 2. Automated Test Results (`scripts/test_rbac.py`)

```
======================================================================
KRISHISETU — RBAC & RECOMMENDATION ENGINE VERIFICATION SUITE
======================================================================

--- Suite 1: 1-Click Demo Login API (5 Canonical Personas) ---
  [PASS] Demo Login: farmer1 (Ramesh Kumar) (role=farmer)
  [PASS] Demo Login: farmer2 (Suresh Verma) (role=farmer)
  [PASS] Demo Login: farmer3 (Mohan Sahu) (role=farmer)
  [PASS] Demo Login: officer (Anita Verma) (role=officer)
  [PASS] Demo Login: admin (Platform Administrator) (role=admin)

--- Suite 2: Password Authentication ---
  [PASS] Farmer 1 email login (Status 200)
  [PASS] Farmer 2 mobile login (Status 200)
  [PASS] Officer email login (Status 200)
  [PASS] Admin email login (Status 200)
  [PASS] Invalid password rejection (Rejected with 401)
  [PASS] Unknown user rejection (Rejected with 401)

--- Suite 3: Role-Based Route Protection ---
  [PASS] Farmer blocked from /officer/dashboard (Code 403)
  [PASS] Farmer blocked from /admin/users (Code 403)
  [PASS] Officer blocked from /admin/users (Code 403)
  [PASS] Farmer can access /farmers/me/dashboard 
  [PASS] Officer can access /officer/dashboard 
  [PASS] Admin can access /admin/dashboard 

--- Suite 4: IDOR Protection (Horizontal Access Isolation) ---
  [PASS] Farmer 1 blocked from Farmer 2 profile (IDOR) (Code 403)
  [PASS] Farmer 1 can access own profile 

--- Suite 5: Officer District Scope Enforcement ---
  [PASS] Officer farmer list strictly scoped to Raipur (3 farmers returned (Raipur only))
  [PASS] Officer can view Raipur farmer (in jurisdiction) 
  [PASS] Officer blocked from Durg farmer (out of jurisdiction) (Code 403)
  [PASS] Admin can view any farmer (global jurisdiction) 

--- Suite 6: Personalized Recommendation Engine ---
  [PASS] Farmer 1 eligible for PM-KISAN (Landowner) (Status: eligible)
  [PASS] Farmer 2 eligible for Saur Sujala (5 acres irrigated) (Status: eligible)
  [PASS] Farmer 3 (Tenant) NOT eligible for PM-KISAN (Missing Land Title)
  [PASS] Farmer 3 (Tenant) NOT eligible for Saur Sujala (Ownership required)
  [PASS] Farmer 3 eligible for PMFBY (Sharecroppers covered) (Status: potentially_eligible)

--- Suite 7: Admin Provisioning, Role Update & Audit Logs ---
  [PASS] Admin can provision new officer account 
  [PASS] Admin can update user role 
  [PASS] Admin can deactivate user account 
  [PASS] Deactivated user login rejected 
  [PASS] Admin audit logs recorded securely (6 audit logs found)

--- Suite 8: Session Logout & Invalidation ---
  [PASS] Session logout succeeds 
  [PASS] Session token invalidated post-logout 

======================================================================
VERIFICATION COMPLETE: 35/35 TESTS PASSED (0 FAILED)
======================================================================
```

---

## 3. Frontend & Build Verification

- **Production Build:** `npm run build` executed and passed with code 0.
- **Compiled Routes:** All 35 application routes compiled cleanly with 0 TypeScript errors.
- **Login Page:** Includes 1-Click Demo Access for the 5 identities, Mobile OTP login with demo code support (`123456`), and standard password login.
- **Farmer Dashboard:** Dynamically updates Next Best Action and recommended feeds based on authenticated farmer persona data.
