const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function fetchWithFallback<T>(url: string, options: RequestInit = {}, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`API returned ${res.status} for ${url}, using demonstration fallback.`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`Could not reach backend at ${API_BASE_URL}${url}, using demonstration fallback.`, err);
    return fallback;
  }
}

// 1. Status
export async function getStatus(signal?: AbortSignal) {
  return fetchWithFallback(
    "/api/v1/status",
    { signal },
    { status: "ok", application: "KrishiSetu API", version: "1.0.0", environment: "development" }
  );
}

// 2. Schemes
export async function getSchemes(category?: string, state?: string, search?: string) {
  const params = new URLSearchParams();
  if (category && category !== "All") params.append("category", category);
  if (state && state !== "All") params.append("state", state);
  if (search) params.append("search", search);
  const q = params.toString() ? `?${params.toString()}` : "";
  return fetchWithFallback(`/api/v1/schemes${q}`, {}, [
    {
      id: "pm-kisan",
      code: "PM-KISAN",
      name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
      name_hi: "पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)",
      department: "Ministry of Agriculture & Farmers Welfare, GoI",
      category: "Income support",
      benefit_type: "Direct Benefit Transfer",
      benefit_summary: "₹6,000 per year in 3 equal four-monthly installments",
      benefit_summary_hi: "प्रति वर्ष ₹6,000 (₹2,000 की 3 समान किस्तों में)",
      description: "Central sector scheme to augment income of all landholding farmer families across India.",
      description_hi: "सभी भू-धारक किसान परिवारों की आय बढ़ाने के लिए केंद्रीय क्षेत्र की योजना।",
      eligibility_criteria_json: '["Landholding title in revenue records", "Aadhaar-seeded bank account"]',
      required_documents_json: '["Aadhaar Card", "Land Record (Khatauni/B1)", "Bank Passbook"]',
      official_url: "https://pmkisan.gov.in",
      source_url: "https://agricoop.nic.in/en/PM-Kisan",
      policy_version: "2026-v2.1",
      financial_year: "2026-27",
      state: "All-India",
      last_verified: "20 Nov 2026",
      is_active: true,
    },
    {
      id: "kcc",
      code: "KCC",
      name: "Kisan Credit Card (Modified Interest Subvention)",
      name_hi: "किसान क्रेडिट कार्ड (ब्याज अनुदान योजना)",
      department: "Department of Agriculture / RBI / NABARD",
      category: "Agricultural credit",
      benefit_type: "Subsidized Institutional Credit",
      benefit_summary: "Short-term crop credit up to ₹3,00,000 at 4% net interest rate",
      benefit_summary_hi: "₹3,00,000 तक का फसली ऋण 4% शुद्ध ब्याज दर पर",
      description: "Subsidized institutional short-term credit with 3% prompt repayment subvention.",
      description_hi: "फसल उत्पादन के लिए सुलभ संस्थागत ऋण। 3% त्वरित पुनर्भुगतान अनुदान।",
      eligibility_criteria_json: '["All farmers: landowners, tenants, sharecroppers"]',
      required_documents_json: '["Simplified KCC Form", "Aadhaar Card", "Land Records / Tenant Certificate"]',
      official_url: "https://www.myscheme.gov.in/schemes/kcc",
      source_url: "https://www.nabard.org",
      policy_version: "2026-v1.4",
      financial_year: "2026-27",
      state: "All-India",
      last_verified: "15 Nov 2026",
      is_active: true,
    },
    {
      id: "rgkny",
      code: "RGKNY",
      name: "Rajiv Gandhi Kisan Nyay Yojana (Chhattisgarh)",
      name_hi: "राजीव गांधी किसान न्याय योजना (छत्तीसगढ़)",
      department: "Dept of Agriculture & Farmers Welfare, Chhattisgarh",
      category: "Income support",
      benefit_type: "Input Assistance",
      benefit_summary: "₹9,000 per acre annual input subsidy for Paddy, Millets, and Pulses",
      benefit_summary_hi: "धान, कोदो-कुटकी, रागी हेतु ₹9,000 प्रति एकड़ वार्षिक इनपुट सहायता",
      description: "Direct input support for registered cultivators and sharecroppers in Chhattisgarh.",
      description_hi: "पंजीकृत किसानों एवं बटाईदारों को ₹9,000 प्रति एकड़ इनपुट सहायता।",
      eligibility_criteria_json: '["Resident of Chhattisgarh", "Entry in Girdawari portal"]',
      required_documents_json: '["Bhuiyan B1 copy", "Girdawari receipt", "Aadhaar Passbook"]',
      official_url: "https://kisan.cg.nic.in",
      source_url: "https://agriportal.cg.nic.in",
      policy_version: "2026-v3.0",
      financial_year: "2026-27",
      state: "Chhattisgarh",
      last_verified: "16 Nov 2026",
      is_active: true,
    },
    {
      id: "pmfby",
      code: "PMFBY",
      name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      name_hi: "प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)",
      department: "Ministry of Agriculture & Farmers Welfare / AIC",
      category: "Crop insurance",
      benefit_type: "Risk-based Premium Subsidy",
      benefit_summary: "Comprehensive yield cover with farmer premium capped at 1.5% - 2%",
      benefit_summary_hi: "अधिकतम 1.5% - 2% प्रीमियम पर व्यापक फसल सुरक्षा",
      description: "Financial support against natural calamities including flood, drought, and pests.",
      description_hi: "प्राकृतिक आपदाओं से फसल क्षति होने पर व्यापक बीमा सुरक्षा।",
      eligibility_criteria_json: '["Notified crop in notified insurance unit"]',
      required_documents_json: '["Land record / Tenant proof", "Crop Sowing certificate"]',
      official_url: "https://pmfby.gov.in",
      source_url: "https://agri-insurance.gov.in",
      policy_version: "2026-v2.0",
      financial_year: "2026-27",
      state: "All-India",
      last_verified: "18 Nov 2026",
      is_active: true,
    },
  ]);
}

