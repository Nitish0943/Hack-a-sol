import sqlite3
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import get_settings
from app.core.security import hash_password


_lock = Lock()


def get_connection() -> sqlite3.Connection:
    settings = get_settings()
    path = Path(settings.database_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    with _lock, get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE,
              mobile_number TEXT UNIQUE NOT NULL,
              password_hash TEXT,
              full_name TEXT NOT NULL,
              role TEXT NOT NULL,
              preferred_language TEXT NOT NULL DEFAULT 'hi',
              is_active INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS farmers (
              id TEXT PRIMARY KEY,
              farmer_id TEXT UNIQUE NOT NULL,
              state TEXT,
              district TEXT,
              block TEXT,
              village TEXT,
              pincode TEXT,
              cultivator_status TEXT,
              cultivated_area REAL,
              landholding_acres REAL,
              crops TEXT,
              irrigation_type TEXT,
              farmer_category TEXT,
              profile_completion INTEGER NOT NULL DEFAULT 85,
              is_demo INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS government_profiles (
              id TEXT PRIMARY KEY,
              user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
              department TEXT NOT NULL,
              designation TEXT NOT NULL,
              state TEXT NOT NULL,
              district TEXT NOT NULL,
              block TEXT,
              employee_reference TEXT,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS sessions (
              token TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              expires_at TEXT,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS otp_challenges (
              mobile_number TEXT PRIMARY KEY,
              otp TEXT NOT NULL,
              expires_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS schemes (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              department TEXT,
              category TEXT,
              state TEXT,
              description TEXT,
              benefit_description TEXT,
              eligibility_summary TEXT,
              required_documents TEXT,
              official_url TEXT,
              policy_version TEXT,
              last_updated TEXT,
              image_url TEXT,
              source_license TEXT,
              status TEXT NOT NULL DEFAULT 'active',
              is_demo INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS private_schemes (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              lender TEXT NOT NULL,
              category TEXT NOT NULL,
              benefit_text TEXT NOT NULL,
              image_url TEXT NOT NULL,
              logo_url TEXT,
              source_url TEXT NOT NULL,
              last_verified TEXT NOT NULL,
              is_active INTEGER NOT NULL DEFAULT 1,
              source_license TEXT
            );
            CREATE TABLE IF NOT EXISTS farmer_scheme_recommendations (
              id TEXT PRIMARY KEY,
              farmer_id TEXT NOT NULL,
              scheme_id TEXT NOT NULL,
              recommendation_score REAL NOT NULL,
              eligibility_status TEXT NOT NULL,
              reason TEXT NOT NULL,
              matched_conditions TEXT NOT NULL,
              unmet_conditions TEXT NOT NULL,
              missing_documents TEXT NOT NULL,
              recommendation_type TEXT NOT NULL,
              generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              rules_version TEXT NOT NULL DEFAULT '2026-CG-RULES-01'
            );
            CREATE INDEX IF NOT EXISTS idx_recommendations_farmer
              ON farmer_scheme_recommendations(farmer_id, recommendation_type);
            CREATE TABLE IF NOT EXISTS eligibility_results (
              id TEXT PRIMARY KEY,
              farmer_id TEXT NOT NULL,
              scheme_id TEXT NOT NULL,
              status TEXT NOT NULL,
              passed_rules TEXT,
              failed_rules TEXT,
              missing_information TEXT,
              explanation TEXT,
              policy_version TEXT,
              calculated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              is_demo INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS calculations (
              id TEXT PRIMARY KEY,
              farmer_id TEXT NOT NULL,
              calculation_type TEXT,
              inputs TEXT,
              result TEXT,
              policy_version TEXT,
              calculated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              is_demo INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS benefits (
              id TEXT PRIMARY KEY,
              farmer_id TEXT NOT NULL,
              scheme_id TEXT,
              expected_amount REAL,
              applied_amount REAL,
              approved_amount REAL,
              sanctioned_amount REAL,
              disbursed_amount REAL,
              received_amount REAL,
              status TEXT,
              verification_status TEXT,
              financial_year TEXT,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              is_demo INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS applications (
              id TEXT PRIMARY KEY,
              application_number TEXT UNIQUE NOT NULL,
              farmer_id TEXT NOT NULL,
              scheme_id TEXT,
              status TEXT,
              submitted_at TEXT,
              remarks TEXT,
              is_demo INTEGER NOT NULL DEFAULT 1,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS application_history (
              id TEXT PRIMARY KEY,
              application_id TEXT NOT NULL,
              previous_status TEXT,
              new_status TEXT,
              changed_by TEXT,
              remarks TEXT,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS discrepancies (
              id TEXT PRIMARY KEY,
              farmer_id TEXT NOT NULL,
              benefit_id TEXT,
              scheme_id TEXT,
              discrepancy_type TEXT,
              expected_amount REAL,
              recorded_amount REAL,
              difference_amount REAL,
              explanation TEXT,
              severity TEXT,
              status TEXT,
              resolution_note TEXT,
              is_demo INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS grievances (
              id TEXT PRIMARY KEY,
              grievance_number TEXT UNIQUE NOT NULL,
              farmer_id TEXT NOT NULL,
              scheme_id TEXT,
              application_id TEXT,
              category TEXT,
              subject TEXT,
              description TEXT,
              priority TEXT,
              status TEXT,
              resolution_note TEXT,
              is_demo INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS grievance_history (
              id TEXT PRIMARY KEY,
              grievance_id TEXT NOT NULL,
              status TEXT,
              remark TEXT,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS cultivator_verifications (
              id TEXT PRIMARY KEY,
              farmer_id TEXT NOT NULL,
              cultivator_type TEXT,
              evidence_document_ids TEXT,
              verification_status TEXT,
              officer_remarks TEXT,
              submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS notifications (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              title TEXT,
              message TEXT,
              notification_type TEXT,
              reference_type TEXT,
              reference_id TEXT,
              is_read INTEGER NOT NULL DEFAULT 0,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS audit_logs (
              id TEXT PRIMARY KEY,
              actor_id TEXT,
              action TEXT,
              entity_type TEXT,
              entity_id TEXT,
              old_values TEXT,
              new_values TEXT,
              ip_address TEXT,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS voice_call_sessions (
              call_sid TEXT PRIMARY KEY,
              candidate_user_id TEXT,
              verified_user_id TEXT,
              language TEXT NOT NULL DEFAULT 'hi',
              state TEXT NOT NULL DEFAULT 'language',
              current_intent TEXT,
              pending_summary TEXT,
              invalid_attempts INTEGER NOT NULL DEFAULT 0,
              policy_query_count INTEGER NOT NULL DEFAULT 0,
              call_status TEXT NOT NULL DEFAULT 'in-progress',
              duration_seconds INTEGER,
              outcome TEXT,
              started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              ended_at TEXT,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_voice_calls_verified_user
              ON voice_call_sessions(verified_user_id, started_at);
            CREATE TABLE IF NOT EXISTS voice_otp_challenges (
              call_sid TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              code_hash TEXT NOT NULL,
              attempts INTEGER NOT NULL DEFAULT 0,
              expires_at TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              verified_at TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_voice_otp_user_created
              ON voice_otp_challenges(user_id, created_at);
            CREATE TABLE IF NOT EXISTS voice_escalations (
              id TEXT PRIMARY KEY,
              call_sid TEXT NOT NULL UNIQUE,
              farmer_id TEXT NOT NULL,
              reason TEXT NOT NULL,
              summary TEXT NOT NULL,
              preferred_language TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'pending',
              assigned_officer TEXT,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_voice_escalations_status_created
              ON voice_escalations(status, created_at);
            CREATE TABLE IF NOT EXISTS voice_unanswered_questions (
              id TEXT PRIMARY KEY,
              call_sid TEXT NOT NULL,
              query_digest TEXT NOT NULL,
              language TEXT NOT NULL,
              reason TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        
        # Schema migration checks
        user_columns = {row["name"] for row in connection.execute("PRAGMA table_info(users)").fetchall()}
        if "email" not in user_columns:
            connection.execute("ALTER TABLE users ADD COLUMN email TEXT")
        if "password_hash" not in user_columns:
            connection.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
        if "updated_at" not in user_columns:
            connection.execute("ALTER TABLE users ADD COLUMN updated_at TEXT")

        farmer_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(farmers)").fetchall()
        }
        if "farmer_category" not in farmer_columns:
            connection.execute("ALTER TABLE farmers ADD COLUMN farmer_category TEXT")
        if "landholding_acres" not in farmer_columns:
            connection.execute("ALTER TABLE farmers ADD COLUMN landholding_acres REAL")
        if "irrigation_type" not in farmer_columns:
            connection.execute("ALTER TABLE farmers ADD COLUMN irrigation_type TEXT")
        if "cultivation_type" not in farmer_columns:
            connection.execute("ALTER TABLE farmers ADD COLUMN cultivation_type TEXT")

        session_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(sessions)").fetchall()
        }
        if "expires_at" not in session_columns:
            connection.execute("ALTER TABLE sessions ADD COLUMN expires_at TEXT")

        voice_call_columns = {
            row["name"]
            for row in connection.execute("PRAGMA table_info(voice_call_sessions)").fetchall()
        }
        if "invalid_attempts" not in voice_call_columns:
            connection.execute(
                "ALTER TABLE voice_call_sessions ADD COLUMN invalid_attempts INTEGER NOT NULL DEFAULT 0"
            )
        if "policy_query_count" not in voice_call_columns:
            connection.execute(
                "ALTER TABLE voice_call_sessions ADD COLUMN policy_query_count INTEGER NOT NULL DEFAULT 0"
            )
        if "duration_seconds" not in voice_call_columns:
            connection.execute(
                "ALTER TABLE voice_call_sessions ADD COLUMN duration_seconds INTEGER"
            )
        scheme_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(schemes)").fetchall()
        }
        if "image_url" not in scheme_columns:
            connection.execute("ALTER TABLE schemes ADD COLUMN image_url TEXT")
        if "source_license" not in scheme_columns:
            connection.execute("ALTER TABLE schemes ADD COLUMN source_license TEXT")
        
        # Check and seed private schemes if empty
        pvt_count = connection.execute("SELECT COUNT(*) as count FROM private_schemes").fetchone()
        if pvt_count and pvt_count["count"] == 0:
            verified_private_schemes = [
                (
                    "pvt-sbi-kgc",
                    "SBI Kisan Gold Card (KGC)",
                    "State Bank of India",
                    "Agricultural Loan",
                    "Up to ₹3,00,000 at 7% p.a.",
                    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80",
                    "https://sbi.co.in/o/SBI-Theme/images/custom/logo.png",
                    "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-gold-card",
                    "2026-11-20",
                    1,
                    "Official SBI Agri Banking Portal / Unsplash Open License",
                ),
                (
                    "pvt-bob-bkcc",
                    "Baroda Kisan Credit Card",
                    "Bank of Baroda",
                    "Kisan Credit Loan",
                    "Scale-of-finance credit limit",
                    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80",
                    "https://www.bankofbaroda.in/-/media/project/bob/countrysites/india/home/header/logo.svg",
                    "https://www.bankofbaroda.in/business-banking/rural-agri/loans-and-advances/baroda-kisan-credit-card",
                    "2026-11-18",
                    1,
                    "Official Bank of Baroda Portal / Unsplash Open License",
                ),
                (
                    "pvt-mahindra-tractor",
                    "Mahindra Tractor & Implement Loan",
                    "Mahindra Finance",
                    "Equipment Finance",
                    "Up to 90% tractor funding",
                    "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80",
                    "https://www.mahindrafinance.com/assets/images/logo.png",
                    "https://www.mahindrafinance.com/tractor-loans",
                    "2026-11-15",
                    1,
                    "Official Mahindra Finance Portal / Unsplash Open License",
                ),
                (
                    "pvt-bajaj-crop",
                    "Bajaj Allianz General Crop Insurance",
                    "Bajaj Allianz",
                    "Crop Insurance",
                    "Comprehensive yield risk cover",
                    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80",
                    "https://www.bajajallianz.com/content/dam/bagic/bagic-logo.png",
                    "https://www.bajajallianz.com/crop-insurance.html",
                    "2026-11-10",
                    1,
                    "Official Bajaj Allianz Portal / Unsplash Open License",
                ),
                (
                    "pvt-hdfc-irrigation",
                    "HDFC Drip & Micro Irrigation Loan",
                    "HDFC Bank",
                    "Irrigation Loan",
                    "Terms vary, see official page",
                    "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80",
                    "https://www.hdfcbank.com/content/api/contentstream-id/723fb80a-2dde-42a3-9793-7ae1be57c87f/2988185c-cc71-4a12-8877-3e819a86b972/Footer/Resource/Logo.svg",
                    "https://www.hdfcbank.com/personal/borrow/popular-loans/agriculture-loans",
                    "2026-11-12",
                    1,
                    "Official HDFC Bank Portal / Unsplash Open License",
                ),
            ]
            connection.executemany(
                """INSERT INTO private_schemes(id, name, lender, category, benefit_text, image_url, logo_url, source_url, last_verified, is_active, source_license)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                verified_private_schemes,
            )


def one(sql: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    with get_connection() as connection:
        row = connection.execute(sql, params).fetchone()
        return dict(row) if row else None


def many(sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    with get_connection() as connection:
        return [dict(row) for row in connection.execute(sql, params).fetchall()]


def execute(sql: str, params: tuple[Any, ...] = ()) -> None:
    with _lock, get_connection() as connection:
        connection.execute(sql, params)


def cleanup_voice_records(retention_days: int) -> None:
    retention = f"-{max(1, min(retention_days, 365))} days"
    with _lock, get_connection() as connection:
        connection.execute(
            "DELETE FROM voice_otp_challenges WHERE created_at < datetime('now','-1 day')"
        )
        connection.execute(
            "DELETE FROM voice_unanswered_questions WHERE created_at < datetime('now',?)",
            (retention,),
        )
        connection.execute(
            "DELETE FROM voice_call_sessions WHERE ended_at IS NOT NULL AND ended_at < datetime('now',?)",
            (retention,),
        )
        connection.execute(
            """
            UPDATE voice_call_sessions SET pending_summary=NULL
            WHERE pending_summary IS NOT NULL
              AND updated_at < datetime('now','-5 minutes')
            """
        )


def seed_demo_data() -> None:
    initialize_database()

    # 1. Government Schemes Catalog
    schemes = [
        ("scheme-pm-kisan", "PM-KISAN", "Ministry of Agriculture & FW", "Income support", "Central", "Direct income support for eligible landholding farmer families.", "₹6,000 per year", "Direct annual income support to verified landowning farmer families.", '["Land title (RoR / B-1 Khasra)", "Aadhaar Card", "Bank Passbook"]', "https://pmkisan.gov.in", "2026-CG-PMKS-01", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/PM-Kisan_Scheme_Logo.svg/640px-PM-Kisan_Scheme_Logo.svg.png"),
        ("scheme-kcc", "Kisan Credit Card (KCC)", "NABARD & Dept of Agriculture", "Agricultural credit", "Central", "Short-term credit for cultivation, farm inputs and post-harvest expenses.", "Up to ₹3,00,000 at 7% p.a. (3% subvention)", "Credit support for all active cultivators (landowners, tenants, sharecroppers).", '["Cultivator Certificate / Lease Agreement", "Aadhaar Card", "Land Record / Lease Deed"]', "https://pmkisan.gov.in", "2026-CG-CREDIT-01", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/300px-Emblem_of_India.svg.png"),
        ("scheme-pmfby", "PM Fasal Bima Yojana", "Ministry of Agriculture & FW", "Crop insurance", "Central", "Comprehensive yield risk insurance covering notified crops against natural calamities.", "Comprehensive crop loss protection up to ₹12,000/acre", "All farmers growing notified crops in notified areas (both loanee and non-loanee).", '["Sowing Certificate / Patwari Declaration", "Land Record / Rent Agreement", "Aadhaar Card"]', "https://pmfby.gov.in", "2026-CG-PMFBY-01", "https://pmfby.gov.in/assets/images/logo.png"),
        ("scheme-rgkny", "Rajiv Gandhi Kisan Nyay Yojana", "Dept of Agriculture, CG", "State subsidy", "Chhattisgarh", "State input assistance and price support incentive for paddy, maize, and pulse growers.", "Input assistance up to ₹9,000 per acre", "Chhattisgarh farmers registered with primary agricultural credit societies (PACS).", '["Kisan Khasra B-1", "PACS Registration Card", "Bank Account Details"]', "https://agriportal.cg.nic.in", "2026-CG-RGKNY-02", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Seal_of_Chhattisgarh.svg/300px-Seal_of_Chhattisgarh.svg.png"),
        ("scheme-gny", "Godhan Nyay Yojana", "Dept of Animal Husbandry, CG", "State subsidy", "Chhattisgarh", "Procurement of organic manure and cow dung at ₹2/kg through Gauthan committees.", "Direct cash transfer for verified vermicompost & dung sales", "Livestock owners and rural households registered with local Gauthans.", '["Gauthan Card", "Aadhaar Card", "Bank Account"]', "https://agriportal.cg.nic.in", "2026-CG-GNY-01", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Seal_of_Chhattisgarh.svg/300px-Seal_of_Chhattisgarh.svg.png"),
        ("scheme-ssy", "Saur Sujala Solar Pump Yojana", "CREDA Chhattisgarh", "State subsidy", "Chhattisgarh", "Subsidized solar powered irrigation pump sets for agricultural fields.", "Up to 90% subsidy on 3HP and 5HP solar pumps", "Farmers with agricultural land possessing an existing water source (borewell/pond).", '["Land Revenue Record (B-1/P-II)", "Source Water Certificate", "Aadhaar Card"]', "https://creda.cgstate.gov.in", "2026-CG-SSY-01", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Seal_of_Chhattisgarh.svg/300px-Seal_of_Chhattisgarh.svg.png"),
        ("scheme-smam", "Sub-Mission on Agricultural Mechanization", "Ministry of Agriculture & FW", "Equipment subsidy", "Central", "Subsidy assistance for farm mechanization, tractors, rotavators, and custom hiring centers.", "40% to 50% subsidy on approved agricultural equipment", "Small, marginal, and medium farmers seeking modern agricultural implements.", '["Land Record", "Quotation from Authorized Dealer", "Aadhaar Card"]', "https://agrimachinery.nic.in", "2026-CG-SMAM-01", "https://agrimachinery.nic.in/assets/images/logo.png"),
    ]
    for scheme in schemes:
        execute(
            """INSERT INTO schemes(id,name,department,category,state,description,benefit_description,eligibility_summary,required_documents,official_url,policy_version,image_url,last_updated,status,is_demo)
               VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,'active',1)
               ON CONFLICT(id) DO UPDATE SET
                 name=excluded.name, department=excluded.department, category=excluded.category,
                 state=excluded.state, description=excluded.description, benefit_description=excluded.benefit_description,
                 eligibility_summary=excluded.eligibility_summary, required_documents=excluded.required_documents,
                 official_url=excluded.official_url, policy_version=excluded.policy_version, image_url=excluded.image_url""",
            (scheme[0], scheme[1], scheme[2], scheme[3], scheme[4], scheme[5], scheme[6], scheme[7], scheme[8], scheme[9], scheme[10], scheme[11], "22 Nov 2026"),
        )

    # 2. Seed Five Canonical Demo Accounts (Idempotent)
    demo_accounts = [
        # Farmer 1 — Small Landowner (Ramesh Kumar)
        {
            "id": "user-farmer-1",
            "email": "farmer1@krishisetu.demo",
            "mobile": "9876543210",
            "password": "DemoFarmer1@2026",
            "name": "Ramesh Kumar",
            "role": "farmer",
            "farmer_id": "KS-FARM-001",
            "state": "Chhattisgarh",
            "district": "Raipur",
            "block": "Arang",
            "village": "Khamtarai",
            "pincode": "493661",
            "cultivator_status": "Landowner",
            "cultivation_type": "landowner",
            "acres": 2.0,
            "crops": '["Paddy", "Vegetables"]',
            "irrigation": "partially_irrigated",
            "category": "Small & marginal farmer",
            "completion": 85,
        },
        # Farmer 2 — Medium Landowner (Suresh Verma)
        {
            "id": "user-farmer-2",
            "email": "farmer2@krishisetu.demo",
            "mobile": "9876543211",
            "password": "DemoFarmer2@2026",
            "name": "Suresh Verma",
            "role": "farmer",
            "farmer_id": "KS-FARM-002",
            "state": "Chhattisgarh",
            "district": "Durg",
            "block": "Patan",
            "village": "Jamgaon",
            "pincode": "491111",
            "cultivator_status": "Landowner",
            "cultivation_type": "landowner",
            "acres": 5.0,
            "crops": '["Paddy", "Maize"]',
            "irrigation": "irrigated",
            "category": "Medium farmer",
            "completion": 92,
        },
        # Farmer 3 — Tenant / Sharecropper (Mohan Sahu)
        {
            "id": "user-farmer-3",
            "email": "farmer3@krishisetu.demo",
            "mobile": "9876543212",
            "password": "DemoFarmer3@2026",
            "name": "Mohan Sahu",
            "role": "farmer",
            "farmer_id": "KS-FARM-003",
            "state": "Chhattisgarh",
            "district": "Bilaspur",
            "block": "Takhatpur",
            "village": "Belpan",
            "pincode": "495330",
            "cultivator_status": "Tenant farmer / Sharecropper",
            "cultivation_type": "tenant",
            "acres": 3.0,
            "landholding": 0.0,
            "crops": '["Paddy", "Pulses"]',
            "irrigation": "rainfed",
            "category": "Tenant/sharecropper",
            "completion": 75,
        },
        # Government Officer (Anita Verma)
        {
            "id": "user-officer-1",
            "email": "officer@krishisetu.demo",
            "mobile": "9876500001",
            "password": "DemoOfficer@2026",
            "name": "Anita Verma",
            "role": "officer",
            "dept": "Department of Agriculture & Farmers Welfare",
            "designation": "Agricultural Extension Officer",
            "state": "Chhattisgarh",
            "district": "Raipur",
            "block": "Arang",
            "emp_ref": "CG-AGRI-OFF-104",
        },
        # Administrator (Platform Admin)
        {
            "id": "user-admin-1",
            "email": "admin@krishisetu.demo",
            "mobile": "9876500002",
            "password": "DemoAdmin@2026",
            "name": "Platform Administrator",
            "role": "admin",
        },
    ]

    for acc in demo_accounts:
        pwd_hash = hash_password(acc["password"])
        execute(
            """INSERT INTO users(id, email, mobile_number, password_hash, full_name, role, preferred_language, is_active)
               VALUES(?, ?, ?, ?, ?, ?, 'hi', 1)
               ON CONFLICT(id) DO UPDATE SET
                 email=excluded.email, mobile_number=excluded.mobile_number,
                 password_hash=excluded.password_hash, full_name=excluded.full_name,
                 role=excluded.role, is_active=1""",
            (acc["id"], acc["email"], acc["mobile"], pwd_hash, acc["name"], acc["role"]),
        )

        # Farmer profile
        if acc["role"] == "farmer":
            owned_land = acc.get("landholding", acc["acres"])
            execute(
                """INSERT INTO farmers(id, farmer_id, state, district, block, village, pincode, cultivator_status, cultivation_type, cultivated_area, landholding_acres, crops, irrigation_type, farmer_category, profile_completion, is_demo)
                   VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                   ON CONFLICT(id) DO UPDATE SET
                     farmer_id=excluded.farmer_id, state=excluded.state, district=excluded.district,
                     block=excluded.block, village=excluded.village, pincode=excluded.pincode,
                     cultivator_status=excluded.cultivator_status, cultivation_type=excluded.cultivation_type,
                     cultivated_area=excluded.cultivated_area, landholding_acres=excluded.landholding_acres,
                     crops=excluded.crops, irrigation_type=excluded.irrigation_type,
                     farmer_category=excluded.farmer_category, profile_completion=excluded.profile_completion""",
                (
                    acc["id"],
                    acc["farmer_id"],
                    acc["state"],
                    acc["district"],
                    acc["block"],
                    acc["village"],
                    acc["pincode"],
                    acc["cultivator_status"],
                    acc["cultivation_type"],
                    acc["acres"],
                    owned_land,
                    acc["crops"],
                    acc["irrigation"],
                    acc["category"],
                    acc["completion"],
                ),
            )

        # Government profile
        if acc["role"] == "officer":
            execute(
                """INSERT INTO government_profiles(id, user_id, department, designation, state, district, block, employee_reference)
                   VALUES(?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                     department=excluded.department, designation=excluded.designation,
                     state=excluded.state, district=excluded.district, block=excluded.block,
                     employee_reference=excluded.employee_reference""",
                (
                    f"gov-{acc['id']}",
                    acc["id"],
                    acc["dept"],
                    acc["designation"],
                    acc["state"],
                    acc["district"],
                    acc["block"],
                    acc["emp_ref"],
                ),
            )

    # 3. Seed Distinct Financial Digital Twins & Applications for Each Farmer
    execute("DELETE FROM applications WHERE is_demo=1")
    execute("DELETE FROM benefits WHERE is_demo=1")
    execute("DELETE FROM discrepancies WHERE is_demo=1")
    execute("DELETE FROM grievances WHERE is_demo=1")

    # Farmer 1 (Ramesh Kumar - KS-FARM-001)
    execute(
        """INSERT OR REPLACE INTO benefits(id,farmer_id,scheme_id,expected_amount,applied_amount,approved_amount,sanctioned_amount,disbursed_amount,received_amount,status,verification_status,financial_year,is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)""",
        ("benefit-1-1", "user-farmer-1", "scheme-pm-kisan", 6000, 6000, 6000, 6000, 6000, 6000, "received", "document_supported", "2026-27"),
    )
    execute(
        """INSERT OR REPLACE INTO benefits(id,farmer_id,scheme_id,expected_amount,applied_amount,approved_amount,sanctioned_amount,disbursed_amount,received_amount,status,verification_status,financial_year,is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)""",
        ("benefit-1-2", "user-farmer-1", "scheme-pmfby", 12000, 12000, 12000, 8000, 8000, 8000, "approved", "officer_verified", "2026-27"),
    )
    execute(
        """INSERT OR REPLACE INTO applications(id,application_number,farmer_id,scheme_id,status,submitted_at,remarks,is_demo)
           VALUES(?,?,?,?,?,?,?,1)""",
        ("app-1-1", "KS-2026-10482", "user-farmer-1", "scheme-pm-kisan", "approved", "2026-11-12", "Verified landowner application"),
    )
    execute(
        """INSERT OR REPLACE INTO applications(id,application_number,farmer_id,scheme_id,status,submitted_at,remarks,is_demo)
           VALUES(?,?,?,?,?,?,?,1)""",
        ("app-1-2", "CG-PMFBY-8821", "user-farmer-1", "scheme-pmfby", "under_review", "2026-11-08", "Yield loss assessment under verification"),
    )
    execute(
        """INSERT OR REPLACE INTO discrepancies(id,farmer_id,benefit_id,scheme_id,discrepancy_type,expected_amount,recorded_amount,difference_amount,explanation,severity,status,is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,1)""",
        ("discrepancy-1", "user-farmer-1", "benefit-1-2", "scheme-pmfby", "sanction_shortfall", 12000, 8000, 4000, "Sanctioned amount differs from the policy benefit estimate of ₹12,000.", "medium", "open"),
    )
    execute(
        """INSERT OR REPLACE INTO grievances(id,grievance_number,farmer_id,scheme_id,application_id,category,subject,description,priority,status,is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,1)""",
        ("grievance-1", "GRV-CG-10482", "user-farmer-1", "scheme-pmfby", "app-1-2", "Incorrect subsidy amount", "Sanction amount review", "Request review of PMFBY sanction shortfall of ₹4,000 for Kharif Paddy.", "medium", "under_review"),
    )

    # Farmer 2 (Suresh Verma - KS-FARM-002)
    execute(
        """INSERT OR REPLACE INTO benefits(id,farmer_id,scheme_id,expected_amount,applied_amount,approved_amount,sanctioned_amount,disbursed_amount,received_amount,status,verification_status,financial_year,is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)""",
        ("benefit-2-1", "user-farmer-2", "scheme-kcc", 150000, 150000, 150000, 150000, 150000, 150000, "received", "bank_confirmed", "2026-27"),
    )
    execute(
        """INSERT OR REPLACE INTO benefits(id,farmer_id,scheme_id,expected_amount,applied_amount,approved_amount,sanctioned_amount,disbursed_amount,received_amount,status,verification_status,financial_year,is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)""",
        ("benefit-2-2", "user-farmer-2", "scheme-ssy", 45000, 45000, 45000, 45000, 0, 0, "sanctioned", "officer_verified", "2026-27"),
    )
    execute(
        """INSERT OR REPLACE INTO benefits(id,farmer_id,scheme_id,expected_amount,applied_amount,approved_amount,sanctioned_amount,disbursed_amount,received_amount,status,verification_status,financial_year,is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)""",
        ("benefit-2-3", "user-farmer-2", "scheme-smam", 60000, 60000, 60000, 0, 0, 0, "under_review", "pending_inspection", "2026-27"),
    )
    execute(
        """INSERT OR REPLACE INTO applications(id,application_number,farmer_id,scheme_id,status,submitted_at,remarks,is_demo)
           VALUES(?,?,?,?,?,?,?,1)""",
        ("app-2-1", "KS-2026-20941", "user-farmer-2", "scheme-kcc", "approved", "2026-10-15", "KCC loan sanctioned through Bank of Baroda Patan branch"),
    )
    execute(
        """INSERT OR REPLACE INTO applications(id,application_number,farmer_id,scheme_id,status,submitted_at,remarks,is_demo)
           VALUES(?,?,?,?,?,?,?,1)""",
        ("app-2-2", "CG-SOLAR-4011", "user-farmer-2", "scheme-ssy", "sanctioned", "2026-11-01", "3HP Solar Pump sanctioned by CREDA; vendor installation pending"),
    )
    execute(
        """INSERT OR REPLACE INTO applications(id,application_number,farmer_id,scheme_id,status,submitted_at,remarks,is_demo)
           VALUES(?,?,?,?,?,?,?,1)""",
        ("app-2-3", "CG-SMAM-1102", "user-farmer-2", "scheme-smam", "under_review", "2026-11-18", "Tractor rotavator quotation under technical scrutiny"),
    )

    # Farmer 3 (Mohan Sahu - KS-FARM-003, Tenant Farmer)
    execute(
        """INSERT OR REPLACE INTO benefits(id,farmer_id,scheme_id,expected_amount,applied_amount,approved_amount,sanctioned_amount,disbursed_amount,received_amount,status,verification_status,financial_year,is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)""",
        ("benefit-3-1", "user-farmer-3", "scheme-kcc", 40000, 40000, 40000, 40000, 40000, 40000, "received", "document_supported", "2026-27"),
    )
    execute(
        """INSERT OR REPLACE INTO benefits(id,farmer_id,scheme_id,expected_amount,applied_amount,approved_amount,sanctioned_amount,disbursed_amount,received_amount,status,verification_status,financial_year,is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)""",
        ("benefit-3-2", "user-farmer-3", "scheme-pm-kisan", 6000, 6000, 0, 0, 0, 0, "rejected", "land_title_missing", "2026-27"),
    )
    execute(
        """INSERT OR REPLACE INTO applications(id,application_number,farmer_id,scheme_id,status,submitted_at,remarks,is_demo)
           VALUES(?,?,?,?,?,?,?,1)""",
        ("app-3-1", "KS-2026-30198", "user-farmer-3", "scheme-kcc", "approved", "2026-10-20", "Sharecropper credit line approved with cultivation certificate"),
    )
    execute(
        """INSERT OR REPLACE INTO applications(id,application_number,farmer_id,scheme_id,status,submitted_at,remarks,is_demo)
           VALUES(?,?,?,?,?,?,?,1)""",
        ("app-3-2", "KS-2026-30199", "user-farmer-3", "scheme-pm-kisan", "rejected", "2026-11-05", "Ineligible under policy 2026-CG-PMKS-01: Land title ownership mandatory"),
    )
    execute(
        """INSERT OR REPLACE INTO grievances(id,grievance_number,farmer_id,scheme_id,application_id,category,subject,description,priority,status,is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,1)""",
        ("grievance-3", "GRV-CG-30811", "user-farmer-3", "scheme-pm-kisan", "app-3-2", "Eligibility Guidance", "Tenant Cultivator Guidance", "Request guidance on state-level sharecropper incentives available in Bilaspur district.", "low", "acknowledged"),
    )
    execute(
        """INSERT INTO cultivator_verifications(id,farmer_id,cultivator_type,evidence_document_ids,verification_status,officer_remarks)
           VALUES(?,?,?,?,?,?)
           ON CONFLICT(id) DO UPDATE SET verification_status=excluded.verification_status""",
        ("verification-3", "user-farmer-3", "Tenant / Sharecropper", '["tenant-lease-affidavit.pdf"]', "under_review", "Awaiting Tehsildar cultivation verification certificate."),
    )

    # Notifications
    execute(
        """INSERT INTO notifications(id,user_id,title,message,notification_type,reference_type,reference_id,is_read)
           VALUES(?,?,?,?,?,?,?,0)
           ON CONFLICT(id) DO NOTHING""",
        ("notif-1-1", "user-farmer-1", "Discrepancy detected", "PMFBY sanction shortfall of ₹4,000 flagged for review.", "discrepancy", "discrepancy", "discrepancy-1"),
    )
    execute(
        """INSERT INTO notifications(id,user_id,title,message,notification_type,reference_type,reference_id,is_read)
           VALUES(?,?,?,?,?,?,?,0)
           ON CONFLICT(id) DO NOTHING""",
        ("notif-2-1", "user-farmer-2", "Saur Sujala Sanctioned", "Your 3HP Solar Pump subsidy has been sanctioned by CREDA.", "application", "application", "app-2-2"),
    )
    execute(
        """INSERT INTO notifications(id,user_id,title,message,notification_type,reference_type,reference_id,is_read)
           VALUES(?,?,?,?,?,?,?,0)
           ON CONFLICT(id) DO NOTHING""",
        ("notif-3-1", "user-farmer-3", "Cultivator Verification", "Tenant lease verification in progress for Takhatpur block.", "verification", "verification", "verification-3"),
    )

