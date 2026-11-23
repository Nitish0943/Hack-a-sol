from typing import Any


class AccessBlockerDiagnosis:
    """
    Structured Diagnostic Assistant for Farmer Benefit Access Barriers.
    Diagnoses why an agricultural subsidy or DBT payment is delayed, stopped, or flagged.
    Provides verified official remedies, contact points, and redressal steps.
    """

    KNOWN_BLOCKERS = [
        {
            "id": "aadhaar-dbt-mapping",
            "title": "Aadhaar-NPCI Bank DBT Mapping Not Active",
            "title_hi": "आधार-NPCI बैंक डीबीटी मैपिंग सक्रिय नहीं है",
            "symptom": "Scheme status shows 'Payment Sent via PFMS' but bank account shows zero credit or SMS alert received.",
            "symptom_hi": "योजना स्थिति में 'PFMS से भुगतान प्रेषित' दिख रहा है किंतु बैंक खाते में राशि जमा नहीं हुई।",
            "primary_cause": "The bank account is not seeded with Aadhaar on the NPCI mapper, or a different older bank account was credited.",
            "verification_steps": [
                "Visit your bank branch with Aadhaar card and request 'NPCI DBT Seeding Form'.",
                "Dial *99*99*1# on your phone or check resident.uidai.gov.in/bank-mapper for active bank link status.",
                "Ensure your account is not marked dormant due to inactivity (>6 months).",
            ],
            "official_channel": "Nearest Nationalized/Gramin Bank Branch or Aadhaar Seva Kendra",
            "severity": "High",
        },
        {
            "id": "mutation-pending",
            "title": "Land Record Mutation Pending (Naam-Aantaran)",
            "title_hi": "राजस्व रिकॉर्ड में नामांतरण लंबित (ब1/खतौनी)",
            "symptom": "Eligibility checker flags 'Land title unverified' or PM-KISAN marks application 'Land Document Mismatch'.",
            "symptom_hi": "पात्रता जांच में 'भूमि स्वामित्व असत्यापित' या 'दस्तावेज़ बेमेल' आ रहा है।",
            "primary_cause": "Ancestral land partition or purchase deed not updated in Chhattisgarh Bhuiyan (bhunaksha.cg.nic.in) portal.",
            "verification_steps": [
                "Obtain updated Khasra/B1 copy from Lok Seva Kendra (LSK).",
                "Submit mutation request to the Patwari / Tehsil Office.",
                "Upload the pending mutation receipt in KrishiSetu Cultivator Bridge.",
            ],
            "official_channel": "Tehsildar Office or Patwari Halka / Lok Seva Kendra",
            "severity": "Critical",
        },
        {
            "id": "tenant-cultivation-unverified",
            "title": "Tenant / Sharecropper Cultivation Unverified (Girdawari Gap)",
            "title_hi": "बटाईदार/पट्टेदार किसान सत्यापन अधूरा (गिरदावरी)",
            "symptom": "State scheme application marked 'Cultivation certificate missing' or rejected for lack of land title.",
            "symptom_hi": "राज्य योजना में 'खेती का प्रमाण पत्र अनुपलब्ध' या भूमि स्वामित्व न होने के कारण अस्वीकृत।",
            "primary_cause": "Landowner has not signed the Batai agreement, or Patwari Girdawari did not record actual tenant crop possession.",
            "verification_steps": [
                "Obtain Gram Panchayat Cultivator Certificate signed by Sarpanch/Sachiv.",
                "Request physical verification by Rural Agricultural Extension Officer (RAEO).",
                "Submit verification request on KrishiSetu Cultivator Identity Bridge.",
            ],
            "official_channel": "Gram Panchayat Sachiv & Rural Agriculture Extension Officer (RAEO)",
            "severity": "High",
        },
        {
            "id": "block-officer-pendency",
            "title": "Dossier Pending Verification at Block Agriculture Office",
            "title_hi": "विकासखंड कृषि कार्यालय स्तर पर आवेदन लंबित",
            "symptom": "Application status shows 'Under review' for more than 45 days without rejection reason.",
            "symptom_hi": "आवेदन बिना किसी कारण के 45 दिनों से अधिक समय से 'समीक्षाधीन' दिख रहा है।",
            "primary_cause": "Batch verification quota pending or RAEO field inspection report not uploaded to state portal.",
            "verification_steps": [
                "Generate automated inquiry letter using KrishiSetu Grievance Assistant.",
                "Visit Senior Agriculture Development Officer (SADO) at Janpad Panchayat.",
                "Call Kisan Call Center toll-free at 1800-180-1551 with application reference.",
            ],
            "official_channel": "Senior Agriculture Development Officer (SADO) / Janpad Panchayat",
            "severity": "Medium",
        },
    ]

    @classmethod
    def diagnose(cls, selected_symptom: str = None) -> list[dict[str, Any]]:
        if not selected_symptom:
            return cls.KNOWN_BLOCKERS
        filtered = [
            b for b in cls.KNOWN_BLOCKERS
            if selected_symptom.lower() in b["id"]
            or selected_symptom.lower() in b["title"].lower()
            or selected_symptom.lower() in b["symptom"].lower()
        ]
        return filtered if filtered else cls.KNOWN_BLOCKERS