export async function getScheme(id: string) {
  const schemes = await getSchemes();
  const matched = schemes.find((s: any) => s.id === id);
  return fetchWithFallback(`/api/v1/schemes/${id}`, {}, matched || schemes[0]);
}

// 3. Eligibility Engine
export async function checkEligibility(schemeId: string, farmerId?: number) {
  return fetchWithFallback(
    "/api/v1/eligibility/check",
    {
      method: "POST",
      body: JSON.stringify({ scheme_id: schemeId, farmer_id: farmerId }),
    },
    {
      status: "POTENTIALLY_ELIGIBLE",
      scheme_id: schemeId,
      scheme_name: schemeId === "pm-kisan" ? "PM-KISAN" : "Kisan Credit Card",
      scheme_name_hi: schemeId === "pm-kisan" ? "पीएम-किसान" : "किसान क्रेडिट कार्ड",
      policy_version: "2026-v2.1",
      passed_conditions: [
        {
          rule_type: "location",
          description: "Resident farmer located in configured State (Chhattisgarh).",
          description_hi: "छत्तीसगढ़ राज्य में स्थित पंजीकृत किसान।",
          clause: "Operational Guidelines Para 1.0",
        },
        {
          rule_type: "landholding",
          description: "Registered landholding of 2.0 acres satisfies cultivable area requirements.",
          description_hi: "2.0 एकड़ कृषि भूमि पात्रता मानकों को पूरा करती है।",
          clause: "Operational Guidelines Para 2.1",
        },
        {
          rule_type: "cultivator_status",
          description: "Cultivator classification matches scheme entitlement parameters.",
          description_hi: "काश्तकार वर्गीकरण योजना के नियमों के अनुकूल है।",
          clause: "Revenue Records B1 Guidelines",
        },
      ],
      failed_conditions: [],
      unknown_conditions: [],
      missing_documents: ["Land revenue tax receipt for current Kharif cycle"],
      recommended_action: "You satisfy all preliminary criteria. You may proceed to submit your formal application.",
      recommended_action_hi: "आप सभी प्रारंभिक शर्तों को पूरा करते हैं। आप आवेदन प्रस्तुत कर सकते हैं।",
    }
  );
}

// 4. Benefit Calculator
export async function calculateBenefit(payload: any) {
  return fetchWithFallback(
    "/api/v1/calculator/calculate",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    {
      calculator_type: "Kisan Credit Card (KCC) Interest Subvention",
      calculator_type_hi: "किसान क्रेडिट कार्ड (KCC) ब्याज अनुदान",
      estimated_benefit: 1500,
      benefit_label: "Annual Government Interest Subvention (3%)",
      benefit_label_hi: "वार्षिक सरकारी ब्याज अनुदान (3%)",
      farmer_share: 2000,
      farmer_share_label: "Net Farmer Interest Payable (4%)",
      farmer_share_label_hi: "किसान द्वारा देय शुद्ध ब्याज (4%)",
      formula: "Loan Principal × 3% Prompt Repayment Incentive (Capped at ₹3,00,000 limit)",
      formula_hi: "ऋण मूलधन × 3% शीघ्र पुनर्भुगतान प्रोत्साहन (अधिकतम ₹3,00,000 तक)",
      breakdown: [
        { label: "Effective Credit Limit", value: "₹50,000" },
        { label: "Bank Standard Rate (7%)", value: "₹3,500" },
        { label: "Govt Subvention (3% saved)", value: "₹1,500" },
        { label: "Farmer Net Interest (4%)", value: "₹2,000 (~₹167/mo)" },
      ],
      policy_reference: "RBI Master Circular FIDD.CO.FSD.BC.No.6/2024-25 & NABARD KCC Guidelines",
      financial_year: "2026-27",
      disclaimer: "Subject to branch sanction, CIBIL score, and District Level Technical Committee scales.",
    }
  );
}

