"""
KrishiSetu Global Voice Command Assistant Service
- Centralized Voice Command Registry & Allowlist
- Intent Classification & Entity Extraction (Hindi, English, Hinglish)
- Contextual Session Memory (Multi-turn conversations)
- Personalized Loan & Scheme Recommendations
- "Where Can I Apply?" Guidance with verified official application channels & URLs
- Safe Navigation Intent Mapping
"""

import json
import logging
import re
from typing import Any
from app.db.store import execute, many, one
from app.services.recommendation_engine import evaluate_farmer_recommendations

logger = logging.getLogger(__name__)

# In-memory session context cache: session_id -> dict
# Isolated per user/session to avoid cross-account leakage
_SESSION_CONTEXT_CACHE: dict[str, dict[str, Any]] = {}


# --------------------------------------------------------------------------
# 1. CENTRALIZED VOICE COMMAND REGISTRY (ALLOWLIST)
# --------------------------------------------------------------------------
VOICE_COMMAND_REGISTRY = {
    # Navigation Actions
    "navigate_to_profile": {
        "category": "navigation",
        "description": "Navigate to user profile page",
        "farmer_route": "/farmer/profile",
        "officer_route": "/officer/dashboard",
        "admin_route": "/admin/dashboard",
        "spoken_response_hi": "जी, आपकी प्रोफाइल खोल रहा हूँ।",
        "spoken_response_en": "Opening your profile now.",
    },
    "navigate_to_dashboard": {
        "category": "navigation",
        "description": "Navigate to main dashboard",
        "farmer_route": "/farmer/dashboard",
        "officer_route": "/officer/dashboard",
        "admin_route": "/admin/dashboard",
        "spoken_response_hi": "डैशबोर्ड पर ले जा रहा हूँ।",
        "spoken_response_en": "Taking you to your dashboard.",
    },
    "navigate_to_schemes": {
        "category": "navigation",
        "description": "Navigate to agricultural schemes directory",
        "farmer_route": "/farmer/schemes",
        "officer_route": "/officer/dashboard",
        "admin_route": "/admin/schemes",
        "spoken_response_hi": "कृषि योजनाओं की सूची खोल रहा हूँ।",
        "spoken_response_en": "Opening the government schemes catalog.",
    },
    "navigate_to_applications": {
        "category": "navigation",
        "description": "Navigate to user applications tracking",
        "farmer_route": "/farmer/applications",
        "officer_route": "/officer/applications",
        "admin_route": "/admin/dashboard",
        "spoken_response_hi": "आपके आवेदनों की सूची खोल रहा हूँ।",
        "spoken_response_en": "Opening your scheme applications page.",
    },
    "navigate_to_benefits": {
        "category": "navigation",
        "description": "Navigate to financial benefits transparency digital twin",
        "farmer_route": "/farmer/benefits",
        "officer_route": "/officer/dashboard",
        "admin_route": "/admin/dashboard",
        "spoken_response_hi": "आपका वित्तीय विवरण खोल रहा हूँ।",
        "spoken_response_en": "Opening your financial benefits breakdown.",
    },
    "navigate_to_calculator": {
        "category": "navigation",
        "description": "Navigate to loan and subsidy calculator",
        "farmer_route": "/farmer/calculator",
        "officer_route": "/officer/dashboard",
        "admin_route": "/admin/dashboard",
        "spoken_response_hi": "ऋण एवं अनुदान कैलकुलेटर खोल रहा हूँ।",
        "spoken_response_en": "Opening the loan and subsidy calculator.",
    },
    "navigate_to_eligibility": {
        "category": "navigation",
        "description": "Navigate to eligibility checker",
        "farmer_route": "/farmer/eligibility",
        "officer_route": "/officer/dashboard",
        "admin_route": "/admin/dashboard",
        "spoken_response_hi": "पात्रता जांच पृष्ठ खोल रहा हूँ।",
        "spoken_response_en": "Opening the scheme eligibility tool.",
    },
    "navigate_to_grievances": {
        "category": "navigation",
        "description": "Navigate to grievance management",
        "farmer_route": "/farmer/grievances",
        "officer_route": "/officer/grievances",
        "admin_route": "/admin/dashboard",
        "spoken_response_hi": "शिकायत निवारण पृष्ठ खोल रहा हूँ।",
        "spoken_response_en": "Opening your grievance management page.",
    },
    "navigate_to_notifications": {
        "category": "navigation",
        "description": "Navigate to notifications center",
        "farmer_route": "/farmer/notifications",
        "officer_route": "/officer/dashboard",
        "admin_route": "/admin/dashboard",
        "spoken_response_hi": "आपकी सभी सूचनाएं खोल रहा हूँ।",
        "spoken_response_en": "Opening your notifications center.",
    },

    # Personalized Information & Actions
    "get_personalized_loans": {
        "category": "personalized_info",
        "description": "Evaluate and recommend agricultural loans tailored to farmer profile",
    },
    "get_loan_application_guidance": {
        "category": "action",
        "description": "Provide verified application channels, official URLs and documents for a loan or scheme",
    },
    "get_personalized_recommendations": {
        "category": "personalized_info",
        "description": "Retrieve deterministic personalized government scheme recommendations",
    },
    "check_subsidy_eligibility": {
        "category": "personalized_info",
        "description": "Check solar pump, mechanization, and crop input subsidy eligibility",
    },
    "get_farmer_benefits": {
        "category": "personalized_info",
        "description": "Explain recorded potential, sanctioned, disbursed and received amounts",
    },
    "get_application_status": {
        "category": "personalized_info",
        "description": "Retrieve live status and remarks on submitted applications",
    },
    "get_grievance_status": {
        "category": "personalized_info",
        "description": "Retrieve live status of raised grievances",
    },
    "get_missing_documents": {
        "category": "personalized_info",
        "description": "Identify missing documents or profile completion gaps",
    },
    "explain_scheme": {
        "category": "explanation",
        "description": "Explain policy terms, eligibility rules, and benefit structure in simple language",
    },
}


