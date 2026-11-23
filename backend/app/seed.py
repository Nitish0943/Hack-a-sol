import json
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import AsyncSessionLocal
from app.models import (
    Application,
    AuditLog,
    BenefitLedger,
    CultivatorVerification,
    Discrepancy,
    EligibilityResult,
    Farmer,
    Grievance,
    Notification,
    Scheme,
    SchemeRule,
    User,
)


async def seed_database() -> None:
    async with AsyncSessionLocal() as session:
        # Check if users already seeded
        result = await session.execute(select(User))
        if result.scalars().first():
            return  # Already seeded

        # 1. Users
        farmer_user = User(
            phone="9876543210",
            name="Ramesh Kumar",
            role="farmer",
            preferred_language="hi",
        )
        officer_user = User(
            phone="9876543211",
            name="Anita Verma",
            role="officer",
            preferred_language="en",
        )
        admin_user = User(
            phone="9876543212",
            name="Platform Administrator",
            role="admin",
            preferred_language="en",
        )

        session.add_all([farmer_user, officer_user, admin_user])
        await session.flush()

        # 2. Farmer Profile
        farmer_profile = Farmer(
            user_id=farmer_user.id,
            farmer_id="KS-CG-10482",
            state="Chhattisgarh",
            district="Raipur",
            block="Arang",
            village="Khamtarai",
            pincode="492001",
            farmer_category="Small & Marginal",
            cultivator_status="Landowner",
            landholding_acres=2.0,
            cultivated_area=2.0,
            crops_json=json.dumps(["Paddy", "Kodo-Kutki"]),
            farming_season="Kharif",
            irrigation_type="Tube well",
            profile_completion=85,
        )
        session.add(farmer_profile)
        await session.flush()

        # 3. Comprehensive Government Schemes
        schemes_data = [
            Scheme(
                id="pm-kisan",
                code="PM-KISAN",
                name="PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                name_hi="पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)",
                name_cghi="पीएम-किसान सम्मान निधि योजना",
                department="Ministry of Agriculture & Farmers Welfare, GoI",
                category="Income support",
                benefit_type="Direct Benefit Transfer (DBT)",
                benefit_summary="₹6,000 per year in 3 equal four-monthly installments",
                benefit_summary_hi="प्रति वर्ष ₹6,000 (₹2,000 की 3 समान किस्तों में)",
                description=(
                    "Central sector scheme to augment income of all landholding farmer families across India. "
                    "Financial benefit is directly credited into Aadhaar-linked bank accounts via DBT."
                ),
                description_hi=(
                    "सभी भू-धारक किसान परिवारों की आय बढ़ाने के लिए केंद्रीय क्षेत्र की योजना। "
                    "डीबीटी के माध्यम से सीधे आधार से जुड़े बैंक खातों में ₹6,000 सालाना जमा किए जाते हैं।"
                ),
                eligibility_criteria_json=json.dumps([
                    "Farmer family holding cultivable agricultural land title in revenue records",
                    "Names registered in State Bhuiyan / Land Record database",
                    "Aadhaar-seeded bank account enabled for NPCI DBT",
                    "Excludes institutional landholders, income-tax payers, and constitutional post holders",
                ]),
                required_documents_json=json.dumps([
                    "Aadhaar Card",
                    "Revenue Land Record (Khatauni / B1 copy)",
                    "Aadhaar-seeded Bank Passbook",
                    "Active Mobile Number",
                ]),
                application_steps_json=json.dumps([
                    "Self-registration on pmkisan.gov.in or CSC Center",
                    "State revenue authority verification of land title",
                    "Aadhaar e-KYC authentication via OTP or biometric",
                    "District / State approval and PFMS DBT installment release",
                ]),
                official_url="https://pmkisan.gov.in",
                source_url="https://agricoop.nic.in/en/PM-Kisan",
                policy_version="2026-v2.1",
                financial_year="2026-27",
                state="All-India",
                last_verified="20 Nov 2026",
                is_active=True,
            ),
            Scheme(
                id="kcc",
                code="KCC",
                name="Kisan Credit Card (Modified Interest Subvention)",
                name_hi="किसान क्रेडिट कार्ड (ब्याज अनुदान योजना)",
                name_cghi="किसान क्रेडिट कार्ड योजना",
                department="Department of Agriculture & Farmers Welfare / RBI / NABARD",
                category="Agricultural credit",
                benefit_type="Subsidized Institutional Credit",
                benefit_summary="Short-term crop credit up to ₹3,00,000 at 4% net interest rate",
                benefit_summary_hi="₹3,00,000 तक का अल्पकालिक फसली ऋण मात्र 4% शुद्ध ब्याज दर पर",
                description=(
                    "Provides timely and hassle-free institutional short-term credit for crop cultivation, post-harvest expenses, "
                    "and allied activities. Standard 7% interest rate reduced by 3% prompt repayment incentive."
                ),
                description_hi=(
                    "फसल उत्पादन, कटाई उपरांत खर्च और संबद्ध गतिविधियों के लिए सुलभ संस्थागत ऋण। "
                    "7% मानक ब्याज दर पर समय पर पुनर्भुगतान करने पर 3% अतिरिक्त अनुदान (शुद्ध 4%) मिलता है।"
                ),
                eligibility_criteria_json=json.dumps([
                    "All farmers — individuals / joint cultivators / tenant farmers / sharecroppers",
                    "Scale of finance calculated on registered crop acreage",
                    "Collateral-free limit available up to ₹1,60,000 (raised to ₹2,00,000 in revised policy)",
                    "Satisfactory credit history and KYC verification",
                ]),
                required_documents_json=json.dumps([
                    "Application Form (One-page simplified KCC form)",
                    "Identity & Address Proof (Aadhaar / Voter ID)",
                    "Land Records (B1 / P-II / Rin Pustika) or Tenant Cultivation Agreement",
                    "Crop cultivation certificate / Patwari Girdawari",
                ]),
                application_steps_json=json.dumps([
                    "Submit form at nearest Commercial, Cooperative, or Regional Rural Bank branch",
                    "Branch Manager examines land records and sanction scale of finance",
                    "Issue of RuPay Kisan Credit Card with 5-year validity and annual review",
                ]),
                official_url="https://www.myscheme.gov.in/schemes/kcc",
                source_url="https://www.nabard.org/content1.aspx?id=598",
                policy_version="2026-v1.4",
                financial_year="2026-27",
                state="All-India",
                last_verified="15 Nov 2026",
                is_active=True,
            ),
            Scheme(
                id="pmfby",
                code="PMFBY",
                name="Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                name_hi="प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)",
                name_cghi="प्रधानमंत्री फसल बीमा योजना",
                department="Ministry of Agriculture & Farmers Welfare / Agriculture Insurance Company",
                category="Crop insurance",
                benefit_type="Risk-based Premium Subsidy & Claim Payout",
                benefit_summary="Comprehensive yield & localized risk cover with farmer premium capped at 1.5% - 2%",
                benefit_summary_hi="अधिकतम 1.5% - 2% प्रीमियम पर व्यापक फसल सुरक्षा एवं मुआवजा",
                description=(
                    "Provides financial support to farmers suffering crop loss/damage due to unforeseen natural calamities "
                    "including drought, flood, pests, and unseasonal rainfall."
                ),
                description_hi=(
                    "सूखा, बाढ़, ओलावृष्टि और कीट प्रकोप जैसी प्राकृतिक आपदाओं से फसल क्षति होने पर किसानों को व्यापक बीमा सुरक्षा।"
                ),
                eligibility_criteria_json=json.dumps([
                    "Farmers cultivating notified crops in notified insurance units in Chhattisgarh",
                    "Covers loanee and non-loanee farmers, sharecroppers, and tenant farmers",
                    "Sowing declaration within the prescribed cut-off window",
                ]),
                required_documents_json=json.dumps([
                    "Aadhaar Card",
                    "Land Record (B1/P-II) or Tenant Cultivator Certificate",
                    "Crop Sowing Certificate (Boni Praman Patra / Patwari Panchnama)",
                    "Bank Account Details with IFSC",
                ]),
                application_steps_json=json.dumps([
                    "Apply through National Crop Insurance Portal (pmfby.gov.in) or Bank/CSC",
                    "Pay farmer share of premium (2% for Kharif Paddy, 1.5% for Rabi)",
                    "Government provides balance premium subsidy to insurance company",
                    "Claims calculated via Crop Cutting Experiments (CCE) and credited to bank account",
                ]),
                official_url="https://pmfby.gov.in",
                source_url="https://agri-insurance.gov.in",
                policy_version="2026-v2.0",
                financial_year="2026-27",
                state="All-India",
                last_verified="18 Nov 2026",
                is_active=True,
            ),
            Scheme(
                id="rgkny",
                code="RGKNY",
                name="Rajiv Gandhi Kisan Nyay Yojana (Chhattisgarh)",
                name_hi="राजीव गांधी किसान न्याय योजना (छत्तीसगढ़)",
                name_cghi="राजीव गांधी किसान न्याय योजना",
                department="Department of Agriculture & Farmers Welfare, Govt of Chhattisgarh",
                category="Income support",
                benefit_type="Agricultural Input Assistance",
                benefit_summary="₹9,000 per acre annual input subsidy for Paddy, Millets, and Pulses",
                benefit_summary_hi="धान, कोदो-कुटकी, रागी और दलहन हेतु ₹9,000 प्रति एकड़ वार्षिक इनपुट सहायता",
                description=(
                    "Chhattisgarh state flagship scheme providing direct income enhancement to encourage crop diversification, "
                    "increase cultivated acreage, and ensure remunerative returns for rural cultivators."
                ),
                description_hi=(
                    "छत्तीसगढ़ शासन की प्रमुख योजना जिसके तहत पंजीकृत धान एवं मिलेट्स उत्पादक किसानों को ₹9,000 प्रति एकड़ की दर से इनपुट सहायता दी जाती है।"
                ),
                eligibility_criteria_json=json.dumps([
                    "Resident farmers of Chhattisgarh cultivating registered crops",
                    "Paddy, Kodo-Kutki, Ragi, Maize, Arhar, Soybean, and Horticulture crops",
                    "Both landowners and verified tenant farmers/sharecroppers are eligible",
                    "Mandatory entry in Chhattisgarh Revenue Girdawari records",
                ]),
                required_documents_json=json.dumps([
                    "Chhattisgarh Bhuiyan B1 / Rin Pustika",
                    "Aadhaar Card and Mobile Number",
                    "Girdawari Crop Entry Copy",
                    "Bank Account seeded with Aadhaar",
                ]),
                application_steps_json=json.dumps([
                    "Registration on kisan.cg.nic.in through Primary Agricultural Cooperative Society (PACS)",
                    "Verification of crop area by Patwari and RAEO in Girdawari portal",
                    "DBT release of input assistance in four quarterly installments",
                ]),
                official_url="https://kisan.cg.nic.in",
                source_url="https://agriportal.cg.nic.in",
                policy_version="2026-v3.0",
                financial_year="2026-27",
                state="Chhattisgarh",
                last_verified="16 Nov 2026",
                is_active=True,
            ),
            Scheme(
                id="pm-kmy",
                code="PM-KMY",
                name="PM Kisan Maan-Dhan Yojana (PM-KMY)",
                name_hi="प्रधानमंत्री किसान मान-धन योजना (पेंशन)",
                name_cghi="पीएम किसान मान-धन पेंशन योजना",
                department="Department of Agriculture & Farmers Welfare / Life Insurance Corporation (LIC)",
                category="Pension support",
                benefit_type="Old-Age Social Security Pension",
                benefit_summary="Assured monthly pension of ₹3,000 upon reaching 60 years of age",
                benefit_summary_hi="60 वर्ष की आयु पूर्ण होने पर ₹3,000 की सुनिश्चित मासिक पेंशन",
                description=(
                    "Voluntary and contributory old-age pension scheme for all Small and Marginal Farmers (SMF) "
                    "with entry age between 18 and 40 years. 50% contribution by farmer, 50% matched by Central Government."
                ),
                description_hi=(
                    "छोटे और सीमांत किसानों के लिए वृद्धावस्था पेंशन योजना। 18 से 40 वर्ष की आयु के किसान पात्र हैं। ₹3,000 मासिक पेंशन।"
                ),
                eligibility_criteria_json=json.dumps([
                    "Small and marginal farmers owning cultivable land up to 2 hectares (5 acres)",
                    "Age between 18 and 40 years at time of enrollment",
                    "Not covered under EPFO / NPS / PM-SYM or other statutory social security schemes",
                ]),
                required_documents_json=json.dumps([
                    "Aadhaar Card",
                    "Bank Account / PM-KISAN bank account details",
                    "Landownership proof (Khatauni/B1)",
                ]),
                application_steps_json=json.dumps([
                    "Enrollment through Village Level Entrepreneur (VLE) at Common Service Center (CSC)",
                    "Auto-debit mandate setup from bank account or PM-KISAN benefit",
                    "Kisan Pension Card issued with unique Pension Number",
                ]),
                official_url="https://maandhan.in",
                source_url="https://agricoop.nic.in/en/PM-KMY",
                policy_version="2026-v1.1",
                financial_year="2026-27",
                state="All-India",
                last_verified="12 Nov 2026",
                is_active=True,
            ),
            Scheme(
                id="smam",
                code="SMAM",
                name="Sub-Mission on Agricultural Mechanization (SMAM)",
                name_hi="कृषि यंत्रीकरण सब-मिशन (कृषि उपकरण सब्सिडी)",
                name_cghi="कृषि यंत्र सब्सिडी योजना",
                department="Directorate of Agricultural Engineering, Chhattisgarh / MoA&FW",
                category="Equipment subsidy",
                benefit_type="Capital Subsidy on Farm Machinery",
                benefit_summary="40% to 50% subsidy on Tractors, Rotavators, Power Tillers, and Harvesters",
                benefit_summary_hi="ट्रैक्टर, रोटावेटर एवं कृषि यंत्रों पर 40% से 50% तक पूंजीगत अनुदान",
                description=(
                    "Promotes farm mechanization for small and marginal farmers through financial assistance on purchase "
                    "of modern agricultural implements and establishment of Custom Hiring Centers (CHCs)."
                ),
                description_hi=(
                    "आधुनिक कृषि यंत्रों की खरीद पर 40% से 50% तक की छूट। लघु एवं सीमांत किसानों तथा महिला किसानों को 50% की विशेष छूट।"
                ),
                eligibility_criteria_json=json.dumps([
                    "All registered landholding farmers in Chhattisgarh",
                    "Priority allocation to Small, Marginal, SC, ST, and Women farmers (50% subsidy)",
                    "Must not have availed subsidy on the same machine category within past 5 years",
                ]),
                required_documents_json=json.dumps([
                    "Aadhaar Card and Land Record (B1 copy)",
                    "Caste / Category Certificate if applicable",
                    "Bank Account Passbook",
                    "Quotation from authorized implement dealer",
                ]),
                application_steps_json=json.dumps([
                    "Online application on agrimachinery.nic.in portal",
                    "Selection through computerized transparent lottery system",
                    "Inspection of delivered machinery by Assistant Agricultural Engineer",
                    "Direct DBT credit of subsidy into farmer bank account",
                ]),
                official_url="https://agrimachinery.nic.in",
                source_url="https://agriportal.cg.nic.in/agriengg",
                policy_version="2026-v2.0",
                financial_year="2026-27",
                state="Chhattisgarh",
                last_verified="14 Nov 2026",
                is_active=True,
            ),
            Scheme(
                id="midh",
                code="MIDH",
                name="Mission for Integrated Development of Horticulture (Micro-Irrigation)",
                name_hi="एकीकृत बागवानी विकास मिशन (सूक्ष्म सिंचाई - ड्रिप/स्प्रिंकलर)",
                name_cghi="ड्रिप एवं स्प्रिंकलर सिंचाई सब्सिडी योजना",
                department="Department of Horticulture & Farm Forestry, Chhattisgarh / MoA&FW",
                category="Irrigation support",
                benefit_type="Capital Equipment Subsidy",
                benefit_summary="Up to 70% combined subsidy for drip and sprinkler irrigation systems",
                benefit_summary_hi="ड्रिप एवं स्प्रिंकलर सिंचाई प्रणालियों पर 70% तक संयुक्त सरकारी अनुदान",
                description=(
                    "Encourages water conservation and efficient water use in agriculture and horticulture through "
                    "subsidized installation of high-efficiency drip and sprinkler irrigation networks."
                ),
                description_hi=(
                    "पानी की बचत और अधिक उत्पादन के लिए ड्रिप एवं स्प्रिंकलर सिस्टम लगाने पर 70% तक अनुदान। जल स्रोत आवश्यक।"
                ),
                eligibility_criteria_json=json.dumps([
                    "Farmers cultivating vegetables, fruits, flowers, or field crops",
                    "Must possess functional water source (borewell, open well, or farm pond)",
                    "Electricity or solar pump connectivity",
                ]),
                required_documents_json=json.dumps([
                    "Land Title (B1/Khasra copy)",
                    "Aadhaar Card and Mobile Number",
                    "Water source proof (certificate or photo of borewell/pond)",
                    "Bank Passbook copy",
                ]),
                application_steps_json=json.dumps([
                    "Apply through Horticulture portal (dbt.cghorticulture.gov.in)",
                    "Site feasibility survey by horticulture officer",
                    "Installation by empanelled micro-irrigation manufacturer",
                    "GPS-tagged physical verification and subsidy release",
                ]),
                official_url="https://midh.gov.in",
                source_url="https://dbt.cghorticulture.gov.in",
                policy_version="2026-v1.5",
                financial_year="2026-27",
                state="Chhattisgarh",
                last_verified="10 Nov 2026",
                is_active=True,
            ),
        ]
        session.add_all(schemes_data)
        await session.flush()

        # 4. Scheme Rules for Deterministic Evaluation
        rules_data = [
            # PM-KISAN
            SchemeRule(
                scheme_id="pm-kisan",
                rule_type="landholding",
                field_name="landholding_acres",
                operator="gte",
                target_value="0.1",
                clause_reference="PM-KISAN Guidelines Para 2.1",
                description="Must own cultivable agricultural land title in revenue records",
                description_hi="राजस्व रिकॉर्ड में कृषि भूमि स्वामित्व होना अनिवार्य है",
            ),
            SchemeRule(
                scheme_id="pm-kisan",
                rule_type="location",
                field_name="state",
                operator="in",
                target_value="Chhattisgarh,All-India",
                clause_reference="PM-KISAN Guidelines Para 1.0",
                description="Applicable across all States and Union Territories",
                description_hi="सभी राज्यों एवं केंद्र शासित प्रदेशों में लागू",
            ),
            # KCC
            SchemeRule(
                scheme_id="kcc",
                rule_type="cultivator_status",
                field_name="cultivator_status",
                operator="in",
                target_value="Landowner,Tenant Farmer,Sharecropper,Joint Landholder",
                clause_reference="RBI Master Circular KCC Para 3",
                description="Covers landowners, tenant farmers, and sharecroppers with cultivation proof",
                description_hi="भूमि स्वामी, पट्टेदार और बटाईदार किसान खेती प्रमाण के साथ पात्र हैं",
            ),
            # RGKNY
            SchemeRule(
                scheme_id="rgkny",
                rule_type="location",
                field_name="state",
                operator="eq",
                target_value="Chhattisgarh",
                clause_reference="CG RGKNY Circular Para 2",
                description="Must be resident farmer cultivating land in Chhattisgarh",
                description_hi="छत्तीसगढ़ का निवासी किसान होना अनिवार्य है",
            ),
            SchemeRule(
                scheme_id="rgkny",
                rule_type="crop",
                field_name="crops_json",
                operator="contains",
                target_value="Paddy,Kodo-Kutki,Ragi,Maize,Pulses",
                clause_reference="CG RGKNY Schedule of Notified Crops",
                description="Must cultivate notified Kharif crops (Paddy, Minor Millets, Pulses)",
                description_hi="अधिसूचित खरीफ फसलों (धान, कोदो-कुटकी, रागी आदि) की खेती आवश्यक",
            ),
            # SMAM
            SchemeRule(
                scheme_id="smam",
                rule_type="farmer_category",
                field_name="farmer_category",
                operator="in",
                target_value="Small & Marginal,Medium,Large",
                clause_reference="SMAM Guidelines Section 4",
                description="Applicable to all categories with priority 50% subsidy for Small & Marginal farmers",
                description_hi="सभी श्रेणियों के लिए लागू; लघु एवं सीमांत किसानों को 50% वरीयता अनुदान",
            ),
        ]
        session.add_all(rules_data)
        await session.flush()

        # 5. Benefit Ledger Entries (Financial Digital Twin)
        # Separate lifecycle states: Potential, Applied, Approved, Sanctioned, Disbursed, Received
        ledger_data = [
            BenefitLedger(
                id="benefit-1",
                farmer_id=farmer_profile.id,
                scheme_id="pm-kisan",
                status="RECEIVED",
                estimated_amount=6000,
                applied_amount=6000,
                approved_amount=6000,
                sanctioned_amount=6000,
                disbursed_amount=6000,
                received_amount=6000,
                financial_year="2026-27",
                installment_info="Installment 16 (Aug-Nov 2026)",
                last_action_date="15 Nov 2026",
            ),
            BenefitLedger(
                id="benefit-2",
                farmer_id=farmer_profile.id,
                scheme_id="pmfby",
                status="APPROVED",
                estimated_amount=12000,
                applied_amount=12000,
                approved_amount=12000,
                sanctioned_amount=8000,  # Mismatch scenario: expected 12000, sanctioned 8000!
                disbursed_amount=0,
                received_amount=0,
                financial_year="2026-27",
                installment_info="Kharif 2026 Mid-Season Adversity Claim",
                last_action_date="18 Nov 2026",
            ),
            BenefitLedger(
                id="benefit-3",
                farmer_id=farmer_profile.id,
                scheme_id="kcc",
                status="SANCTIONED",
                estimated_amount=24500,
                applied_amount=24500,
                approved_amount=24500,
                sanctioned_amount=18000,
                disbursed_amount=18000,
                received_amount=18000,
                financial_year="2026-27",
                installment_info="Crop Loan Drawing Limit (Kharif)",
                last_action_date="20 Nov 2026",
            ),
            BenefitLedger(
                id="benefit-4",
                farmer_id=farmer_profile.id,
                scheme_id="rgkny",
                status="POTENTIAL",
                estimated_amount=18000,  # 2 acres * 9000
                applied_amount=0,
                approved_amount=0,
                sanctioned_amount=0,
                disbursed_amount=0,
                received_amount=0,
                financial_year="2026-27",
                installment_info="Awaiting Girdawari Registration",
                last_action_date="22 Nov 2026",
            ),
        ]
        session.add_all(ledger_data)
        await session.flush()

        # 6. Recorded Applications
        apps_data = [
            Application(
                id="app-1",
                farmer_id=farmer_profile.id,
                scheme_id="pm-kisan",
                reference_number="KS-2026-10482",
                submission_date="12 Nov 2026",
                status="Approved",
                channel="Self Portal / CSC",
                remarks="All 4 revenue validation checks cleared. DBT mandate active.",
                timeline_json=json.dumps([
                    {"date": "12 Nov 2026", "title": "Application Submitted", "detail": "Online dossier received via KrishiSetu."},
                    {"date": "13 Nov 2026", "title": "Revenue Records Verified", "detail": "Patwari Halka verified Khasra 142/2 in Bhuiyan."},
                    {"date": "14 Nov 2026", "title": "Aadhaar e-KYC Authenticated", "detail": "NPCI mapper verified active DBT bank account."},
                    {"date": "15 Nov 2026", "title": "Benefit Sanctioned & Disbursed", "detail": "₹2,000 installment released via PFMS batch."},
                ]),
            ),
            Application(
                id="app-2",
                farmer_id=farmer_profile.id,
                scheme_id="pmfby",
                reference_number="CG-PMFBY-8821",
                submission_date="08 Nov 2026",
                status="Under review",
                channel="Primary Agricultural Cooperative Society (PACS)",
                remarks="Awaiting joint field survey report by Agriculture Dept & AIC surveyor.",
                timeline_json=json.dumps([
                    {"date": "08 Nov 2026", "title": "Claim Intimation Lodged", "detail": "Intimation for unseasonal rainfall waterlogging."},
                    {"date": "11 Nov 2026", "title": "Loss Assessor Assigned", "detail": "Joint committee appointed for Arang block."},
                    {"date": "18 Nov 2026", "title": "Partial Sanction Issued", "detail": "Sanction order issued for ₹8,000 (Mismatch flagged)."},
                ]),
            ),
            Application(
                id="app-3",
                farmer_id=farmer_profile.id,
                scheme_id="kcc",
                reference_number="KCC-77421",
                submission_date="29 Oct 2026",
                status="Documents required",
                channel="Chhattisgarh Rajya Gramin Bank, Arang Branch",
                pending_action="Upload updated Rin Pustika and latest soil health report",
                remarks="Branch requested updated land revenue receipt for limit renewal.",
                timeline_json=json.dumps([
                    {"date": "29 Oct 2026", "title": "KCC Renewal Form Submitted", "detail": "Requested scale of finance credit limit."},
                    {"date": "05 Nov 2026", "title": "Credit Verification Passed", "detail": "CIBIL report satisfactory (740 score)."},
                    {"date": "12 Nov 2026", "title": "Additional Verification Notice", "detail": "Updated Rin Pustika required by bank officer."},
                ]),
            ),
        ]
        session.add_all(apps_data)
        await session.flush()

        # 7. Discrepancy Alerts (Policy-to-Payment Integrity Engine)
        alerts_data = [
            Discrepancy(
                id="alert-1",
                farmer_id=farmer_profile.id,
                scheme_id="pmfby",
                benefit_id="benefit-2",
                alert_type="Sanction Amount Mismatch",
                severity="High",
                expected_amount=12000,
                actual_amount=8000,
                difference=4000,
                explanation=(
                    "Expected crop insurance loss compensation of ₹12,000 based on notified 60% threshold yield loss "
                    "for Arang block paddy, but issued sanction order shows ₹8,000. Variance of ₹4,000 detected."
                ),
                policy_clause="PMFBY Revised Guidelines 2024, Para 13.4 (Claim Settlement Calculation)",
                policy_version="2026-v2.0",
                status="Pending",
                officer_notes="Officer investigation pending. Requires insurance surveyor CCE data sheet.",
            ),
            Discrepancy(
                id="alert-2",
                farmer_id=farmer_profile.id,
                scheme_id="kcc",
                benefit_id="benefit-3",
                alert_type="Scale of Finance Under-Allocation",
                severity="Medium",
                expected_amount=24500,
                actual_amount=18000,
                difference=6500,
                explanation=(
                    "District Level Technical Committee (DLTC) scale of finance prescribes ₹25,000/acre for irrigated paddy. "
                    "For 2 acres, entitled limit is ₹50,000, but approved drawing limit is capped at ₹18,000 without explanation."
                ),
                policy_clause="DLTC Raipur District Scale of Finance Notification 2026-27",
                policy_version="2026-v1.4",
                status="Pending",
                officer_notes="Awaiting branch explanation for reduced drawing limit.",
            ),
        ]
        session.add_all(alerts_data)
        await session.flush()

        # 8. Cultivator Identity Bridge Verification
        verifications_data = [
            CultivatorVerification(
                id="ver-1",
                farmer_id=farmer_profile.id,
                cultivator_type="Sharecropper",
                declaration_text=(
                    "I, Ramesh Kumar, declare that I am actively cultivating 1.5 acres of Khasra No. 142/2 in village Khamtarai "
                    "under 50:50 crop-sharing (Batai) arrangement with landowner Shri Balram Sahu."
                ),
                evidence_document_name="Gram_Panchayat_Batai_Declaration_2026.pdf",
                status="Pending",
                officer_notes="Scheduled for field inspection by Rural Agriculture Extension Officer (RAEO).",
            )
        ]
        session.add_all(verifications_data)
        await session.flush()

        # 9. Grievances
        grievances_data = [
            Grievance(
                id="grv-1",
                farmer_id=farmer_profile.id,
                scheme_id="pmfby",
                reference_number="GRV-2026-0941",
                category="Sanction mismatch",
                description=(
                    "PMFBY compensation for Kharif 2026 unseasonal rainfall was sanctioned at ₹8,000 instead of the "
                    "policy entitlement of ₹12,000. Requesting review of Block Agriculture Officer loss assessment report."
                ),
                status="Under review",
                officer_resolution="Dossier forwarded to AIC Claims Desk for recalculation against final CCE report.",
                resolution_date="Pending",
            ),
            Grievance(
                id="grv-2",
                farmer_id=farmer_profile.id,
                scheme_id="kcc",
                reference_number="GRV-2026-0812",
                category="Delayed credit limit revision",
                description="Submitted land revenue receipt on 29 Oct 2026. Branch has not updated the seasonal drawing limit.",
                status="Resolved",
                officer_resolution="Contacted Bank Manager at CRGB Arang. Limit renewal cleared in system.",
                resolution_date="19 Nov 2026",
            ),
        ]
        session.add_all(grievances_data)
        await session.flush()

        # 10. Notifications
        notifications_data = [
            Notification(
                user_id=farmer_user.id,
                title="PM-KISAN Installment Credited",
                message="₹2,000 credited to your Aadhaar-seeded bank account for August-November 2026 cycle.",
                notification_type="success",
                is_read=False,
            ),
            Notification(
                user_id=farmer_user.id,
                title="Integrity Alert: PMFBY Sanction Difference",
                message="KrishiSetu detected a ₹4,000 variance between expected policy claim and sanction order.",
                notification_type="warning",
                is_read=False,
            ),
            Notification(
                user_id=farmer_user.id,
                title="KCC Document Verification Required",
                message="Chhattisgarh Rajya Gramin Bank requested updated Rin Pustika copy for your credit limit.",
                notification_type="alert",
                is_read=True,
            ),
            Notification(
                user_id=officer_user.id,
                title="Pending Cultivator Verification: Khamtarai",
                message="Farmer Ramesh Kumar submitted a Sharecropper declaration requiring RAEO sign-off.",
                notification_type="info",
                is_read=False,
            ),
        ]
        session.add_all(notifications_data)
        await session.flush()

        # 11. Initial Audit Trail
        audit_data = [
            AuditLog(
                user_id=officer_user.id,
                user_name="Anita Verma",
                role="officer",
                action="INVESTIGATE_DISCREPANCY",
                target_resource="Discrepancy",
                target_id="alert-1",
                details="Opened integrity audit for PMFBY ₹4,000 sanction variance on farmer KS-CG-10482.",
            ),
            AuditLog(
                user_id=admin_user.id,
                user_name="Platform Administrator",
                role="admin",
                action="UPDATE_POLICY_VERSION",
                target_resource="Scheme",
                target_id="rgkny",
                details="Published revised RGKNY 2026-v3.0 policy adding Minor Millets input bonus.",
            ),
        ]
        session.add_all(audit_data)
        await session.commit()