// 5. Benefits & Ledger
export async function getBenefits(status?: string) {
  const q = status && status !== "All" ? `?status=${status}` : "";
  return fetchWithFallback(`/api/v1/benefits${q}`, {}, [
    {
      id: "benefit-1",
      farmer_id: 1,
      scheme_id: "pm-kisan",
      scheme_name: "PM-KISAN Income Support",
      scheme_category: "Income support",
      status: "RECEIVED",
      estimated_amount: 6000,
      applied_amount: 6000,
      approved_amount: 6000,
      sanctioned_amount: 6000,
      disbursed_amount: 6000,
      received_amount: 6000,
      financial_year: "2026-27",
      installment_info: "Installment 16 (Aug-Nov 2026)",
      last_action_date: "15 Nov 2026",
    },
    {
      id: "benefit-2",
      farmer_id: 1,
      scheme_id: "pmfby",
      scheme_name: "PM Fasal Bima Yojana",
      scheme_category: "Crop insurance",
      status: "APPROVED",
      estimated_amount: 12000,
      applied_amount: 12000,
      approved_amount: 12000,
      sanctioned_amount: 8000,
      disbursed_amount: 0,
      received_amount: 0,
      financial_year: "2026-27",
      installment_info: "Kharif 2026 Mid-Season Claim",
      last_action_date: "18 Nov 2026",
    },
    {
      id: "benefit-3",
      farmer_id: 1,
      scheme_id: "kcc",
      scheme_name: "Kisan Credit Card",
      scheme_category: "Agricultural credit",
      status: "SANCTIONED",
      estimated_amount: 24500,
      applied_amount: 24500,
      approved_amount: 24500,
      sanctioned_amount: 18000,
      disbursed_amount: 18000,
      received_amount: 18000,
      financial_year: "2026-27",
      installment_info: "Crop Loan Limit (Kharif)",
      last_action_date: "20 Nov 2026",
    },
    {
      id: "benefit-4",
      farmer_id: 1,
      scheme_id: "rgkny",
      scheme_name: "Rajiv Gandhi Kisan Nyay Yojana",
      scheme_category: "Income support",
      status: "POTENTIAL",
      estimated_amount: 18000,
      applied_amount: 0,
      approved_amount: 0,
      sanctioned_amount: 0,
      disbursed_amount: 0,
      received_amount: 0,
      financial_year: "2026-27",
      installment_info: "Awaiting Girdawari Registration",
      last_action_date: "22 Nov 2026",
    },
  ]);
}

export async function getBenefitSummary() {
  return fetchWithFallback("/api/v1/benefits/summary", {}, {
    total_potential: 42500,
    total_applied: 36500,
    total_approved: 30000,
    total_sanctioned: 26000,
    total_disbursed: 24000,
    total_received: 18000,
    active_schemes_count: 4,
    pending_actions_count: 3,
  });
}

// 6. Applications
export async function getApplications(status?: string) {
  const q = status && status !== "All" ? `?status=${status}` : "";
  return fetchWithFallback(`/api/v1/applications${q}`, {}, [
    {
      id: "app-1",
      farmer_id: 1,
      scheme_id: "pm-kisan",
      scheme_name: "PM-KISAN",
      reference_number: "KS-2026-10482",
      submission_date: "12 Nov 2026",
      status: "Approved",
      channel: "Self Portal / CSC",
      rejection_reason: "",
      pending_action: "",
      timeline_json: JSON.stringify([
        { date: "12 Nov 2026", title: "Application Submitted", detail: "Online dossier received." },
        { date: "13 Nov 2026", title: "Revenue Records Verified", detail: "Patwari verified B1." },
        { date: "15 Nov 2026", title: "Benefit Sanctioned", detail: "₹2,000 installment released." },
      ]),
      remarks: "All revenue validation cleared.",
    },
    {
      id: "app-2",
      farmer_id: 1,
      scheme_id: "pmfby",
      scheme_name: "PM Fasal Bima Yojana",
      reference_number: "CG-PMFBY-8821",
      submission_date: "08 Nov 2026",
      status: "Under review",
      channel: "Primary Agricultural Cooperative Society (PACS)",
      rejection_reason: "",
      pending_action: "Joint crop survey report pending",
      timeline_json: JSON.stringify([
        { date: "08 Nov 2026", title: "Claim Intimated", detail: "Rainfall damage intimation." },
        { date: "18 Nov 2026", title: "Partial Sanction Issued", detail: "Sanction order issued (Mismatch flagged)." },
      ]),
      remarks: "Awaiting joint field survey report.",
    },
    {
      id: "app-3",
      farmer_id: 1,
      scheme_id: "kcc",
      scheme_name: "Kisan Credit Card",
      reference_number: "KCC-77421",
      submission_date: "29 Oct 2026",
      status: "Documents required",
      channel: "Chhattisgarh Rajya Gramin Bank",
      rejection_reason: "",
      pending_action: "Upload updated Rin Pustika copy",
      timeline_json: JSON.stringify([
        { date: "29 Oct 2026", title: "Renewal Form Submitted", detail: "Limit renewal requested." },
        { date: "12 Nov 2026", title: "Document Notice", detail: "Rin Pustika required." },
      ]),
      remarks: "Bank requested updated revenue receipt.",
    },
  ]);
}