# --------------------------------------------------------------------------
# 2. VERIFIED APPLICATION CHANNELS & PRODUCT METADATA
# --------------------------------------------------------------------------
VERIFIED_LOAN_CHANNELS = {
    "kcc": {
        "id": "kcc",
        "name": "Kisan Credit Card (KCC)",
        "provider": "NABARD / All Commercial & Cooperative Banks",
        "category": "Subsidized Crop Credit",
        "interest_rate": "7.0% p.a. (Effective 4.0% with prompt 3% repayment subvention)",
        "limit_summary": "Scale of finance: Up to ₹1,20,000 to ₹3,00,000 depending on cultivated area",
        "official_url": "https://agricoop.nic.in/en/kcc",
        "application_channel": "Nearest Commercial Bank branch (SBI, Bank of Baroda, PNB), Rural Bank (CRGB), or Primary Agricultural Credit Society (PACS).",
        "online_portal": "https://eseva.csc.gov.in / Bank NetBanking",
        "required_documents": [
            "Aadhaar Card",
            "Land title record (B-1 Khasra / Rin Pustika) OR Village Patwari Cultivation Certificate (for tenant farmers)",
            "Bank passbook with Aadhaar seeding",
            "Passport size photographs",
            "Crop cultivation declaration for current season",
        ],
        "application_steps": [
            "Step 1: Download or collect the 1-page standard KCC application form.",
            "Step 2: Attach copies of your Khasra B-1 or Patwari tenant declaration.",
            "Step 3: Submit to your local bank branch or PACS committee.",
            "Step 4: Bank processes sanction within 14 working days without collateral up to ₹1.60 Lakh.",
        ],
    },
    "sbi-kgc": {
        "id": "pvt-sbi-kgc",
        "name": "SBI Kisan Gold Card (KGC)",
        "provider": "State Bank of India",
        "category": "Term Loan & Working Capital",
        "interest_rate": "7.0% p.a. on crop loan component",
        "limit_summary": "Up to ₹3,00,000 with flexible 3 to 5 years revolving tenure",
        "official_url": "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-gold-card",
        "application_channel": "Any SBI Rural or Semi-Urban branch, or through SBI YONO Krishi app.",
        "online_portal": "https://yonobusiness.sbi / YONO Krishi",
        "required_documents": [
            "Aadhaar Card and PAN Card",
            "Latest Revenue land record (B-1 / P-II)",
            "No Dues Certificate (NDC) from local financial institutions",
            "Current cropping schedule and passbook",
        ],
        "application_steps": [
            "Step 1: Visit your home SBI branch or open YONO App -> YONO Krishi.",
            "Step 2: Select 'KCC / Kisan Gold Card' and enter land details.",
            "Step 3: Present land records for verification with the Agri Officer.",
            "Step 4: Sanction letter and debit card issued upon verification.",
        ],
    },
    "bob-bkcc": {
        "id": "pvt-bob-bkcc",
        "name": "Baroda Kisan Credit Card",
        "provider": "Bank of Baroda",
        "category": "Kisan Credit Loan",
        "interest_rate": "7.0% p.a. with 3% interest subvention for prompt repayment",
        "limit_summary": "Flexible credit limit based on district scale of finance",
        "official_url": "https://www.bankofbaroda.in/business-banking/rural-agri/loans-and-advances/baroda-kisan-credit-card",
        "application_channel": "Any Bank of Baroda branch or Baroda Kisan digital app.",
        "online_portal": "https://www.bankofbaroda.in/baroda-kisan",
        "required_documents": [
            "Aadhaar Card",
            "Revenue landholding records / Land possession certificate",
            "Tenant agreement or sharecropper affidavit if non-landholder",
            "Bank passbook copy",
        ],
        "application_steps": [
            "Step 1: Approach the Agricultural Field Officer at Bank of Baroda.",
            "Step 2: Submit simplified one-page application form with land records.",
            "Step 3: Sanctioned credit is disbursed directly to your operative account.",
        ],
    },
    "mahindra-tractor": {
        "id": "pvt-mahindra-tractor",
        "name": "Mahindra Tractor & Implement Loan",
        "provider": "Mahindra Finance",
        "category": "Farm Mechanization Equipment",
        "interest_rate": "10.5% - 13.5% p.a. depending on profile and tenure",
        "limit_summary": "Up to 90% on-road tractor finance with seasonal harvest EMI",
        "official_url": "https://www.mahindrafinance.com/tractor-loans",
        "application_channel": "Authorized Mahindra Tractor dealerships or Mahindra Finance regional branches.",
        "online_portal": "https://www.mahindrafinance.com/apply-now",
        "required_documents": [
            "Aadhaar Card & PAN Card",
            "Land ownership record showing 3.0+ acres or proof of agricultural contract",
            "Tractor dealer proforma invoice and quotation",
            "Bank statement for past 6 months",
        ],
        "application_steps": [
            "Step 1: Choose tractor model at registered dealership.",
            "Step 2: Submit loan application at dealership or branch.",
            "Step 3: Quick field appraisal conducted within 48-72 hours.",
            "Step 4: Direct disbursement to dealer on down payment.",
        ],
    },
    "hdfc-irrigation": {
        "id": "pvt-hdfc-irrigation",
        "name": "HDFC Drip & Micro Irrigation Term Loan",
        "provider": "HDFC Bank",
        "category": "Irrigation Infrastructure",
        "interest_rate": "Competitive agricultural term loan rates",
        "limit_summary": "Up to 85% of micro-irrigation system cost, linked with state subsidy",
        "official_url": "https://www.hdfcbank.com/personal/borrow/popular-loans/agriculture-loans",
        "application_channel": "HDFC Bank branches or authorized micro-irrigation vendors (Jain Irrigation, Netafim).",
        "online_portal": "https://www.hdfcbank.com",
        "required_documents": [
            "Aadhaar Card and land record B-1",
            "Water source feasibility report / tubewell confirmation",
            "Quotation from authorized drip irrigation supplier",
        ],
        "application_steps": [
            "Step 1: Obtain installation estimate from registered vendor.",
            "Step 2: Submit application with subsidy alignment at HDFC branch.",
        ],
    },
    "bajaj-crop": {
        "id": "pvt-bajaj-crop",
        "name": "Bajaj Allianz General Crop Insurance",
        "provider": "Bajaj Allianz",
        "category": "Yield & Weather Risk Cover",
        "interest_rate": "N/A (Actuarial or PMFBY subsidized premium: 1.5% - 2.0%)",
        "limit_summary": "Sum insured up to 100% of notified crop value per acre",
        "official_url": "https://www.bajajallianz.com/crop-insurance.html",
        "application_channel": "Common Service Centers (CSC), PMFBY National Portal, or Bajaj Allianz agents.",
        "online_portal": "https://pmfby.gov.in",
        "required_documents": [
            "Aadhaar Card",
            "Land document or Patwari sowing certificate",
            "Bank account passbook copy",
            "Sowing declaration within cut-off date",
        ],
        "application_steps": [
            "Step 1: Verify notified village crop window on pmfby.gov.in or CSC.",
            "Step 2: Pay farmer share (2% for Kharif paddy, 1.5% for Rabi).",
            "Step 3: Policy acknowledgment receipt generated immediately.",
        ],
    },
}


