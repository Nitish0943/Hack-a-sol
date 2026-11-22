import sqlite3
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import get_settings


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
              id TEXT PRIMARY KEY, mobile_number TEXT UNIQUE NOT NULL,
              full_name TEXT NOT NULL, role TEXT NOT NULL,
              preferred_language TEXT NOT NULL DEFAULT 'hi',
              is_active INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS farmers (
              id TEXT PRIMARY KEY, farmer_id TEXT UNIQUE NOT NULL,
              state TEXT, district TEXT, block TEXT, village TEXT,
              pincode TEXT, cultivator_status TEXT, cultivated_area REAL,
              crops TEXT, farmer_category TEXT, profile_completion INTEGER NOT NULL DEFAULT 85,
              is_demo INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS sessions (
              token TEXT PRIMARY KEY, user_id TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS otp_challenges (
              mobile_number TEXT PRIMARY KEY, otp TEXT NOT NULL,
              expires_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS schemes (
              id TEXT PRIMARY KEY, name TEXT NOT NULL, department TEXT,
              category TEXT, state TEXT, description TEXT,
              benefit_description TEXT, eligibility_summary TEXT,
              required_documents TEXT, official_url TEXT,
              policy_version TEXT, last_updated TEXT,
              status TEXT NOT NULL DEFAULT 'active', is_demo INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS eligibility_results (
              id TEXT PRIMARY KEY, farmer_id TEXT NOT NULL, scheme_id TEXT NOT NULL,
              status TEXT NOT NULL, passed_rules TEXT, failed_rules TEXT,
              missing_information TEXT, explanation TEXT, policy_version TEXT,
              calculated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, is_demo INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS calculations (
              id TEXT PRIMARY KEY, farmer_id TEXT NOT NULL, calculation_type TEXT,
              inputs TEXT, result TEXT, policy_version TEXT,
              calculated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, is_demo INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS benefits (
              id TEXT PRIMARY KEY, farmer_id TEXT NOT NULL, scheme_id TEXT,
              expected_amount REAL, applied_amount REAL, approved_amount REAL,
              sanctioned_amount REAL, disbursed_amount REAL, received_amount REAL,
              status TEXT, verification_status TEXT, financial_year TEXT,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, is_demo INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS applications (
              id TEXT PRIMARY KEY, application_number TEXT UNIQUE NOT NULL,
              farmer_id TEXT NOT NULL, scheme_id TEXT, status TEXT,
              submitted_at TEXT, remarks TEXT,
              is_demo INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS application_history (
              id TEXT PRIMARY KEY, application_id TEXT NOT NULL,
              previous_status TEXT, new_status TEXT, changed_by TEXT,
              remarks TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS discrepancies (
              id TEXT PRIMARY KEY, farmer_id TEXT NOT NULL, benefit_id TEXT,
              scheme_id TEXT, discrepancy_type TEXT, expected_amount REAL,
              recorded_amount REAL, difference_amount REAL, explanation TEXT,
              severity TEXT, status TEXT, resolution_note TEXT,
              is_demo INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS grievances (
              id TEXT PRIMARY KEY, grievance_number TEXT UNIQUE NOT NULL,
              farmer_id TEXT NOT NULL, scheme_id TEXT, application_id TEXT,
              category TEXT, subject TEXT, description TEXT, priority TEXT,
              status TEXT, resolution_note TEXT,
              is_demo INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS grievance_history (
              id TEXT PRIMARY KEY, grievance_id TEXT NOT NULL,
              status TEXT, remark TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS cultivator_verifications (
              id TEXT PRIMARY KEY, farmer_id TEXT NOT NULL, cultivator_type TEXT,
              evidence_document_ids TEXT, verification_status TEXT,
              officer_remarks TEXT, submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS notifications (
              id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT,
              message TEXT, notification_type TEXT, reference_type TEXT,
              reference_id TEXT, is_read INTEGER NOT NULL DEFAULT 0,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS audit_logs (
              id TEXT PRIMARY KEY, actor_id TEXT, action TEXT,
              entity_type TEXT, entity_id TEXT, old_values TEXT,
              new_values TEXT, ip_address TEXT,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        farmer_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(farmers)").fetchall()
        }
        if "farmer_category" not in farmer_columns:
            connection.execute("ALTER TABLE farmers ADD COLUMN farmer_category TEXT")


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


def seed_demo_data() -> None:
    initialize_database()
    if one("SELECT id FROM users LIMIT 1"):
        return
    users = [
        ("user-farmer-1", "9876543210", "Ramesh Kumar", "farmer"),
        ("user-officer-1", "9876500001", "Anita Verma", "officer"),
        ("user-admin-1", "9876500002", "Platform Admin", "admin"),
    ]
    for user in users:
        execute(
            "INSERT INTO users(id,mobile_number,full_name,role,preferred_language,is_active) VALUES(?,?,?,?,?,1)",
            (*user, "hi"),
        )
    execute(
        "INSERT INTO farmers(id,farmer_id,state,district,block,village,pincode,cultivator_status,cultivated_area,crops,farmer_category,profile_completion,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)",
        ("user-farmer-1", "KS-CG-10482", "Chhattisgarh", "Raipur", "Arang", "Khamtarai", "493661", "Landowner", 2.0, '["Paddy"]', "Small & marginal farmer", 85),
    )
    schemes = [
        ("scheme-pm-kisan", "PM-KISAN", "Ministry of Agriculture", "Income support", "Central", "Direct income support for eligible landholding farmer families.", "₹6,000 per year (sample policy)", "Landholding and cultivator verification", '["Land record","Cultivation evidence"]', "https://pmkisan.gov.in", "2026-CG-PMKS-01"),
        ("scheme-kcc", "Kisan Credit Card", "Department of Agriculture", "Agricultural credit", "Central", "Short-term credit for cultivation and allied activities.", "Interest support on eligible loan", "Profile and landholding review", '["Land record","Identity document"]', "", "2026-CG-CREDIT-01"),
        ("scheme-pmfby", "PM Fasal Bima Yojana", "Agriculture Insurance", "Crop insurance", "Central", "Crop insurance against notified natural risks.", "Risk-based premium subsidy", "Crop and season verification", '["Crop declaration","Land record"]', "", "2026-CG-PMFBY-01"),
    ]
    for scheme in schemes:
        execute(
            "INSERT INTO schemes(id,name,department,category,state,description,benefit_description,eligibility_summary,required_documents,official_url,policy_version,last_updated,status,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,1)",
            (*scheme, "18 Nov 2026", "active"),
        )
    execute(
        "INSERT INTO benefits(id,farmer_id,scheme_id,expected_amount,applied_amount,approved_amount,sanctioned_amount,disbursed_amount,received_amount,status,verification_status,financial_year,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)",
        ("benefit-1", "user-farmer-1", "scheme-pm-kisan", 6000, 6000, 6000, 6000, 6000, 6000, "received", "document_supported", "2026-27"),
    )
    execute(
        "INSERT INTO benefits(id,farmer_id,scheme_id,expected_amount,applied_amount,approved_amount,sanctioned_amount,disbursed_amount,received_amount,status,verification_status,financial_year,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)",
        ("benefit-2", "user-farmer-1", "scheme-pmfby", 12000, 12000, 12000, None, None, None, "approved", "officer_verified", "2026-27"),
    )
    execute(
        "INSERT INTO applications(id,application_number,farmer_id,scheme_id,status,submitted_at,remarks,is_demo) VALUES(?,?,?,?,?,?,?,1)",
        ("application-1", "KS-2026-10482", "user-farmer-1", "scheme-pm-kisan", "approved", "2026-11-12", "Verified demo application"),
    )
    execute(
        "INSERT INTO applications(id,application_number,farmer_id,scheme_id,status,submitted_at,remarks,is_demo) VALUES(?,?,?,?,?,?,?,1)",
        ("application-2", "CG-PMFBY-8821", "user-farmer-1", "scheme-pmfby", "under_review", "2026-11-08", "Review in progress"),
    )
    execute(
        "INSERT INTO discrepancies(id,farmer_id,benefit_id,scheme_id,discrepancy_type,expected_amount,recorded_amount,difference_amount,explanation,severity,status,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,?,1)",
        ("discrepancy-1", "user-farmer-1", "benefit-2", "scheme-pmfby", "missing_disbursement_record", 12000, None, None, "The approved benefit has no corresponding disbursement record. This indicates missing information, not proof of non-payment.", "medium", "open"),
    )
    execute(
        "INSERT INTO grievances(id,grievance_number,farmer_id,scheme_id,application_id,category,subject,description,priority,status,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,1)",
        ("grievance-1", "GRV-CG-10482", "user-farmer-1", "scheme-pm-kisan", "application-1", "Incorrect subsidy amount", "Sanction amount review", "I request review of the recorded sanction amount for my PM-KISAN application.", "medium", "under_review"),
    )
    execute(
        "INSERT INTO cultivator_verifications(id,farmer_id,cultivator_type,evidence_document_ids,verification_status,officer_remarks) VALUES(?,?,?,?,?,?)",
        ("verification-1", "user-farmer-1", "Landowner", '["demo-land-record.pdf"]', "under_review", "Awaiting officer evidence review."),
    )
    execute(
        "INSERT INTO notifications(id,user_id,title,message,notification_type,reference_type,reference_id,is_read) VALUES(?,?,?,?,?,?,?,0)",
        ("notification-1", "user-farmer-1", "Discrepancy requires review", "Your PM-KISAN record has a potential payment discrepancy.", "discrepancy", "discrepancy", "discrepancy-1"),
    )