export async function createApplication(data: any) {
  return fetchWithFallback(
    "/api/v1/applications",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    {
      id: `app-${Date.now()}`,
      farmer_id: 1,
      scheme_id: data.scheme_id,
      scheme_name: "Government Scheme",
      reference_number: data.reference_number,
      submission_date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Under review",
      channel: data.channel || "Self Portal",
      rejection_reason: "",
      pending_action: "",
      timeline_json: "[]",
      remarks: data.remarks || "",
    }
  );
}

// 7. Grievances
export async function getGrievances(status?: string) {
  const q = status && status !== "All" ? `?status=${status}` : "";
  return fetchWithFallback(`/api/v1/grievances${q}`, {}, [
    {
      id: "grv-1",
      farmer_id: 1,
      scheme_id: "pmfby",
      scheme_name: "PM Fasal Bima Yojana",
      reference_number: "GRV-2026-0941",
      category: "Sanction mismatch",
      description: "PMFBY compensation sanctioned at ₹8,000 instead of policy entitlement of ₹12,000.",
      status: "Under review",
      officer_resolution: "Forwarded to AIC Claims Desk for recalculation against final CCE sheet.",
      resolution_date: "Pending",
      created_at: "18 Nov 2026",
    },
    {
      id: "grv-2",
      farmer_id: 1,
      scheme_id: "kcc",
      scheme_name: "Kisan Credit Card",
      reference_number: "GRV-2026-0812",
      category: "Delayed credit limit revision",
      description: "Submitted land revenue receipt on 29 Oct 2026. Limit renewal pending.",
      status: "Resolved",
      officer_resolution: "Contacted Bank Manager at CRGB Arang. Limit renewal cleared.",
      resolution_date: "19 Nov 2026",
      created_at: "10 Nov 2026",
    },
  ]);
}