# --------------------------------------------------------------------------
# 3. INTENT CLASSIFICATION & NATURAL LANGUAGE UNDERSTANDING
# --------------------------------------------------------------------------
def classify_voice_intent(message: str, context: dict[str, Any] | None = None) -> tuple[str, str, dict[str, Any]]:
    """
    Classify natural voice prompt into category, action, and extracted entities.
    Supports Hindi (Devanagari), English, and Hinglish without forcing rigid formats.
    """
    text = message.strip().lower()

    # --- 1. Follow-up & Contextual Queries ---
    ctx_last_topic = context.get("last_topic") if context else None
    ctx_last_items = context.get("last_items", []) if context else []

    # "where can i apply", "apply kahan se kare", "where to apply", "how to apply"
    if any(p in text for p in [
        "kahan se apply", "apply kahan", "kidhar apply", "where can i apply",
        "where to apply", "how to apply", "kahan milega", "kahan se milega",
        "application link", "official link", "apply kahan se kare", "apply kaise kare",
        "कहाँ से आवेदन", "कहाँ आवेदन", "आवेदन कैसे करें", "कहाँ मिलेगा", "आवेदन लिंक"
    ]):
        return "action", "get_loan_application_guidance", {"target": "context_or_general"}

    # "tell me about the first one", "first loan", "pehla wala", "second one", "doosra wala"
    if any(p in text for p in [
        "first one", "first loan", "pehla wala", "pehla loan", "1st", "number one",
        "second one", "doosra wala", "2nd", "पहला", "दूसरा", "पहले वाले"
    ]):
        idx = 0
        if any(w in text for w in ["second", "doosra", "2nd", "दूसरा"]):
            idx = 1
        selected_item = ctx_last_items[idx] if len(ctx_last_items) > idx else None
        return "personalized_info", "explain_scheme", {"selected_index": idx, "selected_item": selected_item}

    # --- 2. Application Status (Must be evaluated before generic application navigation) ---
    if any(p in text for p in [
        "status of my application", "application status", "aavedan status", "aavedan ki sthiti",
        "mera aavedan kahan tak pahuncha", "pending applications", "आवेदन स्थिति", "आवेदन की स्थिति",
        "status dikhao", "स्थिति बताओ"
    ]) or ("aavedan" in text and "status" in text) or ("application" in text and "status" in text):
        return "personalized_info", "get_application_status", {}

    # --- 3. Missing documents / Profile gaps ---
    if (("document" in text or "kagaz" in text or "दस्तावेज" in text or "कागजात" in text or "profile" in text or "प्रोफाइल" in text) and
        ("miss" in text or "kami" in text or "chahiye" in text or "baki" in text or "कमी" in text or "बाकी" in text)) or \
       any(p in text for p in [
           "missing documents", "documents are missing", "document missing", "documents missing",
           "missing from my profile", "kya document chahiye", "kya kagaz", "documents ki kami",
           "kagaz ki kami", "दस्तावेज की कमी", "कागजात की कमी", "दस्तावेज बाकी"
       ]):
        return "personalized_info", "get_missing_documents", {}

    # --- 4. Navigation Commands ---
    # Profile
    if any(p in text for p in [
        "open my profile", "show my profile", "go to profile", "profile kholo",
        "meri profile", "mera profile", "profile page", "profile",
        "प्रोफाइल खोलो", "मेरा प्रोफाइल", "मेरी प्रोफाइल", "प्रोफाइल"
    ]):
        if not any(w in text for w in ["missing", "completion", "update", "kya kam hai", "कमी", "दस्तावेज"]):
            return "navigation", "navigate_to_profile", {}

    # Dashboard
    if any(p in text for p in [
        "go to dashboard", "open dashboard", "open my dashboard", "back to dashboard",
        "dashboard kholo", "home page", "wapas chalo", "dashboard par jao", "dashboard",
        "डैशबोर्ड", "डैशबोर्ड खोलो", "मुख्य पृष्ठ"
    ]):
        return "navigation", "navigate_to_dashboard", {}

    # Applications
    if any(p in text for p in [
        "show my applications", "open applications", "my applications", "aavedan dikhao",
        "mere aavedan", "application page", "application tracking", "आवेदन खोलो", "आवेदन सूची"
    ]):
        if not any(w in text for w in ["status", "kya sthiti", "pending", "स्थिति"]):
            return "navigation", "navigate_to_applications", {}

    # Calculator
    if any(p in text for p in [
        "open loan calculator", "open calculator", "loan calculator", "calculator",
        "calculator kholo", "calculator par jao", "कैलकुलेटर", "लोन कैलकुलेटर", "ऋण कैलकुलेटर"
    ]):
        return "navigation", "navigate_to_calculator", {}

    # Schemes
    if any(p in text for p in [
        "open recommended schemes", "show schemes", "open schemes", "schemes kholo",
        "yojanaen dikhao", "yojana suchi", "explore schemes", "योजनाएं खोलो", "योजना सूची"
    ]):
        return "navigation", "navigate_to_schemes", {}

    # Benefits / Financial Digital Twin
    if any(p in text for p in [
        "show my benefits", "open benefits", "financial twin", "mera paisa kahan hai",
        "kitna paisa mila", "benefit page", "वित्तीय विवरण", "पैसा कहाँ है"
    ]):
        return "navigation", "navigate_to_benefits", {}

    # Grievances
    if any(p in text for p in [
        "show my grievances", "open grievances", "shikayat dikhao", "meri shikayat",
        "grievance page", "शिकायत", "शिकायतें", "शिकायत खोलो"
    ]):
        return "navigation", "navigate_to_grievances", {}

    # Notifications
    if any(p in text for p in [
        "open notifications", "go to notifications", "show notifications", "suchnayein dikhao",
        "meri suchna", "सूचनाएं", "नोटिफिकेशन"
    ]):
        return "navigation", "navigate_to_notifications", {}

    # Eligibility checker
    if any(p in text for p in [
        "check eligibility", "patrata janch", "eligibility tool", "पात्रता जांच", "पात्रता"
    ]):
        return "navigation", "navigate_to_eligibility", {}

    # --- 5. Personalized Information Requests ---
    # Loans & Agricultural Credit
    if any(p in text for p in [
        "which loan", "which agricultural loan", "kaunsa loan", "loan le sakta hoon", "loan le sakta",
        "rin le sakta", "karz le sakta", "agriculture loan", "kcc loan", "krishi rin", "loan options",
        "कृषि ऋण", "ऋण", "लोन", "कर्ज"
    ]):
        return "personalized_info", "get_personalized_loans", {}

    # Subsidies (Solar Pump, Equipment, SMAM)
    if any(p in text for p in [
        "eligible for any subsidy", "equipment subsidy", "solar pump", "saur sujala",
        "tractor subsidy", "rotavator", "anudan mil sakta", "anudan", "subsidy",
        "सब्सिडी", "अनुदान", "सोलर पंप"
    ]):
        return "personalized_info", "check_subsidy_eligibility", {}

    # Schemes suitable for me
    if any(p in text for p in [
        "which scheme", "which government scheme", "suitable for me", "mere liye kaunsi scheme",
        "mere liye yojana", "kaunsi yojana", "schemes for me", "paddy cultivation schemes", "dhan ke liye",
        "योजना है", "कौन सी योजना", "मेरे लिए योजना", "सरकारी योजनाएं"
    ]):
        return "personalized_info", "get_personalized_recommendations", {}

    # Financial Assistance / Benefits potential
    if any(p in text for p in [
        "how much financial assistance", "how much benefit", "kitna paisa mil sakta",
        "potential assistance", "potential benefits", "kitna labh", "kitna anudan", "वित्तीय सहायता"
    ]):
        return "personalized_info", "get_farmer_benefits", {}

    # Grievance Status
    if any(p in text for p in [
        "grievance status", "shikayat ki sthiti", "grievance update", "shikayat par kya hua"
    ]):
        return "personalized_info", "get_grievance_status", {}

    # --- 6. Explanations ---
    if any(p in text for p in [
        "explain", "what is kisan credit card", "what is kcc", "kcc kya hai",
        "kisan credit card kya hai", "pm kisan kya hai", "sanctioned and disbursed"
    ]):
        return "explanation", "explain_scheme", {}

    # Default fallback
    return "clarification", "explain_scheme", {}


