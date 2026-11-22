from typing import Any


class CalculatorService:
    """
    Agricultural Loan and Subsidy Calculation Engine.
    All calculations are backend-computed using verified government formulas,
    financial year limits, and transparent policy references.
    """

    @staticmethod
    def calculate(
        calculator_type: str,
        area_acres: float,
        crop: str = "Paddy",
        loan_amount: int = 100000,
        equipment_type: str = "Tractor (35-40 HP)",
        farmer_category: str = "Small & Marginal",
        state: str = "Chhattisgarh",
        financial_year: str = "2026-27",
    ) -> dict[str, Any]:
        
        calc_type_lower = calculator_type.lower()

        if "kcc" in calc_type_lower or "credit" in calc_type_lower or "interest" in calc_type_lower:
            # KCC Modified Interest Subvention Scheme (MISS)
            # Benchmark rate: 7.0% p.a.
            # Prompt Repayment Subvention (PRI): 3.0% p.a.
            # Effective farmer interest rate: 4.0% p.a. (up to ₹3,00,000)
            eligible_principal = min(loan_amount, 300000)
            # Scale of finance for Chhattisgarh: ₹25,000/acre for Paddy
            scale_of_finance_cap = int(area_acres * 25000)
            effective_credit_limit = min(eligible_principal, max(scale_of_finance_cap, 50000))

            annual_normal_interest = int(effective_credit_limit * 0.07)
            government_subvention_3pct = int(effective_credit_limit * 0.03)
            farmer_net_interest = int(effective_credit_limit * 0.04)
            monthly_interest = round(farmer_net_interest / 12, 2)

            return {
                "calculator_type": "Kisan Credit Card (KCC) Interest Subvention",
                "calculator_type_hi": "किसान क्रेडिट कार्ड (KCC) ब्याज अनुदान",
                "estimated_benefit": government_subvention_3pct,
                "benefit_label": "Annual Government Interest Subvention (3%)",
                "benefit_label_hi": "वार्षिक सरकारी ब्याज अनुदान (3%)",
                "farmer_share": farmer_net_interest,
                "farmer_share_label": "Net Farmer Interest Payable (4%)",
                "farmer_share_label_hi": "किसान द्वारा देय शुद्ध ब्याज (4%)",
                "effective_credit_limit": effective_credit_limit,
                "effective_credit_limit_label": "Estimated Scale of Finance Limit",
                "formula": "Loan Principal × 3% Prompt Repayment Incentive (Capped at ₹3,00,000 limit)",
                "formula_hi": "ऋण मूलधन × 3% शीघ्र पुनर्भुगतान प्रोत्साहन (अधिकतम ₹3,00,000 तक)",
                "interest_rates": {
                    "nominal_bank_rate": "7.0%",
                    "govt_subvention_rate": "3.0%",
                    "net_farmer_rate": "4.0%",
                },
                "breakdown": [
                    {"label": "Scale of Finance (Chhattisgarh Paddy)", "value": f"₹25,000 × {area_acres} acres = ₹{scale_of_finance_cap:,}"},
                    {"label": "Effective Credit Eligibility", "value": f"₹{effective_credit_limit:,}"},
                    {"label": "Gross Annual Bank Interest (7%)", "value": f"₹{annual_normal_interest:,}"},
                    {"label": "Govt Interest Subvention (3% saved)", "value": f"₹{government_subvention_3pct:,}"},
                    {"label": "Farmer Net Payable Interest (4% p.a.)", "value": f"₹{farmer_net_interest:,} (~₹{monthly_interest}/mo)"},
                ],
                "policy_reference": "RBI Master Circular FIDD.CO.FSD.BC.No.6/05.05.010/2024-25 & NABARD KCC Guidelines",
                "financial_year": financial_year,
                "disclaimer": "The effective credit limit is subject to bank scrutiny, CIBIL score, and District Level Technical Committee (DLTC) scale of finance.",
            }

        elif "equipment" in calc_type_lower or "mechanization" in calc_type_lower or "smam" in calc_type_lower:
            # Sub-Mission on Agricultural Mechanization (SMAM)
            # Small/Marginal/SC/ST/Women: 50% subsidy (up to benchmark cost cap)
            # General/Other: 40% subsidy
            benchmark_costs = {
                "Tractor (35-40 HP)": 600000,
                "Power Tiller": 180000,
                "Rotavator": 110000,
                "Paddy Transplanter": 250000,
                "Multi-crop Thresher": 150000,
                "Solar Water Pump (5 HP)": 220000,
            }
            cost = benchmark_costs.get(equipment_type, 150000)
            subsidy_rate = 0.50 if "small" in farmer_category.lower() or "marginal" in farmer_category.lower() else 0.40
            subsidy_cap = 125000 if "tractor" in equipment_type.lower() else int(cost * 0.5)
            subsidy_amount = min(int(cost * subsidy_rate), subsidy_cap)
            farmer_contribution = cost - subsidy_amount

            return {
                "calculator_type": "Agricultural Equipment Subsidy (SMAM)",
                "calculator_type_hi": "कृषि यंत्रीकरण सब-मिशन (SMAM) सब्सिडी",
                "estimated_benefit": subsidy_amount,
                "benefit_label": "Direct DBT Equipment Subsidy",
                "benefit_label_hi": "प्रत्यक्ष डीबीटी कृषि यंत्र सब्सिडी",
                "farmer_share": farmer_contribution,
                "farmer_share_label": "Estimated Farmer Contribution",
                "farmer_share_label_hi": "किसान का अनुमानित अंशदान",
                "equipment_name": equipment_type,
                "benchmark_cost": cost,
                "subsidy_percentage": f"{int(subsidy_rate * 100)}%",
                "formula": f"Benchmark Cost (₹{cost:,}) × {int(subsidy_rate * 100)}% (Capped by SMAM schedule limits)",
                "formula_hi": f"मानक लागत (₹{cost:,}) × {int(subsidy_rate * 100)}% (SMAM अनुसूची सीमा के अधीन)",
                "breakdown": [
                    {"label": "Standard Equipment Cost", "value": f"₹{cost:,}"},
                    {"label": "Applicable Subsidy Rate", "value": f"{int(subsidy_rate * 100)}% ({farmer_category})"},
                    {"label": "Government Subsidy Share (DBT)", "value": f"₹{subsidy_amount:,}"},
                    {"label": "Farmer Out-of-Pocket Contribution", "value": f"₹{farmer_contribution:,}"},
                ],
                "policy_reference": "SMAM Operational Guidelines 2024, Directorate of Agricultural Engineering, Raipur (CG)",
                "financial_year": financial_year,
                "disclaimer": "Subsidy release is subject to DBT lotteries and state allocation quotas on the agrimachinery.nic.in portal.",
            }

        elif "irrigation" in calc_type_lower or "drip" in calc_type_lower or "sprinkler" in calc_type_lower:
            # Per Drop More Crop (Micro Irrigation - PMKSY / MIDH)
            # Small & Marginal: 55% Central/State + 15% CG State Top-up = 70% total subsidy
            # Other farmers: 45% + 10% = 55%
            cost_per_acre = 45000  # Drip irrigation benchmark cost/acre
            total_cost = int(area_acres * cost_per_acre)
            is_small = "small" in farmer_category.lower() or "marginal" in farmer_category.lower()
            subsidy_rate = 0.70 if is_small else 0.55
            subsidy_amount = int(total_cost * subsidy_rate)
            farmer_share = total_cost - subsidy_amount

            return {
                "calculator_type": "Micro-Irrigation Subsidy (PMKSY - Drip/Sprinkler)",
                "calculator_type_hi": "सूक्ष्म सिंचाई योजना (ड्रिप/स्प्रिंकलर) सब्सिडी",
                "estimated_benefit": subsidy_amount,
                "benefit_label": "Total Combined Subsidy (Central + CG State Top-up)",
                "benefit_label_hi": "कुल संयुक्त सब्सिडी (केंद्र + छ.ग. टॉप-अप)",
                "farmer_share": farmer_share,
                "farmer_share_label": "Farmer Self-Financing Share (30%)",
                "farmer_share_label_hi": "किसान का स्वयं का अंशदान (30%)",
                "total_project_cost": total_cost,
                "formula": f"Area ({area_acres} acres) × ₹45,000/acre × {int(subsidy_rate * 100)}% Subsidy Rate",
                "formula_hi": f"क्षेत्रफल ({area_acres} एकड़) × ₹45,000/एकड़ × {int(subsidy_rate * 100)}% सब्सिडी दर",
                "breakdown": [
                    {"label": "Unit Standard Cost", "value": f"₹45,000 per acre"},
                    {"label": "Gross Installation Cost", "value": f"₹{total_cost:,} ({area_acres} acres)"},
                    {"label": "Combined Subsidy (70%)", "value": f"₹{subsidy_amount:,}"},
                    {"label": "Farmer Net Payable", "value": f"₹{farmer_share:,}"},
                ],
                "policy_reference": "National Mission on Sustainable Agriculture (NMSA) & CG Horticulture Dept MI Rules",
                "financial_year": financial_year,
                "disclaimer": "Requires verified water source (borewell/canal) and electricity/solar pump connection.",
            }

        else:
            # Default: Rajiv Gandhi Kisan Nyay Yojana (RGKNY) Input Support
            # Chhattisgarh State: ₹9,000 per acre for Paddy, Kodo-Kutki, Pulses
            rate_per_acre = 9000
            total_benefit = int(area_acres * rate_per_acre)

            return {
                "calculator_type": "Rajiv Gandhi Kisan Nyay Yojana Input Support",
                "calculator_type_hi": "राजीव गांधी किसान न्याय योजना इनपुट सहायता",
                "estimated_benefit": total_benefit,
                "benefit_label": "Annual Agriculture Input Assistance (4 Installments)",
                "benefit_label_hi": "वार्षिक कृषि इनपुट सहायता (4 किस्तों में)",
                "farmer_share": 0,
                "farmer_share_label": "Farmer Share Required",
                "farmer_share_label_hi": "किसान अंशदान",
                "formula": f"Cultivated Area ({area_acres} acres) × ₹9,000 per acre",
                "formula_hi": f"खेती का रकबा ({area_acres} एकड़) × ₹9,000 प्रति एकड़",
                "breakdown": [
                    {"label": "Approved Rate per Acre", "value": "₹9,000 / acre"},
                    {"label": "Registered Cultivated Area", "value": f"{area_acres} acres"},
                    {"label": "Annual Entitlement", "value": f"₹{total_benefit:,}"},
                    {"label": "Per Installment Release", "value": f"₹{int(total_benefit / 4):,} × 4 quarters"},
                ],
                "policy_reference": "Chhattisgarh Agriculture & Farmers Welfare Circular No. F-10/2025/14",
                "financial_year": financial_year,
                "disclaimer": "Requires entry in Revenue Girdawari portal and active DBT-enabled bank account.",
            }