export async function createGrievance(data: any) {
  return fetchWithFallback(
    "/api/v1/grievances",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    {
      id: `grv-${Date.now()}`,
      farmer_id: 1,
      scheme_id: data.scheme_id,
      scheme_name: "Scheme Record",
      reference_number: `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: data.category,
      description: data.description,
      status: "Under review",
      officer_resolution: "Automated ticket registered. Dossier queued for Agriculture Officer review.",
      resolution_date: "Pending",
      created_at: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    }
  );
}

// 8. Discrepancies
export async function getDiscrepancies(status?: string) {
  const q = status && status !== "All" ? `?status=${status}` : "";
  return fetchWithFallback(`/api/v1/discrepancies${q}`, {}, [
    {
      id: "alert-1",
      farmer_id: 1,
      farmer_name: "Ramesh Kumar",
      farmer_id_code: "KS-CG-10482",
      scheme_id: "pmfby",
      scheme_name: "PM Fasal Bima Yojana",
      benefit_id: "benefit-2",
      alert_type: "Sanction Amount Mismatch",
      severity: "High",
      expected_amount: 12000,
      actual_amount: 8000,
      difference: 4000,
      explanation: "Expected crop loss compensation of ₹12,000 based on notified 60% threshold yield loss, but issued sanction order shows ₹8,000.",
      policy_clause: "PMFBY Revised Guidelines Para 13.4",
      policy_version: "2026-v2.0",
      status: "Pending",
      officer_notes: "Officer investigation pending. Awaiting AIC surveyor CCE data.",
    },
    {
      id: "alert-2",
      farmer_id: 1,
      farmer_name: "Ramesh Kumar",
      farmer_id_code: "KS-CG-10482",
      scheme_id: "kcc",
      scheme_name: "Kisan Credit Card",
      benefit_id: "benefit-3",
      alert_type: "Scale of Finance Under-Allocation",
      severity: "Medium",
      expected_amount: 24500,
      actual_amount: 18000,
      difference: 6500,
      explanation: "DLTC scale of finance prescribes ₹25,000/acre for paddy. For 2 acres, entitled limit is ₹50,000, but approved drawing limit is capped at ₹18,000.",
      policy_clause: "DLTC Raipur Scale of Finance Notification 2026-27",
      policy_version: "2026-v1.4",
      status: "Pending",
      officer_notes: "Awaiting branch explanation for reduced drawing limit.",
    },
  ]);
}

export async function reviewDiscrepancy(alertId: string, status: string, notes: string) {
  return fetchWithFallback(`/api/v1/discrepancies/${alertId}`, {
    method: "PUT",
    body: JSON.stringify({ status, officer_notes: notes }),
  }, { id: alertId, status, officer_notes: notes });
}

// 9. Cultivator Verifications
export async function getVerifications(status?: string) {
  const q = status && status !== "All" ? `?status=${status}` : "";
  return fetchWithFallback(`/api/v1/verifications${q}`, {}, [
    {
      id: "ver-1",
      farmer_id: 1,
      farmer_name: "Ramesh Kumar",
      farmer_id_code: "KS-CG-10482",
      village: "Khamtarai",
      cultivator_type: "Sharecropper",
      declaration_text: "I am actively cultivating 1.5 acres of Khasra No. 142/2 in village Khamtarai under 50:50 crop-sharing arrangement.",
      evidence_document_name: "Gram_Panchayat_Batai_Declaration_2026.pdf",
      status: "Pending",
      officer_notes: "Scheduled for field inspection by Rural Agriculture Extension Officer.",
      verified_at: "",
    },
  ]);
}

export async function submitVerification(data: any) {
  return fetchWithFallback("/api/v1/verifications", {
    method: "POST",
    body: JSON.stringify(data),
  }, {
    id: `ver-${Date.now()}`,
    farmer_id: 1,
    farmer_name: "Ramesh Kumar",
    farmer_id_code: "KS-CG-10482",
    village: "Khamtarai",
    cultivator_type: data.cultivator_type,
    declaration_text: data.declaration_text,
    evidence_document_name: data.evidence_document_name,
    status: "Pending",
    officer_notes: "Submitted for officer review.",
    verified_at: "",
  });
}

// 10. Radar & Diagnosis
export async function getRadarUpdates(schemeId?: string) {
  const q = schemeId ? `?scheme_id=${schemeId}` : "";
  return fetchWithFallback(`/api/v1/radar${q}`, {}, [
    {
      scheme_id: "pm-kisan",
      current_version: "2026-v2.1",
      previous_version: "2024-v1.8",
      effective_date: "01 Oct 2026",
      status: "Active & Enforced",
      changed_clauses: [
        {
          clause: "Para 4.2 - Land Record Seeding",
          previous_text: "Physical Khasra copy acceptable at local CSC with self-declaration.",
          current_text: "Mandatory real-time API verification against State Revenue Bhuiyan database via AgriStack Farmer ID.",
          impact: "High. Farmers with pending mutation must link digitized Bhuiyan record.",
          affected_farmers_count: 1420,
          action_required: "Complete e-KYC and digital land linking at nearest CSC.",
        },
      ],
    },
  ]);
}

export async function diagnoseBlockers(symptom?: string) {
  const q = symptom ? `?symptom=${encodeURIComponent(symptom)}` : "";
  return fetchWithFallback(`/api/v1/diagnosis${q}`, {}, [
    {
      id: "aadhaar-dbt-mapping",
      title: "Aadhaar-NPCI Bank DBT Mapping Not Active",
      title_hi: "आधार-NPCI बैंक डीबीटी मैपिंग सक्रिय नहीं है",
      symptom: "Scheme status shows 'Payment Sent via PFMS' but bank account shows zero credit.",
      primary_cause: "Bank account is not seeded with Aadhaar on NPCI mapper.",
      verification_steps: [
        "Visit bank branch and request 'NPCI DBT Seeding Form'.",
        "Dial *99*99*1# to check active bank link status.",
        "Ensure account is not dormant (>6 months inactivity).",
      ],
      official_channel: "Nearest Nationalized/Gramin Bank Branch or CSC",
      severity: "High",
    },
    {
      id: "mutation-pending",
      title: "Land Record Mutation Pending (Naam-Aantaran)",
      title_hi: "राजस्व रिकॉर्ड में नामांतरण लंबित (ब1/खतौनी)",
      symptom: "Eligibility flags 'Land title unverified' or 'Document Mismatch'.",
      primary_cause: "Ancestral land deed not updated in Chhattisgarh Bhuiyan portal.",
      verification_steps: [
        "Obtain updated Khasra/B1 copy from Lok Seva Kendra.",
        "Submit mutation request to Patwari / Tehsil Office.",
      ],
      official_channel: "Tehsildar Office or Patwari Halka / Lok Seva Kendra",
      severity: "Critical",
    },
  ]);
}

// 11. IVR DTMF Key Processor
export async function processIvrKey(key: string, language: string = "hi", phone: string = "9876543210") {
  return fetchWithFallback(
    "/api/v1/ivr/process-key",
    {
      method: "POST",
      body: JSON.stringify({ key, language, phone }),
    },
    {
      key,
      text: "कृषि सेतु में आपका स्वागत है। सरकारी योजनाओं की जानकारी के लिए 1 दबाएं। ऋण और सब्सिडी के लिए 2 दबाएं।",
      action: "PLAY_AND_WAIT",
    }
  );
}

// 12. Dashboards
export async function getFarmerDashboard() {
  return fetchWithFallback("/api/v1/dashboard/farmer", {}, {
    farmer_name: "Ramesh Kumar",
    farmer_id_code: "KS-CG-10482",
    village: "Khamtarai",
    district: "Raipur",
    profile_completion: 85,
    potential_benefits: 42500,
    applications_count: 3,
    sanctioned_amount: 24000,
    received_amount: 18000,
    pending_actions_count: 3,
    recommended_schemes: [
      { id: "pm-kisan", name: "PM-KISAN", name_hi: "पीएम-किसान", type: "Income support", status: "Potentially eligible", benefit: "₹6,000 / year", description: "Direct income support in 3 equal installments." },
      { id: "kcc", name: "Kisan Credit Card (KCC)", name_hi: "किसान क्रेडिट कार्ड", type: "Agricultural credit", status: "Potentially eligible", benefit: "Up to ₹50,000 @ 4%", description: "Subsidized short-term crop credit." },
      { id: "pm-kmy", name: "PM Kisan Maan-Dhan Yojana", name_hi: "पीएम-केएमवाई पेंशन", type: "Pension support", status: "Verification required", benefit: "₹3,00,0 / mo", description: "Old-age social security pension." },
    ],
    recent_applications: [
      { id: "app-1", scheme: "PM-KISAN", reference: "KS-2026-10482", submitted: "12 Nov 2026", status: "Approved" },
      { id: "app-2", scheme: "PM Fasal Bima Yojana", reference: "CG-PMFBY-8821", submitted: "08 Nov 2026", status: "Under review" },
      { id: "app-3", scheme: "Kisan Credit Card", reference: "KCC-77421", submitted: "29 Oct 2026", status: "Documents required" },
    ],
    recent_activities: [
      { title: "PM-KISAN Installment Confirmed", detail: "₹2,000 credited to Aadhaar-seeded bank account", date: "15 Nov 2026" },
      { title: "Integrity Discrepancy Detected", detail: "₹4,000 variance between PMFBY claim and sanction", date: "18 Nov 2026" },
      { title: "KCC Verification Pending", detail: "Updated Rin Pustika requested by branch manager", date: "20 Nov 2026" },
    ],
  });
}

export async function getOfficerDashboard() {
  return fetchWithFallback("/api/v1/dashboard/officer", {}, {
    officer_name: "Anita Verma",
    total_farmers_count: 48,
    pending_applications_count: 12,
    active_discrepancies_count: 4,
    open_grievances_count: 6,
    pending_verifications_count: 5,
    priority_alerts: [
      { id: "alert-1", title: "PMFBY Sanction Variance", detail: "Farmer Ramesh Kumar (KS-CG-10482): ₹4,000 discrepancy.", severity: "High", link: "/officer/discrepancies/alert-1" },
      { id: "ver-1", title: "Sharecropper Verification", detail: "Village Khamtarai: 1 cultivation declaration awaiting sign-off.", severity: "Medium", link: "/officer/verifications/ver-1" },
    ],
    scheme_distribution: [
      { name: "PM-KISAN", count: 28, amount: "₹1,68,000" },
      { name: "PMFBY Insurance", count: 14, amount: "₹1,12,000" },
      { name: "Kisan Credit Card", count: 19, amount: "₹4,20,000" },
      { name: "RGKNY (CG)", count: 32, amount: "₹2,88,000" },
    ],
  });
}

export async function getAdminDashboard() {
  return fetchWithFallback("/api/v1/dashboard/admin", {}, {
    total_users: 148,
    total_schemes: 7,
    active_policies: 7,
    audit_events_count: 24,
    system_health: "Operational (100% SLA)",
    recent_audit_logs: [
      { timestamp: "22 Nov 2026, 11:30 PM", user: "Anita Verma (Officer)", action: "INVESTIGATE_DISCREPANCY", resource: "Discrepancy #alert-1" },
      { timestamp: "22 Nov 2026, 09:15 PM", user: "Admin User", action: "UPDATE_POLICY_VERSION", resource: "Scheme #rgkny to 2026-v3.0" },
      { timestamp: "22 Nov 2026, 04:00 PM", user: "System Gateway", action: "HEALTH_CHECK_PASSED", resource: "FastAPI + SQLite Engine" },
    ],
  });
}

// 13. Application detail & update
export async function getApplication(id: string) {
  const apps = await getApplications();
  const matched = apps.find((a: any) => a.id === id);
  return fetchWithFallback(`/api/v1/applications/${id}`, {}, matched || apps[0]);
}

export async function updateApplicationStatus(id: string, status: string, remarks?: string) {
  return fetchWithFallback(`/api/v1/applications/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, remarks: remarks || "" }),
  }, { id, status, remarks: remarks || "" });
}