# --------------------------------------------------------------------------
# 4. PERSONALIZED ACTIONS & DOMAIN EXECUTORS
# --------------------------------------------------------------------------
def execute_assistant_action(
    action: str,
    user: dict[str, Any],
    params: dict[str, Any],
    context: dict[str, Any],
    language: str = "hi",
) -> dict[str, Any]:
    """
    Execute authorized backend actions based on classified voice command.
    Guaranteed to use the authenticated user's session data only.
    """
    user_id = user["id"]
    role = user.get("role", "farmer")
    farmer = one("SELECT * FROM farmers WHERE id=?", (user_id,)) if role == "farmer" else None

    # Default fallback farmer if session farmer record is empty
    if role == "farmer" and not farmer:
        farmer = one("SELECT * FROM farmers LIMIT 1") or {}

    lang = "hi" if language.startswith("hi") or language == "chg" else "en"

    # =========================================================================
    # A. NAVIGATION ACTIONS
    # =========================================================================
    if action.startswith("navigate_to_"):
        reg_entry = VOICE_COMMAND_REGISTRY.get(action, {})
        route = reg_entry.get(f"{role}_route", "/farmer/dashboard")
        spoken = reg_entry.get(f"spoken_response_{lang}", "Ji, aage badh rahe hain.")

        return {
            "text": spoken,
            "spokenText": spoken,
            "intent": "navigation",
            "action": action,
            "navigation": {
                "targetRoute": route,
                "description": reg_entry.get("description", "Navigating"),
            },
            "followUpSuggestions": [
                "Which loans can I apply for?",
                "Where can I apply?",
                "Show my applications",
            ],
            "context": {
                "last_topic": "navigation",
                "current_route": route,
            },
        }

    # =========================================================================
    # B. PERSONALIZED LOAN RECOMMENDATIONS ("Main kaunsa loan le sakta hoon?")
    # =========================================================================
    if action == "get_personalized_loans":
        recs = evaluate_farmer_recommendations(farmer) if farmer else {}
        pvt_products = recs.get("private_products", [])
        loan_recs = recs.get("loan_recommendations", [])
        
        acres = float(farmer.get("cultivated_area") or farmer.get("landholding_acres") or 2.0) if farmer else 2.0
        cultivator_type = (farmer.get("cultivation_type") or farmer.get("cultivator_status") or "landowner").lower() if farmer else "landowner"
        is_tenant = "tenant" in cultivator_type or "sharecropper" in cultivator_type
        farmer_name = user.get("full_name", "Kisan Bhai")

        cards = []
        # 1. KCC
        kcc_limit = int(min(300000, max(50000, acres * 60000))) if not is_tenant else 50000
        kcc_eligibility = "Eligible (Landowner Scale-of-Finance)" if not is_tenant else "Potentially Eligible (Tenant with Patwari Declaration)"
        cards.append({
            "id": "kcc",
            "name": "Kisan Credit Card (KCC)",
            "lender": "All Banks / NABARD",
            "category": "Subsidized Crop Credit",
            "benefit": f"Up to ₹{kcc_limit:,} at 4% effective interest (with prompt subvention)",
            "suitability": f"Configured for your {acres:.1f} acres in {farmer.get('district', 'Raipur')}. {kcc_eligibility}.",
            "status": "eligible" if not is_tenant else "potentially_eligible",
            "application_channel": "Nearest Commercial / Cooperative Bank Branch",
            "official_url": "https://agricoop.nic.in/en/kcc",
        })

        # 2. Bank of Baroda / SBI
        cards.append({
            "id": "pvt-sbi-kgc",
            "name": "SBI Kisan Gold Card (KGC)",
            "lender": "State Bank of India",
            "category": "Agricultural Term Loan",
            "benefit": "Up to ₹3,00,000 with flexible harvest repayment",
            "suitability": "Suitable for seasonal cultivation and farm asset acquisition.",
            "status": "potentially_eligible",
            "application_channel": "SBI Rural Branch or YONO Krishi App",
            "official_url": "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-gold-card",
        })

        # 3. Mechanization (if acres >= 3.0) or Tenant Line
        if is_tenant:
            cards.append({
                "id": "tenant-kcc",
                "name": "Tenant Farmer / Sharecropper Credit Line",
                "lender": "District Central Cooperative Bank / PACS",
                "category": "Sharecropper Micro-Credit",
                "benefit": "Credit limit up to ₹50,000 without requiring land ownership title",
                "suitability": "Specifically configured for sharecroppers with village patwari verification certificate.",
                "status": "eligible",
                "application_channel": "Local PACS Society or Rural Bank",
                "official_url": "https://agriportal.cg.nic.in",
            })
        elif acres >= 4.0:
            cards.append({
                "id": "pvt-mahindra-tractor",
                "name": "Mahindra Tractor & Implement Loan",
                "lender": "Mahindra Finance",
                "category": "Equipment Finance",
                "benefit": "Up to 90% tractor funding with flexible seasonal harvest EMI",
                "suitability": f"Meets criteria for {acres:.1f} acres agricultural holding.",
                "status": "eligible",
                "application_channel": "Authorized Mahindra Dealership / Branch",
                "official_url": "https://www.mahindrafinance.com/tractor-loans",
            })

        if lang == "hi":
            spoken = (
                f"{farmer_name} जी, आपकी {acres:.1f} एकड़ जमीन और खेती के विवरण के आधार पर आपके लिए 2 मुख्य ऋण विकल्प अनुकूल हैं। "
                f"पहला है किसान क्रेडिट कार्ड (KCC), जिसमें 4% ब्याज पर ₹{kcc_limit:,} तक अल्पकालिक ऋण मिल सकता है। "
                f"दूसरा है एसबीआई किसान गोल्ड कार्ड। आप 'Where can I apply' पूछकर आवेदन की प्रक्रिया जान सकते हैं।"
            )
            text_resp = (
                f"**नमस्ते {farmer_name} जी!**\n\n"
                f"आपकी प्रोफाइल ({acres:.1f} एकड़, {farmer.get('district', 'रायपुर')}, {cultivator_type}) के आधार पर सत्यापित ऋण विकल्प:\n\n"
                f"1. **किसान क्रेडिट कार्ड (KCC):** 4% प्रभावी ब्याज दर पर ₹{kcc_limit:,} तक साख सीमा।\n"
                f"2. **SBI किसान गोल्ड कार्ड (KGC):** लचीले पुनर्भुगतान के साथ ₹3,00,000 तक सीमा।\n"
                f"{'3. **बटाईदार साख सुविधा (Tenant Line):** बिना भूमि स्वामित्व के ₹50,000 तक सीमा।' if is_tenant else '3. **महिंद्रा ट्रैक्टर लोन:** 90% तक वित्तपोषण उपलब्ध।'}\n\n"
                f"💡 *अगला कदम:* आप पूछ सकते हैं — *'Where can I apply?'* या *'Tell me about the first one.'*"
            )
        else:
            spoken = (
                f"Based on your {acres:.1f} acre farm profile in {farmer.get('district', 'Raipur')}, "
                f"you have two verified loan products available: Kisan Credit Card with 4% effective interest "
                f"up to ₹{kcc_limit:,}, and SBI Kisan Gold Card. Ask 'Where can I apply?' for verified application channels."
            )
            text_resp = (
                f"**Personalized Agricultural Loan Assessment for {farmer_name}:**\n\n"
                f"Evaluated against {acres:.1f} acres ({farmer.get('district', 'Raipur')}, {cultivator_type}):\n\n"
                f"1. **Kisan Credit Card (KCC):** Scale-of-finance credit up to **₹{kcc_limit:,}** at 4% effective subsidized interest.\n"
                f"2. **SBI Kisan Gold Card (KGC):** Term loan limit up to **₹3,00,000** for seasonal working capital.\n"
                f"{'3. **Tenant Cultivator Credit Line:** Up to ₹50,000 credit for sharecroppers with Patwari declaration.' if is_tenant else '3. **Mahindra Tractor Finance:** Up to 90% funding for farm mechanization.'}\n\n"
                f"💡 *Follow-up:* Ask **'Where can I apply?'** or **'Tell me about the first one.'**"
            )

        return {
            "text": text_resp,
            "spokenText": spoken,
            "intent": "personalized_info",
            "action": "get_personalized_loans",
            "cards": cards,
            "followUpSuggestions": [
                "Where can I apply for KCC?",
                "Tell me about the first one",
                "What documents are needed?",
                "Open loan calculator",
            ],
            "context": {
                "last_topic": "loan",
                "last_items": cards,
                "active_loan": cards[0] if cards else None,
            },
        }

    # =========================================================================
    # C. APPLICATION GUIDANCE ("Where can I apply?")
    # =========================================================================
    if action == "get_loan_application_guidance":
        active_loan = context.get("active_loan")
        loan_key = "kcc"
        if active_loan:
            aid = str(active_loan.get("id", "")).lower()
            if "sbi" in aid:
                loan_key = "sbi-kgc"
            elif "mahindra" in aid or "tractor" in aid:
                loan_key = "mahindra-tractor"
            elif "bob" in aid:
                loan_key = "bob-bkcc"
            elif "bajaj" in aid or "crop" in aid:
                loan_key = "bajaj-crop"

        channel_info = VERIFIED_LOAN_CHANNELS.get(loan_key, VERIFIED_LOAN_CHANNELS["kcc"])
        docs_str = "\n".join(f"- {d}" for d in channel_info["required_documents"])
        steps_str = "\n".join(channel_info["application_steps"])

        if lang == "hi":
            spoken = (
                f"{channel_info['name']} के लिए आप अपने नजदीकी बैंक शाखा या आधिकारिक पोर्टल {channel_info['official_url']} पर आवेदन कर सकते हैं। "
                f"इसके लिए आधार कार्ड, भूमि अभिलेख बी-1 अथवा पटवारी प्रमाण पत्र की आवश्यकता होगी।"
            )
            text_resp = (
                f"### {channel_info['name']} — आवेदन प्रक्रिया एवं केंद्र\n\n"
                f"**सत्यापित आवेदन चैनल:**\n"
                f"📍 **शाखा स्तर:** {channel_info['application_channel']}\n"
                f"🌐 **आधिकारिक वेब पोर्टल:** [{channel_info['official_url']}]({channel_info['official_url']})\n\n"
                f"**आवश्यक दस्तावेज:**\n{docs_str}\n\n"
                f"**आवेदन के चरण:**\n{steps_str}\n\n"
                f"⚠️ *नोट: बैंक कभी भी फोन पर ओटीपी या पिन नहीं मांगता। आधिकारिक शाखा अथवा सत्यापित पोर्टल से ही आवेदन करें।*"
            )
        else:
            spoken = (
                f"You can apply for {channel_info['name']} at your nearest bank branch or through the official portal at {channel_info['official_url']}. "
                f"Required documents include Aadhaar Card, Land Record B-1, and your active bank passbook."
            )
            text_resp = (
                f"### {channel_info['name']} — Official Application Channels\n\n"
                f"**Verified Channels:**\n"
                f"📍 **Physical Branch:** {channel_info['application_channel']}\n"
                f"🌐 **Official Portal:** [{channel_info['official_url']}]({channel_info['official_url']})\n\n"
                f"**Required Documents:**\n{docs_str}\n\n"
                f"**Steps to Apply:**\n{steps_str}\n\n"
                f"⚠️ *Official Notice: KrishiSetu provides verified guidance; official loan sanctions are issued directly by the participating bank upon physical verification.*"
            )

        return {
            "text": text_resp,
            "spokenText": spoken,
            "intent": "action",
            "action": "get_loan_application_guidance",
            "applicationChannel": channel_info,
            "followUpSuggestions": [
                "Open my applications",
                "Show my recommended schemes",
                "Check missing documents",
            ],
            "context": {
                "last_topic": "application_channel",
                "active_loan": channel_info,
            },
        }

    # =========================================================================
    # D. CONTEXTUAL FOLLOW-UP ("Tell me about the first one")
    # =========================================================================
    if action == "explain_scheme" and params.get("selected_item"):
        item = params["selected_item"]
        name = item.get("name", "Selected Product")
        benefit = item.get("benefit", "") or item.get("benefit_description", "")
        suitability = item.get("suitability", "") or item.get("reason", "")
        app_url = item.get("official_url", "https://agricoop.nic.in")

        if lang == "hi":
            spoken = f"{name} के तहत {benefit} मिलता है। यह आपके खेत और फसल के लिए पूरी तरह अनुकूल है।"
            text_resp = (
                f"### {name}\n\n"
                f"**लाभ विवरण:** {benefit}\n"
                f"**अनुकूलता का कारण:** {suitability}\n"
                f"**आधिकारिक लिंक:** [{app_url}]({app_url})\n\n"
                f"क्या आप जानना चाहते हैं कि इसके लिए आवेदन कहाँ से करें? कहें — *'Where can I apply?'*"
            )
        else:
            spoken = f"{name} provides {benefit}. It matches your configured farm criteria."
            text_resp = (
                f"### {name}\n\n"
                f"**Benefit Details:** {benefit}\n"
                f"**Why it matches:** {suitability}\n"
                f"**Official Link:** [{app_url}]({app_url})\n\n"
                f"Want to know where and how to apply? Simply ask — **'Where can I apply?'**"
            )

        return {
            "text": text_resp,
            "spokenText": spoken,
            "intent": "explanation",
            "action": "explain_scheme",
            "data": item,
            "followUpSuggestions": [
                "Where can I apply for this loan?",
                "What documents are needed?",
                "Back to dashboard",
            ],
            "context": {
                "last_topic": "loan_detail",
                "active_loan": item,
            },
        }

    # =========================================================================
    # E. PERSONALIZED SCHEME RECOMMENDATIONS ("Mere liye kaunsi scheme hai?")
    # =========================================================================
    if action == "get_personalized_recommendations":
        recs = evaluate_farmer_recommendations(farmer) if farmer else {}
        gov_schemes = recs.get("government_schemes", [])
        eligible_gov = [s for s in gov_schemes if s.get("eligibility_status") == "eligible"]
        
        acres = float(farmer.get("cultivated_area") or 2.0) if farmer else 2.0
        cultivator_type = (farmer.get("cultivation_type") or "landowner").lower() if farmer else "landowner"
        is_tenant = "tenant" in cultivator_type

        scheme_names = [s["name"] for s in (eligible_gov[:3] if eligible_gov else gov_schemes[:3])]
        names_str = ", ".join(scheme_names)

        if lang == "hi":
            spoken = f"आपकी {acres:.1f} एकड़ जोत के अनुसार आपके लिए प्रमुख सरकारी योजनाएं हैं: {names_str}। आप इन योजनाओं की विस्तृत जानकारी पोर्टल पर देख सकते हैं।"
            lines = [f"- **{s['name']}**: {s.get('reason', '')}" for s in (eligible_gov[:3] if eligible_gov else gov_schemes[:3])]
            text_resp = (
                f"**आपके लिए सत्यापित सरकारी योजनाएं ({acres:.1f} एकड़, {farmer.get('district', 'रायपुर')}):**\n\n"
                + "\n".join(lines) + "\n\n"
                f"💡 *सुझाव:* कहें — *'Open recommended schemes'* पूरी सूची देखने के लिए।"
            )
        else:
            spoken = f"Based on your {acres:.1f} acre farm, top matched government schemes are: {names_str}."
            lines = [f"- **{s['name']}**: {s.get('reason', '')}" for s in (eligible_gov[:3] if eligible_gov else gov_schemes[:3])]
            text_resp = (
                f"**Personalized Government Scheme Matches ({acres:.1f} Acres, {farmer.get('district', 'Raipur')}):**\n\n"
                + "\n".join(lines) + "\n\n"
                f"💡 *Next Action:* Say — **'Open recommended schemes'** to view full details."
            )

        return {
            "text": text_resp,
            "spokenText": spoken,
            "intent": "personalized_info",
            "action": "get_personalized_recommendations",
            "cards": eligible_gov[:3] if eligible_gov else gov_schemes[:3],
            "followUpSuggestions": [
                "Open recommended schemes",
                "Am I eligible for an equipment subsidy?",
                "Which loans can I apply for?",
            ],
            "context": {
                "last_topic": "schemes",
                "last_items": eligible_gov[:3] if eligible_gov else gov_schemes[:3],
            },
        }

    # =========================================================================
    # F. SUBSIDY ELIGIBILITY (Solar Pump, Equipment, SMAM)
    # =========================================================================
    if action == "check_subsidy_eligibility":
        acres = float(farmer.get("cultivated_area") or 2.0) if farmer else 2.0
        cultivator_type = (farmer.get("cultivation_type") or "landowner").lower() if farmer else "landowner"
        is_tenant = "tenant" in cultivator_type

        if is_tenant:
            if lang == "hi":
                spoken = "बटाईदार किसान होने के कारण आप सौर सुजला सोलर पंप के लिए सीधे पात्र नहीं हैं क्योंकि इसमें भूमि स्वामी का खसरा आवश्यक है। लेकिन आप फसल बीमा और साख सहायता के लिए पात्र हैं।"
                text_resp = (
                    "**अनुदान पात्रता विश्लेषण (बटाईदार/साझेदार):**\n\n"
                    "- ❌ **सौर सुजला सोलर पंप:** अपात्र (नीति 2026-CG-SSY-02 के अनुसार स्थायी भूमि पट्टा अनिवार्य)।\n"
                    "- ❌ **एसएमएएम ट्रैक्टर अनुदान:** व्यक्तिगत स्वामित्व अभिलेख अनिवार्य।\n"
                    "- ✅ **फसल बीमा (PMFBY):** पटवारी प्रमाण पत्र के आधार पर पूर्णतः पात्र।\n"
                    "- ✅ **अल्पकालिक फसल ऋण:** ₹50,000 तक पात्र।"
                )
            else:
                spoken = "As a tenant farmer, you are not eligible for permanent solar pump subsidies which require land title RoR, but you qualify for crop insurance and tenant credit."
                text_resp = (
                    "**Subsidy Eligibility Analysis (Tenant / Sharecropper):**\n\n"
                    "- ❌ **Saur Sujala Solar Pump:** Not eligible (Mandatory landholder title requirement under 2026-CG-SSY-02).\n"
                    "- ❌ **SMAM Tractor Subsidy:** Requires registered land title.\n"
                    "- ✅ **PMFBY Crop Insurance:** Fully eligible with village Patwari cultivation declaration.\n"
                    "- ✅ **Tenant Crop Credit:** Eligible up to ₹50,000."
                )
        else:
            # Landowner
            if lang == "hi":
                spoken = f"आपकी {acres:.1f} एकड़ भूमि पर सौर सुजला योजना के तहत 3HP अथवा 5HP सोलर पंप पर 90% तक सरकारी अनुदान और कृषि यंत्रीकरण (SMAM) पर 40 से 50% अनुदान उपलब्ध है।"
                text_resp = (
                    f"**अनुदान पात्रता विश्लेषण ({acres:.1f} एकड़ भूमि स्वामी):**\n\n"
                    f"- ✅ **सौर सुजला योजना:** क्रेडा (CREDA) द्वारा 3HP/5HP सोलर पंप हेतु 90% तक अनुदान समर्थित।\n"
                    f"- ✅ **एसएमएएम (कृषि यंत्रीकरण):** रोटावेटर एवं पावर टिलर पर 40% से 50% तक वित्तीय अनुदान।\n"
                    f"- ✅ **राजीव गांधी किसान न्याय योजना (RGKNY):** धान एवं दलहन पर ₹9,000 से ₹10,000 प्रति एकड़ इनपुट सहायता।"
                )
            else:
                spoken = f"With {acres:.1f} acres of owned land, you are eligible for up to 90% Saur Sujala solar pump subsidy and 40 to 50% SMAM farm equipment subsidy."
                text_resp = (
                    f"**Subsidy Eligibility Breakdown ({acres:.1f} Acres Landowner):**\n\n"
                    f"- ✅ **Saur Sujala Solar Pump:** Up to 90% capital subsidy on 3HP / 5HP solar irrigation pumps via CREDA.\n"
                    f"- ✅ **SMAM Farm Mechanization:** 40% to 50% indicative subsidy on rotavators, seed drills, and power tillers.\n"
                    f"- ✅ **RGKNY Input Subsidy:** ₹9,000 to ₹10,000 per acre agricultural assistance."
                )

        return {
            "text": text_resp,
            "spokenText": spoken,
            "intent": "personalized_info",
            "action": "check_subsidy_eligibility",
            "followUpSuggestions": [
                "Where can I apply?",
                "Which loans can I apply for?",
                "Show my applications",
            ],
            "context": {
                "last_topic": "subsidy",
            },
        }

    # =========================================================================
    # G. BENEFITS & FINANCIAL DIGITAL TWIN ("How much benefit can I receive?")
    # =========================================================================
    if action == "get_farmer_benefits":
        benefits = many("SELECT * FROM benefits WHERE farmer_id=?", (user_id,))
        potential = sum(float(b["expected_amount"] or 0) for b in benefits)
        sanctioned = sum(float(b["sanctioned_amount"] or 0) for b in benefits)
        received = sum(float(b["received_amount"] or 0) for b in benefits)

        if lang == "hi":
            spoken = f"आपके वित्तीय डिजिटल ट्विन के अनुसार कुल संभावित लाभ ₹{potential:,.0f} है, जिसमें से ₹{sanctioned:,.0f} स्वीकृत हुआ है और ₹{received:,.0f} सीधे बैंक खाते में प्राप्त हो चुका है।"
            text_resp = (
                f"**वित्तीय डिजिटल ट्विन (Financial Digital Twin):**\n\n"
                f"- 📊 **संभावित लाभ (Potential Benefits):** ₹{potential:,.0f}\n"
                f"- 📝 **स्वीकृत राशि (Sanctioned Amount):** ₹{sanctioned:,.0f}\n"
                f"- 💳 **प्राप्त राशि (Received in Bank):** ₹{received:,.0f}\n\n"
                f"💡 *विस्तृत विवरण के लिए कहें — 'Show my benefits'.*"
            )
        else:
            spoken = f"According to your Financial Digital Twin, your total potential benefit is ₹{potential:,.0f}, with ₹{sanctioned:,.0f} sanctioned and ₹{received:,.0f} received in your bank account."
            text_resp = (
                f"**Financial Digital Twin Overview:**\n\n"
                f"- 📊 **Potential Benefits:** ₹{potential:,.0f}\n"
                f"- 📝 **Sanctioned Amount:** ₹{sanctioned:,.0f}\n"
                f"- 💳 **Received in Bank Account:** ₹{received:,.0f}\n\n"
                f"💡 *Say 'Show my benefits' to view the breakdown by scheme.*"
            )

        return {
            "text": text_resp,
            "spokenText": spoken,
            "intent": "personalized_info",
            "action": "get_farmer_benefits",
            "data": {
                "potential": potential,
                "sanctioned": sanctioned,
                "received": received,
            },
            "followUpSuggestions": [
                "Show my benefits",
                "Show my applications",
                "Which loans can I apply for?",
            ],
            "context": {
                "last_topic": "benefits",
            },
        }

    # =========================================================================
    # H. APPLICATION STATUS ("What is my application status?")
    # =========================================================================
    if action == "get_application_status":
        apps = many(
            """SELECT a.*, s.name as scheme_name 
               FROM applications a 
               LEFT JOIN schemes s ON s.id=a.scheme_id 
               WHERE a.farmer_id=? 
               ORDER BY a.submitted_at DESC LIMIT 3""",
            (user_id,),
        )
        if not apps:
            text_resp = "आपके खाते में वर्तमान में कोई सक्रिय आवेदन दर्ज नहीं है। योजना सूची देखने के लिए कहें — 'Open recommended schemes'."
            spoken = "वर्तमान में आपका कोई सक्रिय आवेदन दर्ज नहीं है।"
        else:
            lines = [f"- **{a.get('scheme_name', a['scheme_id'])}** ({a['application_number']}): स्थिति **{a['status'].upper()}** — *{a.get('remarks', 'प्रक्रियाधीन')}*" for a in apps]
            text_resp = "**आपके हालिया आवेदनों की स्थिति:**\n\n" + "\n".join(lines)
            spoken = f"आपके {len(apps)} आवेदन दर्ज हैं। नवीनतम आवेदन की स्थिति {apps[0]['status']} है।"

        return {
            "text": text_resp,
            "spokenText": spoken,
            "intent": "personalized_info",
            "action": "get_application_status",
            "cards": apps,
            "followUpSuggestions": [
                "Show my applications",
                "Which loans can I apply for?",
                "Back to dashboard",
            ],
            "context": {
                "last_topic": "applications",
            },
        }

    # =========================================================================
    # I. MISSING DOCUMENTS / PROFILE COMPLETION GAPS
    # =========================================================================
    if action == "get_missing_documents":
        completion = int(farmer.get("profile_completion", 70)) if farmer else 70
        is_tenant = "tenant" in (farmer.get("cultivator_status") or "").lower() if farmer else False
        
        missing = []
        if completion < 90:
            if is_tenant:
                missing.append("पटवारी बटाईदार सत्यापन प्रमाण पत्र (Village Patwari Verification Affidavit)")
                missing.append("आधार लिंक्ड बैंक खाता एनपीसीआई मैपिंग (NPCI Bank Seeding confirmation)")
            else:
                missing.append("नवीनतम खसरा बी-1 प्रति (Latest Revenue Land Record B-1)")
                missing.append("मृदा स्वास्थ्य कार्ड (Soil Health Card record)")

        missing_list = "\n".join(f"- ⚠️ {m}" for m in missing) if missing else "✅ आपके प्रोफाइल के सभी अनिवार्य दस्तावेज पूर्ण हैं।"

        if lang == "hi":
            spoken = f"आपकी प्रोफाइल {completion}% पूर्ण है। {len(missing)} दस्तावेज लंबित हैं। प्रोफाइल अपडेट करने के लिए कहें — 'Open my profile'."
            text_resp = (
                f"**दस्तावेज एवं प्रोफाइल स्थिति (पूर्णता: {completion}%):**\n\n"
                f"{missing_list}\n\n"
                f"💡 *दस्तावेज अपलोड करने हेतु कहें — 'Open my profile'.*"
            )
        else:
            spoken = f"Your profile is {completion}% complete with {len(missing)} pending document requirements."
            text_resp = (
                f"**Document & Profile Status ({completion}% Complete):**\n\n"
                f"{missing_list}\n\n"
                f"💡 *To update, say — 'Open my profile'.*"
            )

        return {
            "text": text_resp,
            "spokenText": spoken,
            "intent": "personalized_info",
            "action": "get_missing_documents",
            "data": {"completion": completion, "missing": missing},
            "followUpSuggestions": [
                "Open my profile",
                "Show my applications",
                "Which loans can I apply for?",
            ],
            "context": {
                "last_topic": "documents",
            },
        }

    # =========================================================================
    # J. EXPLANATION FALLBACK (What is KCC, Sanctioned vs Disbursed)
    # =========================================================================
    if "sanctioned" in params or "disbursed" in params or "स्वीकृत" in str(params):
        text_resp = (
            "**स्वीकृत (Sanctioned) बनाम प्राप्त (Disbursed/Received):**\n\n"
            "- **स्वीकृत राशि (Sanctioned):** वह आधिकारिक धनराशि जिसे संबंधित विभाग या बैंक ने आपके आवेदन की जांच के बाद विधिवत मंजूर किया है।\n"
            "- **प्राप्त राशि (Received/Disbursed):** वह वास्तविक धनराशि जो डीबीटी (DBT) अथवा बैंक ट्रांसफर द्वारा सीधे आपके आधार-लिंक्ड बैंक खाते में जमा हो चुकी है।"
        )
        spoken = "स्वीकृत राशि वह है जिसे विभाग ने मंजूर किया है, और प्राप्त राशि वह है जो वास्तव में आपके बैंक खाते में जमा हो चुकी है।"
    else:
        text_resp = (
            "**किसान क्रेडिट कार्ड (KCC):**\n\n"
            "KCC भारत सरकार की एक महत्वपूर्ण कृषि साख योजना है। इसके तहत किसानों को अपनी फसल बुआई, खाद-बीज और कृषि व्यय हेतु 7% ब्याज पर ऋण मिलता है। "
            "समय पर अदायगी करने पर 3% की अतिरिक्त ब्याज छूट मिलती है, जिससे प्रभावी ब्याज दर मात्र **4.0% प्रति वर्ष** रह जाती है।"
        )
        spoken = "किसान क्रेडिट कार्ड पर किसानों को समय पर भुगतान करने पर मात्र 4% प्रभावी वार्षिक ब्याज पर अल्पावधि फसल ऋण मिलता है।"

    return {
        "text": text_resp,
        "spokenText": spoken,
        "intent": "explanation",
        "action": "explain_scheme",
        "followUpSuggestions": [
            "Which loans can I apply for?",
            "Where can I apply for KCC?",
            "Back to dashboard",
        ],
        "context": {
            "last_topic": "explanation",
        },
    }


