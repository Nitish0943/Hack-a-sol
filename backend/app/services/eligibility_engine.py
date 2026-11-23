import json
from typing import Any


class EligibilityEngine:
    """
    Deterministic rule evaluation engine for government agricultural schemes.
    Rule evaluation is strictly programmatic, versioned, and explainable.
    NO LLM hallucinations or probabilistic approximations are permitted for entitlement decisions.
    """

    @staticmethod
    def evaluate(farmer: Any, scheme: Any, rules: list[Any]) -> dict[str, Any]:
        passed_conditions = []
        failed_conditions = []
        unknown_conditions = []
        missing_documents = []

        farmer_crops = []
        try:
            farmer_crops = json.loads(farmer.crops_json) if isinstance(farmer.crops_json, str) else farmer.crops_json
        except Exception:
            farmer_crops = [farmer.crops_json]

        # Evaluate configured versioned rules
        for rule in rules:
            rule_field = rule.field_name
            operator = rule.operator
            target = rule.target_value
            clause = rule.clause_reference
            desc = rule.description
            desc_hi = rule.description_hi

            # Extract farmer value
            farmer_val = getattr(farmer, rule_field, None)

            if farmer_val is None:
                unknown_conditions.append({
                    "rule_type": rule.rule_type,
                    "field": rule_field,
                    "detail": f"Profile field '{rule_field}' is missing or unverified.",
                    "detail_hi": f"प्रोफ़ाइल विवरण '{rule_field}' उपलब्ध नहीं है।",
                    "clause": clause,
                })
                continue

            satisfied = False
            if operator == "eq":
                satisfied = str(farmer_val).strip().lower() == str(target).strip().lower()
            elif operator == "in":
                targets = [t.strip().lower() for t in target.split(",")]
                satisfied = str(farmer_val).strip().lower() in targets
            elif operator == "lte":
                try:
                    satisfied = float(farmer_val) <= float(target)
                except Exception:
                    satisfied = False
            elif operator == "gte":
                try:
                    satisfied = float(farmer_val) >= float(target)
                except Exception:
                    satisfied = False
            elif operator == "contains":
                # check if crop list contains target
                targets = [t.strip().lower() for t in target.split(",")]
                farmer_crops_lower = [str(c).strip().lower() for c in farmer_crops]
                satisfied = any(t in farmer_crops_lower for t in targets) or any(t == "all" for t in targets)

            cond_info = {
                "rule_type": rule.rule_type,
                "field": rule_field,
                "description": desc,
                "description_hi": desc_hi,
                "clause": clause,
                "farmer_value": str(farmer_val),
                "required_value": target,
            }

            if satisfied:
                passed_conditions.append(cond_info)
            else:
                failed_conditions.append(cond_info)

        # Cultivator Status specific checks
        if farmer.cultivator_status in ["Tenant Farmer", "Sharecropper", "Mutation Pending"]:
            if scheme.id == "pm-kisan":
                # PM-KISAN requires registered land ownership title in B1/Khatauni
                failed_conditions.append({
                    "rule_type": "cultivator_status",
                    "field": "cultivator_status",
                    "description": "PM-KISAN operational guidelines (Para 3.1) mandate verifiable agricultural land title in Revenue Records. Tenant farmers are not covered under standard PM-KISAN DBT.",
                    "description_hi": "पीएम-किसान परिचालन दिशानिर्देश (पैरा 3.1) के अनुसार राजस्व रिकॉर्ड (B1) में भूमि स्वामित्व अनिवार्य है। पट्टेदार/बटाईदार किसान सीधे पात्र नहीं हैं।",
                    "clause": "PM-KISAN Operational Guidelines 2024, Para 3.1 (Exclusion Criteria)",
                    "farmer_value": farmer.cultivator_status,
                    "required_value": "Landowner",
                })
            elif scheme.id in ["rgkny", "kcc"]:
                # State schemes and KCC permit tenant/sharecroppers with Girdawari verification
                passed_conditions.append({
                    "rule_type": "cultivator_status",
                    "field": "cultivator_status",
                    "description": "Rajiv Gandhi Kisan Nyay Yojana & KCC officially cover tenant farmers/sharecroppers subject to Gram Panchayat / Girdawari verification.",
                    "description_hi": "राजीव गांधी किसान न्याय योजना और केसीसी गिरदावरी/ग्राम पंचायत सत्यापन के अधीन बटाईदार किसानों को कवर करते हैं।",
                    "clause": "C.G. State Agriculture Circular RGKNY-2025/14",
                    "farmer_value": farmer.cultivator_status,
                    "required_value": "Tenant/Sharecropper with verification",
                })

        # Required documents check
        required_docs = []
        try:
            required_docs = json.loads(scheme.required_documents_json) if isinstance(scheme.required_documents_json, str) else scheme.required_documents_json
        except Exception:
            required_docs = []

        if farmer.cultivator_status != "Landowner":
            missing_documents.append("Batai / Tenant Agreement or Gram Panchayat Cultivation Certificate")

        # Determine the 4-state outcome
        if failed_conditions:
            status = "NOT_ELIGIBLE_BASED_ON_AVAILABLE_INFO"
            action = "Review the unmet eligibility conditions. If your land records or crop details have changed, update your profile or consult the Block Agriculture Officer."
            action_hi = "अपात्र शर्तों की समीक्षा करें। यदि आपके भूमि रिकॉर्ड या फसल विवरण में बदलाव हुआ है, तो प्रोफ़ाइल अपडेट करें या कृषि विस्तार अधिकारी से संपर्क करें।"
        elif unknown_conditions or farmer.profile_completion < 80:
            status = "INCOMPLETE_INFORMATION"
            action = "Complete missing profile information (crop details, irrigation, or land records) to finalize your entitlement check."
            action_hi = "पात्रता पूर्ण रूप से जांचने के लिए अपनी अधूरी प्रोफ़ाइल (फसल, सिंचाई, या भूमि रिकॉर्ड) पूर्ण करें।"
        elif missing_documents or farmer.cultivator_status in ["Tenant Farmer", "Sharecropper", "Mutation Pending"]:
            status = "NEEDS_ADDITIONAL_VERIFICATION"
            action = "You satisfy preliminary conditions, but documentary evidence (Land mutation / Cultivator affidavit / Bank-Aadhaar DBT seeding) must be verified by the Extension Officer."
            action_hi = "आप प्रारंभिक शर्तों को पूरा करते हैं, लेकिन भूमि नामांतरण/पट्टा प्रमाणपत्र या बैंक-आधार सीडिंग का सत्यापन अधिकारी द्वारा आवश्यक है।"
        else:
            status = "POTENTIALLY_ELIGIBLE"
            action = f"You satisfy all configured eligibility criteria for {scheme.name}. You may proceed to submit your formal application via the official government portal."
            action_hi = f"आप {scheme.name_hi} की सभी पात्रता शर्तों को पूरा करते हैं। आप आधिकारिक पोर्टल पर आवेदन प्रस्तुत कर सकते हैं।"

        return {
            "status": status,
            "passed_conditions": passed_conditions,
            "failed_conditions": failed_conditions,
            "unknown_conditions": unknown_conditions,
            "missing_documents": missing_documents,
            "policy_version": scheme.policy_version,
            "recommended_action": action,
            "recommended_action_hi": action_hi,
            "scheme_id": scheme.id,
            "scheme_name": scheme.name,
            "scheme_name_hi": scheme.name_hi,
        }