// 14. Grievance detail & resolve
export async function getGrievance(id: string) {
  const grvs = await getGrievances();
  const matched = grvs.find((g: any) => g.id === id);
  return fetchWithFallback(`/api/v1/grievances/${id}`, {}, matched || grvs[0]);
}

export async function resolveGrievance(id: string, resolution: string, status: string = "Resolved") {
  return fetchWithFallback(`/api/v1/grievances/${id}/resolve`, {
    method: "PUT",
    body: JSON.stringify({ status, officer_resolution: resolution }),
  }, { id, status, officer_resolution: resolution, resolution_date: "Today" });
}

// 15. Farmers Directory
export async function getFarmers(search?: string, village?: string) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (village && village !== "All") params.append("village", village);
  const q = params.toString() ? `?${params.toString()}` : "";
  return fetchWithFallback(`/api/v1/farmers${q}`, {}, [
    {
      id: 1,
      full_name: "Ramesh Kumar",
      full_name_hi: "रमेश कुमार",
      phone: "9876543210",
      state: "Chhattisgarh",
      district: "Raipur",
      block: "Dharsiwa",
      village: "Khamtarai",
      preferred_language: "hi",
      farmer_category: "Small and marginal",
      land_ownership: "Tenant",
      cultivator_type: "Sharecropper",
      total_landholding_acres: 2.0,
      cultivated_area_acres: 2.0,
      primary_crop: "Paddy",
      secondary_crop: "Mustard",
      farming_season: "Kharif",
      irrigation_status: "Partially irrigated",
      aadhaar_seeded: true,
      npci_mapped: true,
      e_kyc_completed: true,
      bhuiyan_linked: true,
      girdawari_enrolled: true,
      discrepancies_count: 2,
      active_schemes_count: 3,
    },
    {
      id: 2,
      full_name: "Devi Bai Patel",
      full_name_hi: "देवी बाई पटेल",
      phone: "9823456789",
      state: "Chhattisgarh",
      district: "Raipur",
      block: "Arang",
      village: "Bhatagaon",
      preferred_language: "cghi",
      farmer_category: "Marginal",
      land_ownership: "Joint owner",
      cultivator_type: "Owner cultivator",
      total_landholding_acres: 1.2,
      cultivated_area_acres: 1.2,
      primary_crop: "Paddy",
      secondary_crop: "Vegetables",
      farming_season: "Kharif",
      irrigation_status: "Rainfed",
      aadhaar_seeded: true,
      npci_mapped: false,
      e_kyc_completed: true,
      bhuiyan_linked: true,
      girdawari_enrolled: false,
      discrepancies_count: 1,
      active_schemes_count: 1,
    },
    {
      id: 3,
      full_name: "Sukhranjan Sahu",
      full_name_hi: "सुखरांजन साहू",
      phone: "9425123456",
      state: "Chhattisgarh",
      district: "Durg",
      block: "Patan",
      village: "Jamgaon",
      preferred_language: "hi",
      farmer_category: "Small and marginal",
      land_ownership: "Landowner",
      cultivator_type: "Owner cultivator",
      total_landholding_acres: 3.5,
      cultivated_area_acres: 3.5,
      primary_crop: "Soybean",
      secondary_crop: "Wheat",
      farming_season: "Rabi",
      irrigation_status: "Canal irrigated",
      aadhaar_seeded: true,
      npci_mapped: true,
      e_kyc_completed: true,
      bhuiyan_linked: true,
      girdawari_enrolled: true,
      discrepancies_count: 0,
      active_schemes_count: 4,
    },
  ]);
}

