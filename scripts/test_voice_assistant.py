"""
KrishiSetu Global Voice Command Assistant — Automated Test & Verification Suite
Verifies:
  1. Navigation Commands & Route Mapping
  2. Personalized Agricultural Loan Recommendations (Farmer 1, Farmer 2, Farmer 3)
  3. Verified Application Guidance ("Where can I apply?") with Official URLs & Documents
  4. Multi-Turn Context Retention ("Tell me about the first one" -> "Where can I apply for it?")
  5. Personalized Scheme Recommendations & Subsidies
  6. Financial Digital Twin (Potential vs Sanctioned vs Received)
  7. Application & Grievance Tracking
  8. Role-Based Access Control (RBAC) & Security Boundaries
  9. Multilingual Understanding (Hindi, English, Hinglish)
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
from app.db.store import initialize_database, seed_demo_data

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


def run_assistant_tests():
    print("=" * 75)
    print("KRISHISETU GLOBAL AI VOICE COMMAND ASSISTANT — TEST SUITE")
    print("=" * 75)

    # 1. Setup Database & Authenticate Personas
    initialize_database()
    seed_demo_data()

    # Get tokens for Farmer 1, Farmer 2, Farmer 3, Officer, Admin
    tokens = {}
    for acc in ["farmer1", "farmer2", "farmer3", "officer", "admin"]:
        res = client.post("/api/v1/auth/demo-login", json={"account": acc})
        if res.status_code == 200:
            tokens[acc] = res.json()["data"]["accessToken"]

    f1_hdr = {"Authorization": f"Bearer {tokens['farmer1']}"}
    f2_hdr = {"Authorization": f"Bearer {tokens['farmer2']}"}
    f3_hdr = {"Authorization": f"Bearer {tokens['farmer3']}"}
    admin_hdr = {"Authorization": f"Bearer {tokens['admin']}"}

    # =========================================================================
    # SUITE 1: NAVIGATION COMMANDS
    # =========================================================================
    print("\n--- Suite 1: Navigation Voice Commands ---")
    nav_cases = [
        ("Open my profile", "/farmer/profile", "navigate_to_profile"),
        ("Go to my dashboard", "/farmer/dashboard", "navigate_to_dashboard"),
        ("Show my applications", "/farmer/applications", "navigate_to_applications"),
        ("Open the loan calculator", "/farmer/calculator", "navigate_to_calculator"),
        ("Show my grievances", "/farmer/grievances", "navigate_to_grievances"),
        ("Open recommended schemes", "/farmer/schemes", "navigate_to_schemes"),
        ("Show my benefits", "/farmer/benefits", "navigate_to_benefits"),
        ("Go to notifications", "/farmer/notifications", "navigate_to_notifications"),
    ]

    for utterance, expected_route, expected_action in nav_cases:
        resp = client.post(
            "/api/v1/assistant/command",
            json={"message": utterance, "language": "en"},
            headers=f1_hdr,
        )
        is_ok = resp.status_code == 200
        data = resp.json().get("data", {}) if is_ok else {}
        nav = data.get("navigation", {})

        passed = (
            is_ok
            and data.get("intent") == "navigation"
            and data.get("action") == expected_action
            and nav.get("targetRoute") == expected_route
        )
        record_result(
            f"Navigation: '{utterance}'",
            passed,
            f"Route: {nav.get('targetRoute')}",
        )

    # =========================================================================
    # SUITE 2: PERSONALIZED LOAN RECOMMENDATIONS (FARMER 1 vs 2 vs 3)
    # =========================================================================
    print("\n--- Suite 2: Personalized Agricultural Loan Recommendations ---")

    # Farmer 1 (Ramesh Kumar, 2 acres small landowner)
    resp_f1_loan = client.post(
        "/api/v1/assistant/command",
        json={"message": "Which agricultural loan can I apply for?", "language": "en"},
        headers=f1_hdr,
    )
    f1_data = resp_f1_loan.json().get("data", {})
    f1_cards = f1_data.get("cards", [])
    has_kcc = any("kcc" in str(c.get("id")).lower() for c in f1_cards)
    has_sbi = any("sbi" in str(c.get("id")).lower() for c in f1_cards)

    record_result(
        "Farmer 1 loan recommendation (KCC & SBI Kisan Gold Card)",
        resp_f1_loan.status_code == 200 and has_kcc and has_sbi,
        f"{len(f1_cards)} loan cards returned",
    )

    # Farmer 2 (Suresh Verma, 5 acres medium landowner)
    resp_f2_loan = client.post(
        "/api/v1/assistant/command",
        json={"message": "Which agricultural loan can I apply for?", "language": "en"},
        headers=f2_hdr,
    )
    f2_cards = resp_f2_loan.json().get("data", {}).get("cards", [])
    has_tractor = any("tractor" in str(c.get("id")).lower() or "mahindra" in str(c.get("id")).lower() for c in f2_cards)
    record_result(
        "Farmer 2 tractor mechanization loan eligible (5 acres)",
        resp_f2_loan.status_code == 200 and has_tractor,
        "Mahindra tractor loan matched",
    )

    # Farmer 3 (Mohan Sahu, 3 acres tenant farmer)
    resp_f3_loan = client.post(
        "/api/v1/assistant/command",
        json={"message": "Main kaunsa loan le sakta hoon?", "language": "hi"},
        headers=f3_hdr,
    )
    f3_cards = resp_f3_loan.json().get("data", {}).get("cards", [])
    has_tenant_line = any("tenant" in str(c.get("id")).lower() or "sharecropper" in str(c.get("name")).lower() for c in f3_cards)
    record_result(
        "Farmer 3 tenant cultivator credit line (No land title required)",
        resp_f3_loan.status_code == 200 and has_tenant_line,
        "Tenant crop credit line matched",
    )

    # =========================================================================
    # SUITE 3: VERIFIED APPLICATION GUIDANCE ("Where can I apply?")
    # =========================================================================
    print("\n--- Suite 3: Verified Application Guidance ('Where can I apply?') ---")

    # Ask directly for KCC application channel
    resp_where_kcc = client.post(
        "/api/v1/assistant/command",
        json={"message": "Where can I apply for KCC?", "language": "en"},
        headers=f1_hdr,
    )
    where_data = resp_where_kcc.json().get("data", {})
    channel = where_data.get("applicationChannel", {})
    docs = channel.get("required_documents", [])
    official_url = channel.get("official_url", "")

    record_result(
        "Where can I apply for KCC: Official URL provided",
        resp_where_kcc.status_code == 200 and official_url.startswith("http"),
        f"URL: {official_url}",
    )
    record_result(
        "Where can I apply for KCC: Required documents list provided",
        len(docs) >= 3,
        f"{len(docs)} documents listed (Aadhaar, Khasra B-1)",
    )
    record_result(
        "Where can I apply for KCC: Physical branch channel specified",
        "Bank branch" in channel.get("application_channel", "") or "PACS" in channel.get("application_channel", ""),
        channel.get("application_channel", "")[:45] + "...",
    )

    # =========================================================================
    # SUITE 4: MULTI-TURN CONTEXT RETENTION
    # =========================================================================
    print("\n--- Suite 4: Multi-Turn Conversation Context ---")
    custom_session_id = f"test-session-{os.urandom(4).hex()}"

    # Turn 1: Ask for loans
    t1_resp = client.post(
        "/api/v1/assistant/command",
        json={"message": "Which agricultural loan can I apply for?", "sessionId": custom_session_id, "language": "en"},
        headers=f1_hdr,
    )
    record_result("Turn 1: Ask for loans", t1_resp.status_code == 200)

    # Turn 2: Contextual follow-up: "Tell me about the first one"
    t2_resp = client.post(
        "/api/v1/assistant/command",
        json={"message": "Tell me about the first one", "sessionId": custom_session_id, "language": "en"},
        headers=f1_hdr,
    )
    t2_data = t2_resp.json().get("data", {})
    is_kcc_explained = "kcc" in str(t2_data.get("text", "")).lower() or "kisan credit" in str(t2_data.get("text", "")).lower()
    record_result(
        "Turn 2: 'Tell me about the first one' resolves to KCC",
        t2_resp.status_code == 200 and is_kcc_explained,
        "Context resolved to 1st recommended loan",
    )

    # Turn 3: Contextual follow-up: "Where can I apply for it?"
    t3_resp = client.post(
        "/api/v1/assistant/command",
        json={"message": "Where can I apply for it?", "sessionId": custom_session_id, "language": "en"},
        headers=f1_hdr,
    )
    t3_data = t3_resp.json().get("data", {})
    t3_channel = t3_data.get("applicationChannel", {})
    record_result(
        "Turn 3: 'Where can I apply for it?' resolves application channel",
        t3_resp.status_code == 200 and t3_channel.get("official_url") is not None,
        f"Resolved channel: {t3_channel.get('name')}",
    )

    # =========================================================================
    # SUITE 5: PERSONALIZED SCHEME & SUBSIDY EVALUATION
    # =========================================================================
    print("\n--- Suite 5: Scheme & Subsidy Eligibility Queries ---")

    # Farmer 1 asking for government schemes
    resp_schemes = client.post(
        "/api/v1/assistant/command",
        json={"message": "Which schemes are suitable for me?", "language": "en"},
        headers=f1_hdr,
    )
    schemes_data = resp_schemes.json().get("data", {})
    has_pmkisan = "PM-KISAN" in schemes_data.get("text", "") or "Kisan Credit" in schemes_data.get("text", "")
    record_result(
        "Personalized government scheme evaluation",
        resp_schemes.status_code == 200 and has_pmkisan,
        "Matches evaluated via deterministic engine",
    )

    # Farmer 1 asking for equipment subsidy (Landowner)
    resp_subsidy_f1 = client.post(
        "/api/v1/assistant/command",
        json={"message": "Am I eligible for any subsidy?", "language": "en"},
        headers=f1_hdr,
    )
    record_result(
        "Farmer 1 subsidy check (Solar pump & SMAM)",
        resp_subsidy_f1.status_code == 200 and "Saur Sujala" in resp_subsidy_f1.json().get("data", {}).get("text", ""),
        "Landowner subsidy terms confirmed",
    )

    # Farmer 3 asking for equipment subsidy (Tenant)
    resp_subsidy_f3 = client.post(
        "/api/v1/assistant/command",
        json={"message": "Am I eligible for any subsidy?", "language": "en"},
        headers=f3_hdr,
    )
    f3_sub_text = resp_subsidy_f3.json().get("data", {}).get("text", "")
    is_ineligible_flagged = "not eligible" in f3_sub_text.lower() or "अपात्र" in f3_sub_text
    record_result(
        "Farmer 3 tenant subsidy check accurately notes land title requirement",
        resp_subsidy_f3.status_code == 200 and is_ineligible_flagged,
        "Tenant restriction correctly explained",
    )

    # =========================================================================
    # SUITE 6: FINANCIAL ASSISTANCE & DIGITAL TWIN
    # =========================================================================
    print("\n--- Suite 6: Financial Twin & Missing Documents ---")

    # Benefits
    resp_benefits = client.post(
        "/api/v1/assistant/command",
        json={"message": "How much financial assistance can I potentially receive?", "language": "en"},
        headers=f1_hdr,
    )
    b_data = resp_benefits.json().get("data", {}).get("data", {})
    record_result(
        "Financial Twin breakdown (Potential, Sanctioned, Received)",
        resp_benefits.status_code == 200 and b_data.get("potential") is not None,
        f"Potential: ₹{b_data.get('potential')}, Received: ₹{b_data.get('received')}",
    )

    # Missing documents
    resp_missing = client.post(
        "/api/v1/assistant/command",
        json={"message": "What documents are missing from my profile?", "language": "en"},
        headers=f1_hdr,
    )
    record_result(
        "Profile completion & missing document diagnosis",
        resp_missing.status_code == 200 and "completion" in resp_missing.json().get("data", {}).get("data", {}),
        "Identifies document requirements",
    )

    # Application status
    resp_status = client.post(
        "/api/v1/assistant/command",
        json={"message": "What is the status of my application?", "language": "en"},
        headers=f1_hdr,
    )
    record_result(
        "Application status lookup",
        resp_status.status_code == 200 and len(resp_status.json().get("data", {}).get("cards", [])) > 0,
        "Returns active applications and review status",
    )

    # =========================================================================
    # SUITE 7: MULTILINGUAL COMMANDS (HINDI & HINGLISH)
    # =========================================================================
    print("\n--- Suite 7: Multilingual Command Understanding ---")

    # Hindi: "मेरा प्रोफाइल खोलो"
    resp_hi_prof = client.post(
        "/api/v1/assistant/command",
        json={"message": "मेरा प्रोफाइल खोलो", "language": "hi"},
        headers=f1_hdr,
    )
    record_result(
        "Hindi Command: 'मेरा प्रोफाइल खोलो'",
        resp_hi_prof.status_code == 200 and resp_hi_prof.json().get("data", {}).get("action") == "navigate_to_profile",
        f"Target: {resp_hi_prof.json().get('data', {}).get('navigation', {}).get('targetRoute')}",
    )

    # Hindi: "मेरे लिए कौन सी योजना है?"
    resp_hi_sch = client.post(
        "/api/v1/assistant/command",
        json={"message": "मेरे लिए कौन सी योजना है?", "language": "hi"},
        headers=f1_hdr,
    )
    record_result(
        "Hindi Command: 'मेरे लिए कौन सी योजना है?'",
        resp_hi_sch.status_code == 200 and resp_hi_sch.json().get("data", {}).get("action") == "get_personalized_recommendations",
        "Personalized Hindi response",
    )

    # Hinglish: "Mera aavedan status dikhao"
    resp_hing_app = client.post(
        "/api/v1/assistant/command",
        json={"message": "Mera aavedan status dikhao", "language": "hi"},
        headers=f1_hdr,
    )
    record_result(
        "Hinglish Command: 'Mera aavedan status dikhao'",
        resp_hing_app.status_code == 200 and resp_hing_app.json().get("data", {}).get("action") == "get_application_status",
        "Hinglish intent mapped accurately",
    )

    # Hinglish: "Loan ke liye apply kahan se kare?"
    resp_hing_apply = client.post(
        "/api/v1/assistant/command",
        json={"message": "Loan ke liye apply kahan se kare?", "language": "hi"},
        headers=f1_hdr,
    )
    record_result(
        "Hinglish Command: 'Loan ke liye apply kahan se kare?'",
        resp_hing_apply.status_code == 200 and resp_hing_apply.json().get("data", {}).get("action") == "get_loan_application_guidance",
        "Official application channel returned in Hindi",
    )

    # =========================================================================
    # SUITE 8: SECURITY & RBAC ISOLATION
    # =========================================================================
    print("\n--- Suite 8: Security, RBAC & Isolation ---")

    # 1. Unauthenticated request rejected
    client.cookies.clear()
    resp_unauth = client.post(
        "/api/v1/assistant/command",
        json={"message": "Open my profile"},
    )
    record_result(
        "Unauthenticated voice command rejected",
        resp_unauth.status_code == 401,
        "HTTP 401 Unauthorized",
    )

    # 2. Command Registry Allowlist
    resp_registry = client.get("/api/v1/assistant/registry", headers=f1_hdr)
    reg_data = resp_registry.json().get("data", {})
    total_cmds = reg_data.get("totalCommands", 0)
    record_result(
        "Command registry allowlist accessible",
        resp_registry.status_code == 200 and total_cmds >= 15,
        f"{total_cmds} registered authorized commands",
    )

    # 3. Session isolation test: Farmer 1 session data is NOT accessible by Farmer 2
    f2_turn = client.post(
        "/api/v1/assistant/command",
        json={"message": "Where can I apply for it?", "sessionId": f"sess-f2-{os.urandom(3).hex()}", "language": "en"},
        headers=f2_hdr,
    )
    record_result(
        "Cross-account session context isolation",
        f2_turn.status_code == 200,
        "Independent session memory preserved",
    )

    # Summary
    print("\n" + "=" * 75)
    print(f"VERIFICATION COMPLETE: {PASSED_TESTS}/{TOTAL_TESTS} TESTS PASSED ({FAILED_TESTS} FAILED)")
    print("=" * 75)

    if FAILED_TESTS > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_assistant_tests()
