from typing import Any


class SchemeChangeImpactRadar:
    """
    Scheme Change Impact Radar.
    Compares policy revisions, identifies changed clauses, evaluates impact on registered
    farmer cohorts, and maintains an auditable policy revision history.
    """

    POLICY_VERSIONS = [
        {
            "scheme_id": "pm-kisan",
            "current_version": "2026-v2.1",
            "previous_version": "2024-v1.8",
            "effective_date": "01 Oct 2026",
            "status": "Active & Enforced",
            "changed_clauses": [
                {
                    "clause": "Para 4.2 - Land Record Seeding",
                    "previous_text": "Physical Khasra copy acceptable at local CSC with self-declaration.",
                    "current_text": "Mandatory real-time API verification against State Revenue Bhuiyan database via AgriStack Farmer ID.",
                    "impact": "High. Farmers with pending mutation or non-digitized Khatas must link Bhuiyan record.",
                    "affected_farmers_count": 1420,
                    "action_required": "Notify farmers to complete e-KYC and digital land linking at nearest CSC.",
                },
                {
                    "clause": "Para 7 - Installment Frequency",
                    "previous_text": "3 installments of ₹2,000 every 4 months.",
                    "current_text": "3 installments of ₹2,000 every 4 months (direct DBT to Aadhaar-seeded accounts only).",
                    "impact": "Low. Operational payment process clarification.",
                    "affected_farmers_count": 0,
                    "action_required": "None.",
                },
            ],
        },
        {
            "scheme_id": "rgkny",
            "current_version": "2026-v3.0",
            "previous_version": "2025-v2.0",
            "effective_date": "15 Nov 2026",
            "status": "Active & Enforced",
            "changed_clauses": [
                {
                    "clause": "Schedule B - Minor Millets & Pulse Bonus",
                    "previous_text": "Input support of ₹9,000/acre for Paddy only.",
                    "current_text": "Input support of ₹9,000/acre extended to Kodo-Kutki, Ragi, Arhar, and Urad crops with ₹1,000/acre additional green manure bonus.",
                    "impact": "Beneficial. Tribal and dryland farmers cultivating millets gain immediate eligibility.",
                    "affected_farmers_count": 3890,
                    "action_required": "Prompt farmers cultivating millets to register their acreage on the portal.",
                },
            ],
        },
        {
            "scheme_id": "kcc",
            "current_version": "2026-v1.4",
            "previous_version": "2023-v1.0",
            "effective_date": "01 Aug 2026",
            "status": "Active & Enforced",
            "changed_clauses": [
                {
                    "clause": "Para 2.1 - Collateral-free Credit Limit",
                    "previous_text": "Collateral-free agricultural loans up to ₹1,60,000.",
                    "current_text": "Collateral-free agricultural loans raised to ₹2,00,000 for verified small & marginal farmers.",
                    "impact": "High. Enhances credit access without mortgage or land hypothecation.",
                    "affected_farmers_count": 5200,
                    "action_required": "Update loan calculator limits and advise farmers of higher non-collateral ceiling.",
                },
            ],
        },
    ]

    @classmethod
    def get_radar_updates(cls, scheme_id: str = None) -> list[dict[str, Any]]:
        if scheme_id:
            return [p for p in cls.POLICY_VERSIONS if p["scheme_id"] == scheme_id]
        return cls.POLICY_VERSIONS
