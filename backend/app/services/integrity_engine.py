from typing import Any


class IntegrityEngine:
    """
    Policy-to-Payment Integrity Engine.
    Cross-checks versioned policy entitlement rules against recorded sanction orders,
    treasury batch releases, and confirmed farmer bank receipts.
    Detects calculation anomalies, unverified deductions, and systemic delays.
    """

    @staticmethod
    def audit_benefit(
        farmer: Any,
        scheme: Any,
        benefit: Any,
    ) -> list[dict[str, Any]]:
        discrepancies = []

        # 1. Check for Sanction vs Expected Policy Benefit Mismatch
        if benefit.sanctioned_amount > 0 and benefit.estimated_amount > 0:
            diff = benefit.estimated_amount - benefit.sanctioned_amount
            if diff != 0:
                discrepancies.append({
                    "alert_type": "Sanction Amount Mismatch",
                    "alert_type_hi": "स्वीकृत राशि में अंतर",
                    "severity": "High" if abs(diff) >= 3000 else "Medium",
                    "expected_amount": benefit.estimated_amount,
                    "actual_amount": benefit.sanctioned_amount,
                    "difference": diff,
                    "explanation": (
                        f"Expected policy entitlement of ₹{benefit.estimated_amount:,} based on registered {farmer.cultivated_area} "
                        f"acres under {scheme.name} guidelines, but issued sanction order shows ₹{benefit.sanctioned_amount:,}. "
                        f"Variance of ₹{abs(diff):,} requires documentary verification of land classification or deductions."
                    ),
                    "policy_clause": f"{scheme.name} Policy Clause 4.2 (Entitlement Schedule)",
                    "policy_version": scheme.policy_version,
                    "status": "Pending",
                })

        # 2. Check for Sanctioned vs Disbursed Gap
        if benefit.sanctioned_amount > 0 and benefit.disbursed_amount < benefit.sanctioned_amount:
            unreleased = benefit.sanctioned_amount - benefit.disbursed_amount
            discrepancies.append({
                "alert_type": "Pending Payment Release",
                "alert_type_hi": "भुगतान जारी होना शेष",
                "severity": "Medium",
                "expected_amount": benefit.sanctioned_amount,
                "actual_amount": benefit.disbursed_amount,
                "difference": unreleased,
                "explanation": (
                    f"An amount of ₹{benefit.sanctioned_amount:,} was sanctioned on record, but only ₹{benefit.disbursed_amount:,} "
                    f"has been released via the PFMS/DBT gateway. Balance ₹{unreleased:,} is pending treasury clearance."
                ),
                "policy_clause": "Direct Benefit Transfer (DBT) Operating Manual Para 7",
                "policy_version": scheme.policy_version,
                "status": "Pending",
            })

        # 3. Check for Disbursed vs Confirmed Bank Receipt Gap
        if benefit.disbursed_amount > 0 and benefit.received_amount < benefit.disbursed_amount:
            missing_receipt = benefit.disbursed_amount - benefit.received_amount
            discrepancies.append({
                "alert_type": "Unconfirmed Bank Credit (DBT Transit Gap)",
                "alert_type_hi": "बैंक खाते में राशि अप्राप्त",
                "severity": "High",
                "expected_amount": benefit.disbursed_amount,
                "actual_amount": benefit.received_amount,
                "difference": missing_receipt,
                "explanation": (
                    f"Payment batch indicates ₹{benefit.disbursed_amount:,} released, but farmer bank ledger confirms only "
                    f"₹{benefit.received_amount:,}. Check Aadhaar-NPCI mapper status or dormant account flags."
                ),
                "policy_clause": "RBI & NPCI Guidelines on DBT Payment Settlement",
                "policy_version": scheme.policy_version,
                "status": "Pending",
            })

        return discrepancies