export async function getFarmer(id: number | string) {
  const farmers = await getFarmers();
  const matched = farmers.find((f: any) => String(f.id) === String(id));
  return fetchWithFallback(`/api/v1/farmers/${id}`, {}, matched || farmers[0]);
}

// 16. Verification detail & review
export async function getVerification(id: string) {
  const vers = await getVerifications();
  const matched = vers.find((v: any) => v.id === id);
  return fetchWithFallback(`/api/v1/verifications/${id}`, {}, matched || vers[0]);
}

export async function reviewVerification(id: string, status: string, notes?: string) {
  return fetchWithFallback(`/api/v1/verifications/${id}/review`, {
    method: "PUT",
    body: JSON.stringify({ status, officer_notes: notes || "" }),
  }, { id, status, officer_notes: notes || "", verified_at: new Date().toLocaleDateString("en-GB") });
}

// 17. Discrepancy detail
export async function getDiscrepancy(id: string) {
  const alerts = await getDiscrepancies();
  const matched = alerts.find((a: any) => a.id === id);
  return fetchWithFallback(`/api/v1/discrepancies/${id}`, {}, matched || alerts[0]);
}

// 18. Notifications
export async function getNotifications() {
  return fetchWithFallback("/api/v1/notifications", {}, [
    {
      id: 1,
      title: "PM-KISAN 16th Installment Credited",
      title_hi: "पीएम-किसान 16वीं किस्त जमा हुई",
      message: "₹2,000 has been credited to your Aadhaar-linked bank account (A/c ending 8812).",
      message_hi: "आपके आधार से जुड़े बैंक खाते (खाता संख्या अंतिम 8812) में ₹2,000 जमा किए गए हैं।",
      category: "Benefit Disbursal",
      is_read: false,
      action_url: "/farmer/benefits/benefit-1",
      created_at: "15 Nov 2026, 10:45 AM",
    },
    {
      id: 2,
      title: "Integrity Discrepancy Alert Flagged",
      title_hi: "पॉलिसी-टू-पेमेंट विसंगति चेतावनी",
      message: "₹4,000 variance detected on PMFBY claim sanction. Entitled: ₹12,000, Sanctioned: ₹8,000.",
      message_hi: "पीएम फसल बीमा दावा स्वीकृति में ₹4,000 का अंतर मिला। देय: ₹12,000, स्वीकृत: ₹8,000।",
      category: "Audit Alert",
      is_read: false,
      action_url: "/farmer/benefits/benefit-2",
      created_at: "18 Nov 2026, 03:20 PM",
    },
    {
      id: 3,
      title: "KCC Rin Pustika Document Required",
      title_hi: "किसान क्रेडिट कार्ड: ऋण पुस्तिका आवश्यक",
      message: "Branch Manager requires updated Land Revenue Record copy for credit limit renewal.",
      message_hi: "क्रेडिट सीमा नवीनीकरण के लिए शाखा प्रबंधक को अद्यतन राजस्व अभिलेख आवश्यक है।",
      category: "Document Notice",
      is_read: true,
      action_url: "/farmer/applications/app-3",
      created_at: "20 Nov 2026, 11:10 AM",
    },
  ]);
}

