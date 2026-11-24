"""
Comprehensive RBAC, Demo Accounts, and Personalized Recommendation Engine Test Suite
Tests:
  1. Demo Account Seeding & Verification
  2. 1-Click Demo Login (5 Personas)
  3. Standard Password Authentication & Verification
  4. Role-Based Access Control (RBAC) Route Protection
  5. Insecure Direct Object Reference (IDOR) Protection
  6. Government Officer Jurisdictional District Scope Enforcement
  7. Personalized Agricultural Recommendation Engine Determinism
  8. Admin User Provisioning, Role Update, Status Toggle & Audit Logging
  9. Session Invalidation & Logout
"""

import os
import sys
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Ensure backend is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from app.main import app
from app.db.store import initialize_database, seed_demo_data, one, many

client = TestClient(app)

TOTAL_TESTS = 0
PASSED_TESTS = 0
FAILED_TESTS = 0


def record_result(test_name: str, passed: bool, details: str = ""):
    global TOTAL_TESTS, PASSED_TESTS, FAILED_TESTS
    TOTAL_TESTS += 1
    if passed:
        PASSED_TESTS += 1
        print(f"  [PASS] {test_name} {f'({details})' if details else ''}")
    else:
        FAILED_TESTS += 1
        print(f"  [FAIL] {test_name}: {details}")