# --------------------------------------------------------------------------
# 5. HIGH-LEVEL PIPELINE ORCHESTRATOR
# --------------------------------------------------------------------------
def process_voice_command(
    message: str,
    user: dict[str, Any],
    session_id: str | None = None,
    current_route: str | None = None,
    language: str = "hi",
) -> dict[str, Any]:
    """
    End-to-end voice command assistant pipeline.
    Validates identity, retrieves session memory, classifies intent, executes action,
    and returns rich response payload with text, audio script, navigation, and cards.
    """
    sid = session_id or f"sess-{user['id']}"
    user_context = _SESSION_CONTEXT_CACHE.get(sid, {})
    user_context["user_id"] = user["id"]
    user_context["current_route"] = current_route or user_context.get("current_route", "/farmer/dashboard")

    # 1. Intent Classification
    intent, action, extracted_params = classify_voice_intent(message, user_context)

    # 2. Action Execution & Information Synthesis
    result = execute_assistant_action(
        action=action,
        user=user,
        params=extracted_params,
        context=user_context,
        language=language,
    )

    # 3. Update Session Context
    new_ctx = result.get("context", {})
    user_context.update(new_ctx)
    user_context["last_query"] = message
    user_context["last_action"] = action
    _SESSION_CONTEXT_CACHE[sid] = user_context

    result["sessionId"] = sid
    result["language"] = language
    return result