export async function markNotificationRead(id: number | string) {
  return fetchWithFallback(`/api/v1/notifications/${id}/read`, {
    method: "POST",
  }, { id, is_read: true });
}

// 19. Users and Audit Logs
export async function getUsers() {
  return fetchWithFallback("/api/v1/users", {}, [
    { id: 1, username: "ramesh.kumar", full_name: "Ramesh Kumar", role: "farmer", email: "ramesh@example.com", phone: "9876543210", is_active: true, created_at: "10 Oct 2026" },
    { id: 2, username: "anita.verma", full_name: "Anita Verma", role: "officer", email: "anita.verma@gov.in", phone: "9812345678", is_active: true, created_at: "01 Oct 2026" },
    { id: 3, username: "admin", full_name: "System Administrator", role: "admin", email: "admin@krishisetu.gov.in", phone: "9800000000", is_active: true, created_at: "01 Sep 2026" },
  ]);
}

export async function getAuditLogs() {
  return fetchWithFallback("/api/v1/audit-logs", {}, [
    { id: 1, timestamp: "22 Nov 2026, 11:30 PM", user: "anita.verma (Officer)", action: "DISCREPANCY_STATUS_UPDATE", resource: "Alert #alert-1", ip_address: "10.24.12.89", status: "Success" },
    { id: 2, timestamp: "22 Nov 2026, 09:15 PM", user: "admin (Administrator)", action: "POLICY_VERSION_UPDATE", resource: "Scheme RGKNY 2026-v3.0", ip_address: "10.24.10.12", status: "Success" },
    { id: 3, timestamp: "22 Nov 2026, 06:40 PM", user: "ramesh.kumar (Farmer)", action: "VERIFICATION_SUBMITTED", resource: "Sharecropper Declaration", ip_address: "192.168.1.104", status: "Success" },
    { id: 4, timestamp: "22 Nov 2026, 04:00 PM", user: "system (Engine)", action: "POLICY_INTEGRITY_CHECK", resource: "Evaluated 48 farmer ledgers", ip_address: "127.0.0.1", status: "Success" },
    { id: 5, timestamp: "21 Nov 2026, 02:18 PM", user: "anita.verma (Officer)", action: "CULTIVATOR_VERIFIED", resource: "Farmer Devi Bai Patel", ip_address: "10.24.12.89", status: "Success" },
  ]);
}
