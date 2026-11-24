#!/usr/bin/env python3
"""
KrishiSetu — Seed Demo Accounts & Realistic Personas
Idempotent script to seed the 5 requested demo accounts:
1. Farmer 1 (Ramesh Kumar - Small Landowner, 2 acres, Raipur)
2. Farmer 2 (Suresh Verma - Medium Landowner, 5 acres, Durg)
3. Farmer 3 (Mohan Sahu - Tenant/Sharecropper, 3 acres, Bilaspur)
4. Government Officer (Anita Verma - Agricultural Extension Officer, Raipur)
5. Admin (Platform Administrator)
"""

import sys
from pathlib import Path

# Ensure backend app is on sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.store import initialize_database, seed_demo_data, many, one


def main():
    print("=" * 60)
    print("KrishiSetu: Initializing Database & Seeding 5 Demo Accounts")
    print("=" * 60)

    initialize_database()
    seed_demo_data()

    users = many("SELECT id, email, mobile_number, full_name, role FROM users ORDER BY id")
    print(f"\n[+] Successfully provisioned {len(users)} users in database:\n")
    for u in users:
        role_label = u["role"].upper()
        email_str = u.get("email") or "N/A"
        print(f"  * {role_label:10} | {u['id']:15} | {u['full_name']:22} | {email_str:25} | {u['mobile_number']}")

    farmers = many("SELECT f.*, u.full_name, u.email FROM farmers f JOIN users u ON u.id=f.id ORDER BY f.id")
    print(f"\n[+] Seeded {len(farmers)} Realistic Farmer Personas:\n")
    for f in farmers:
        print(f"  * {f['farmer_id']} - {f['full_name']} ({f['cultivator_status']})")
        print(f"    Location: {f['village']}, {f['block']}, {f['district']}, {f['state']}")
        print(f"    Cultivated Area: {f['cultivated_area']} acres (Owned: {f.get('landholding_acres', 0)} acres)")
        print(f"    Crops: {f['crops']} | Category: {f['farmer_category']} | Irrigation: {f.get('irrigation_type', 'N/A')}")
        print()

    benefits_count = len(many("SELECT id FROM benefits"))
    apps_count = len(many("SELECT id FROM applications"))
    schemes_count = len(many("SELECT id FROM schemes"))
    pvt_count = len(many("SELECT id FROM private_schemes"))

    print(f"[+] Total Active Government Schemes: {schemes_count}")
    print(f"[+] Total Verified Private Offerings: {pvt_count}")
    print(f"[+] Total Seeded Applications: {apps_count}")
    print(f"[+] Total Seeded Financial Benefit Records: {benefits_count}")
    print("\n[SUCCESS] Seed process completed idempotently with 0 errors.\n")


if __name__ == "__main__":
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    main()