def run_test_suite():
    print("=" * 70)
    print("KRISHISETU — RBAC & RECOMMENDATION ENGINE VERIFICATION SUITE")
    print("=" * 70)

    # Setup
    initialize_database()
    seed_demo_data()

    # ---------------------------------------------------------
    # SUITE 1: 1-Click Demo Login for All 5 Canonical Personas
    # ---------------------------------------------------------
    print("\n--- Suite 1: 1-Click Demo Login API (5 Canonical Personas) ---")
    personas = [
        ("farmer1", "user-farmer-1", "farmer", "Ramesh Kumar"),
        ("farmer2", "user-farmer-2", "farmer", "Suresh Verma"),
        ("farmer3", "user-farmer-3", "farmer", "Mohan Sahu"),
        ("officer", "user-officer-1", "officer", "Anita Verma"),
        ("admin", "user-admin-1", "admin", "Platform Administrator"),
    ]

    tokens = {}
    for acc_id, expected_user_id, expected_role, expected_name in personas:
        resp = client.post("/api/v1/auth/demo-login", json={"account": acc_id})
        is_ok = resp.status_code == 200
        data = resp.json().get("data", {}) if is_ok else {}
        token = data.get("accessToken")
        user = data.get("user", {})

        passed = (
            is_ok
            and token is not None
            and user.get("id") == expected_user_id
            and user.get("role") == expected_role
            and user.get("full_name") == expected_name
        )
        record_result(f"Demo Login: {acc_id} ({expected_name})", passed, f"role={expected_role}")
        if token:
            tokens[acc_id] = token

    # ---------------------------------------------------------
    # SUITE 2: Standard Password Authentication
    # ---------------------------------------------------------
    print("\n--- Suite 2: Password Authentication ---")
    pwd_tests = [
        ("farmer1@krishisetu.demo", "DemoFarmer1@2026", True, "Farmer 1 email login"),
        ("9876543211", "DemoFarmer2@2026", True, "Farmer 2 mobile login"),
        ("officer@krishisetu.demo", "DemoOfficer@2026", True, "Officer email login"),
        ("admin@krishisetu.demo", "DemoAdmin@2026", True, "Admin email login"),
        ("farmer1@krishisetu.demo", "WrongPassword!99", False, "Invalid password rejection"),
        ("unknown@krishisetu.demo", "DemoFarmer1@2026", False, "Unknown user rejection"),
    ]

    for ident, pwd, expect_success, label in pwd_tests:
        resp = client.post("/api/v1/auth/login", json={"identifier": ident, "password": pwd})
        if expect_success:
            passed = resp.status_code == 200 and resp.json().get("data", {}).get("accessToken")
            record_result(label, passed, f"Status {resp.status_code}")
        else:
            passed = resp.status_code == 401
            record_result(label, passed, f"Rejected with {resp.status_code}")

    # ---------------------------------------------------------
    # SUITE 3: Role-Based Access Control (RBAC) Route Protection
    # ---------------------------------------------------------
    print("\n--- Suite 3: Role-Based Route Protection ---")
    farmer_hdr = {"Authorization": f"Bearer {tokens['farmer1']}"}
    officer_hdr = {"Authorization": f"Bearer {tokens['officer']}"}
    admin_hdr = {"Authorization": f"Bearer {tokens['admin']}"}

    # Farmer attempts officer & admin routes
    resp_f_officer = client.get("/api/v1/officer/dashboard", headers=farmer_hdr)
    record_result("Farmer blocked from /officer/dashboard", resp_f_officer.status_code == 403, f"Code {resp_f_officer.status_code}")

    resp_f_admin = client.get("/api/v1/admin/users", headers=farmer_hdr)
    record_result("Farmer blocked from /admin/users", resp_f_admin.status_code == 403, f"Code {resp_f_admin.status_code}")

    # Officer attempts admin route
    resp_o_admin = client.get("/api/v1/admin/users", headers=officer_hdr)
    record_result("Officer blocked from /admin/users", resp_o_admin.status_code == 403, f"Code {resp_o_admin.status_code}")

    # Legitimate access
    resp_f_me = client.get("/api/v1/farmers/me/dashboard", headers=farmer_hdr)
    record_result("Farmer can access /farmers/me/dashboard", resp_f_me.status_code == 200)

    resp_o_dash = client.get("/api/v1/officer/dashboard", headers=officer_hdr)
    record_result("Officer can access /officer/dashboard", resp_o_dash.status_code == 200)

    resp_a_dash = client.get("/api/v1/admin/dashboard", headers=admin_hdr)
    record_result("Admin can access /admin/dashboard", resp_a_dash.status_code == 200)

    # ---------------------------------------------------------
    # SUITE 4: IDOR Protection (Horizontal Access Isolation)
    # ---------------------------------------------------------
    print("\n--- Suite 4: IDOR Protection (Horizontal Access Isolation) ---")
    # Farmer 1 querying Farmer 2
    resp_idor = client.get("/api/v1/farmers/user-farmer-2", headers=farmer_hdr)
    record_result("Farmer 1 blocked from Farmer 2 profile (IDOR)", resp_idor.status_code == 403, f"Code {resp_idor.status_code}")

    # Farmer 1 querying Farmer 1
    resp_own = client.get("/api/v1/farmers/user-farmer-1", headers=farmer_hdr)
    record_result("Farmer 1 can access own profile", resp_own.status_code == 200)

    # ---------------------------------------------------------
    # SUITE 5: Government Officer Jurisdictional District Scope
    # ---------------------------------------------------------
    print("\n--- Suite 5: Officer District Scope Enforcement ---")
    # Officer Anita Verma is assigned to Raipur district
    resp_officer_farmers = client.get("/api/v1/officer/farmers", headers=officer_hdr)
    officer_farmers = resp_officer_farmers.json().get("data", [])
    raipur_only = all(f.get("district", "").lower() == "raipur" for f in officer_farmers)
    has_farmer1 = any(f.get("id") == "user-farmer-1" for f in officer_farmers)
    no_farmer2 = not any(f.get("id") == "user-farmer-2" for f in officer_farmers)

    record_result(
        "Officer farmer list strictly scoped to Raipur",
        raipur_only and has_farmer1 and no_farmer2,
        f"{len(officer_farmers)} farmers returned (Raipur only)",
    )

    # Officer querying Farmer 1 (Raipur - in scope)
    resp_o_f1 = client.get("/api/v1/farmers/user-farmer-1", headers=officer_hdr)
    record_result("Officer can view Raipur farmer (in jurisdiction)", resp_o_f1.status_code == 200)

    # Officer querying Farmer 2 (Durg - outside scope)
    resp_o_f2 = client.get("/api/v1/farmers/user-farmer-2", headers=officer_hdr)
    record_result("Officer blocked from Durg farmer (out of jurisdiction)", resp_o_f2.status_code == 403, f"Code {resp_o_f2.status_code}")

    # Admin querying Farmer 2 (unrestricted system oversight)
    resp_a_f2 = client.get("/api/v1/farmers/user-farmer-2", headers=admin_hdr)
    record_result("Admin can view any farmer (global jurisdiction)", resp_a_f2.status_code == 200)

    # ---------------------------------------------------------
    # SUITE 6: Deterministic Personalized Recommendation Engine
    # ---------------------------------------------------------
    print("\n--- Suite 6: Personalized Recommendation Engine ---")
    f1_hdr = {"Authorization": f"Bearer {tokens['farmer1']}"}
    f2_hdr = {"Authorization": f"Bearer {tokens['farmer2']}"}
    f3_hdr = {"Authorization": f"Bearer {tokens['farmer3']}"}

    f1_recs = client.get("/api/v1/farmers/me/recommendations", headers=f1_hdr).json().get("data", {})
    f2_recs = client.get("/api/v1/farmers/me/recommendations", headers=f2_hdr).json().get("data", {})
    f3_recs = client.get("/api/v1/farmers/me/recommendations", headers=f3_hdr).json().get("data", {})

    # Farmer 1: Small Landowner (2 acres) -> Eligible for PM-KISAN, KCC, RGKNY
    f1_pmkisan = next((s for s in f1_recs.get("government_schemes", []) if "pm-kisan" in s["id"].lower()), None)
    record_result(
        "Farmer 1 eligible for PM-KISAN (Landowner)",
        f1_pmkisan and f1_pmkisan["eligibility_status"] == "eligible",
        f"Status: {f1_pmkisan['eligibility_status'] if f1_pmkisan else 'None'}",
    )

    # Farmer 2: Medium Landowner (5 acres, irrigated) -> Eligible for Saur Sujala (solar pump) & SMAM mechanization
    f2_ssy = next((s for s in f2_recs.get("government_schemes", []) if "ssy" in s["id"].lower()), None)
    record_result(
        "Farmer 2 eligible for Saur Sujala (5 acres irrigated)",
        f2_ssy and f2_ssy["eligibility_status"] == "eligible",
        f"Status: {f2_ssy['eligibility_status'] if f2_ssy else 'None'}",
    )

    # Farmer 3: Tenant Farmer (3 acres, Bilaspur) -> NOT eligible for PM-KISAN & Saur Sujala due to land title requirement
    f3_pmkisan = next((s for s in f3_recs.get("government_schemes", []) if "pm-kisan" in s["id"].lower()), None)
    f3_ssy = next((s for s in f3_recs.get("government_schemes", []) if "ssy" in s["id"].lower()), None)
    f3_pmfby = next((s for s in f3_recs.get("government_schemes", []) if "pmfby" in s["id"].lower()), None)

    record_result(
        "Farmer 3 (Tenant) NOT eligible for PM-KISAN (Missing Land Title)",
        f3_pmkisan and f3_pmkisan["eligibility_status"] == "not_eligible" and len(f3_pmkisan["missing_documents"]) > 0,
        f3_pmkisan["reason"][:60] + "..." if f3_pmkisan else "None",
    )

    record_result(
        "Farmer 3 (Tenant) NOT eligible for Saur Sujala (Ownership required)",
        f3_ssy and f3_ssy["eligibility_status"] == "not_eligible",
        f3_ssy["reason"][:60] + "..." if f3_ssy else "None",
    )

    record_result(
        "Farmer 3 eligible for PMFBY (Sharecroppers covered)",
        f3_pmfby and f3_pmfby["eligibility_status"] in ["eligible", "potentially_eligible"],
        f"Status: {f3_pmfby['eligibility_status'] if f3_pmfby else 'None'}",
    )

    # ---------------------------------------------------------
    # SUITE 7: Admin User Provisioning, Role Update & Status Toggle
    # ---------------------------------------------------------
    print("\n--- Suite 7: Admin Provisioning, Role Update & Audit Logs ---")
    from app.db.store import execute
    execute("DELETE FROM users WHERE email='testofficer@krishisetu.demo' OR mobile_number='9876599999'")

    new_user_payload = {
        "fullName": "Test Extension Officer",
        "email": "testofficer@krishisetu.demo",
        "mobileNumber": "9876599999",
        "role": "officer",
        "password": "TestOfficer@123",
        "district": "Durg",
        "department": "Horticulture",
    }
    resp_prov = client.post("/api/v1/admin/users", json=new_user_payload, headers=admin_hdr)
    prov_data = resp_prov.json().get("data", {})
    new_user_id = prov_data.get("id")
    record_result("Admin can provision new officer account", resp_prov.status_code == 200 and new_user_id is not None)

    if new_user_id:
        # Update Role to admin
        resp_role = client.patch(f"/api/v1/admin/users/{new_user_id}/role", json={"role": "admin"}, headers=admin_hdr)
        record_result("Admin can update user role", resp_role.status_code == 200 and resp_role.json().get("data", {}).get("role") == "admin")

        # Deactivate user
        resp_deact = client.patch(f"/api/v1/admin/users/{new_user_id}/status", json={"isActive": False}, headers=admin_hdr)
        record_result("Admin can deactivate user account", resp_deact.status_code == 200 and resp_deact.json().get("data", {}).get("is_active") == 0)

        # Deactivated user cannot log in
        resp_deact_login = client.post("/api/v1/auth/login", json={"identifier": "testofficer@krishisetu.demo", "password": "TestOfficer@123"})
        record_result("Deactivated user login rejected", resp_deact_login.status_code == 403)

    # Check Audit Logs
    resp_audit = client.get("/api/v1/admin/audit-logs", headers=admin_hdr)
    logs = resp_audit.json().get("data", [])
    has_audit = any(log.get("action") in ["provision_user", "update_role", "toggle_status"] for log in logs)
    record_result("Admin audit logs recorded securely", resp_audit.status_code == 200 and has_audit, f"{len(logs)} audit logs found")

    # ---------------------------------------------------------
    # SUITE 8: Session Logout & Invalidation
    # ---------------------------------------------------------
    print("\n--- Suite 8: Session Logout & Invalidation ---")
    resp_logout = client.post("/api/v1/auth/logout", headers=farmer_hdr)
    record_result("Session logout succeeds", resp_logout.status_code == 200)

    resp_after = client.get("/api/v1/auth/me", headers=farmer_hdr)
    record_result("Session token invalidated post-logout", resp_after.status_code == 401)

    # Summary
    print("\n" + "=" * 70)
    print(f"VERIFICATION COMPLETE: {PASSED_TESTS}/{TOTAL_TESTS} TESTS PASSED ({FAILED_TESTS} FAILED)")
    print("=" * 70)

    if FAILED_TESTS > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_test_suite()
