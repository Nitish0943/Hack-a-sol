import type { ApiStatus } from "@/types/api";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);

export async function getStatus(signal?: AbortSignal): Promise<ApiStatus> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/status`, {
      cache: "no-store",
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new Error(`Could not connect to the backend at ${API_BASE_URL}.`);
  }

  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status}.`);
  }

  return (await response.json()) as ApiStatus;
}

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: unknown;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("krishisetu_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  let result: any = null;
  try {
    result = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok || (result && result.success === false)) {
    let errorMessage = "The KrishiSetu request failed.";
    if (result) {
      if (typeof result.detail === "string") {
        errorMessage = result.detail;
      } else if (Array.isArray(result.detail) && result.detail.length > 0) {
        const first = result.detail[0];
        errorMessage = first?.msg || first?.message || JSON.stringify(first);
      } else if (typeof result.message === "string") {
        errorMessage = result.message;
      }
    }
    throw new Error(errorMessage);
  }

  return (result?.data !== undefined ? result.data : result) as T;
}

export const authApi = {
  sendOtp: (mobileNumber: string) =>
    apiRequest<{ expiresInSeconds: number; demoOtp: string }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobileNumber }),
    }),
  verifyOtp: (mobileNumber: string, otp: string, role: string) =>
    apiRequest<{ accessToken: string; user: { role: string; full_name?: string } }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ mobileNumber, otp, role }),
    }),
  register: (payload: {
    mobileNumber: string;
    otp: string;
    fullName: string;
    preferredLanguage: string;
    state: string;
    district: string;
    block: string;
    village: string;
    pincode?: string;
    farmerCategory: string;
    cultivatorStatus: string;
    landholdingArea: number;
  }) =>
    apiRequest<{
      accessToken: string;
      user: { id: string; role: string };
      farmer: { farmer_id: string };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export interface SchemeItem {
  id: string;
  name: string;
  department: string;
  category: string;
  state?: string;
  description: string;
  benefit_type?: string;
  benefit_details?: string;
  policy_version?: string;
  official_url?: string;
  requiredDocuments?: string[];
  status?: string;
  last_updated?: string;
}

export const schemesApi = {
  list: (params?: { search?: string; category?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.category) q.set("category", params.category);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiRequest<SchemeItem[]>(`/schemes${qs ? `?${qs}` : ""}`);
  },
  categories: () => apiRequest<string[]>("/schemes/categories"),
  get: (id: string) => apiRequest<SchemeItem>(`/schemes/${id}`),
};

export interface LoanCalcResult {
  principalAmount: number;
  annualInterestRate: number;
  applicableSubventionRate: number;
  estimatedInterest: number;
  estimatedTotalRepayment: number;
  assumptions: string[];
  isOfficialQuote: boolean;
  isDemo: boolean;
}

export interface SubsidyCalcResult {
  eligibleCost: number;
  subsidyPercentage: number;
  maximumSubsidy: number;
  estimatedBenefit: number;
  farmerContribution: number;
  assumptions: string[];
  isOfficialQuote: boolean;
  isDemo: boolean;
}

export const calculatorApi = {
  calculateLoan: (payload: {
    principalAmount: number;
    annualInterestRate: number;
    applicableSubventionRate: number;
    tenureMonths: number;
  }) =>
    apiRequest<LoanCalcResult>("/calculator/loan", {
      method: "POST",
      body: JSON.stringify({ ...payload, calculationType: "simple_interest" }),
    }),
  calculateSubsidy: (payload: {
    eligibleCost: number;
    subsidyPercentage: number;
    maximumSubsidy: number;
  }) =>
    apiRequest<SubsidyCalcResult>("/calculator/subsidy", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  history: () => apiRequest<any[]>("/calculator/history"),
};

export interface EligibilityResult {
  resultId: string;
  eligibilityStatus: "eligible" | "potentially_eligible" | "needs_information" | "not_eligible";
  estimatedBenefit: number | null;
  passedRules: Array<{ rule: string; passed: boolean; explanation: string }>;
  failedRules: Array<{ rule: string; passed: boolean; explanation: string }>;
  missingInformation: string[];
  policyVersion: string;
  isOfficialApproval: boolean;
  isDemo: boolean;
}

export const eligibilityApi = {
  check: (schemeId: string, farmerInputs?: Record<string, unknown>) =>
    apiRequest<EligibilityResult>("/eligibility/check", {
      method: "POST",
      body: JSON.stringify({ schemeId, farmerInputs }),
    }),
  results: () => apiRequest<any[]>("/eligibility/results"),
  get: (resultId: string) => apiRequest<any>(`/eligibility/results/${resultId}`),
};

export interface BenefitSummary {
  potentialAmount: number;
  appliedAmount: number;
  approvedAmount: number;
  sanctionedAmount: number;
  disbursedAmount: number;
  receivedAmount: number;
  pendingAmount: number;
  currency: string;
  verificationStatus: string;
  isDemo: boolean;
}

export interface BenefitRecord {
  id: string;
  farmer_id: string;
  scheme_id: string;
  scheme_name?: string;
  category?: string;
  expected_amount: number;
  applied_amount: number;
  approved_amount: number;
  sanctioned_amount: number;
  disbursed_amount: number;
  received_amount: number;
  status: string;
  updated_at?: string;
}

export const benefitsApi = {
  summary: () => apiRequest<BenefitSummary>("/benefits/summary"),
  list: () => apiRequest<BenefitRecord[]>("/benefits"),
  get: (id: string) => apiRequest<{ benefit: BenefitRecord; discrepancies: any[] }>(`/benefits/${id}`),
};

export interface ApplicationRecord {
  id: string;
  application_number: string;
  farmer_id: string;
  farmer_name?: string;
  scheme_id: string;
  scheme_name?: string;
  status: string;
  submitted_at?: string;
  updated_at?: string;
  remarks?: string;
}

export const applicationsApi = {
  list: () => apiRequest<ApplicationRecord[]>("/applications"),
  create: (payload: { schemeId: string; applicationNumber?: string; remarks?: string }) =>
    apiRequest<{ id: string; applicationNumber: string; status: string; isDemo: boolean }>("/applications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  submit: (applicationId: string) =>
    apiRequest<{ id: string; status: string }>(`/applications/${applicationId}/submit`, {
      method: "POST",
    }),
  get: (applicationId: string) =>
    apiRequest<{ application: ApplicationRecord; history: any[] }>(`/applications/${applicationId}`),
};

export interface GrievanceRecord {
  id: string;
  grievance_number: string;
  farmer_id: string;
  farmer_name?: string;
  scheme_id?: string;
  scheme_name?: string;
  application_id?: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  resolution_note?: string;
  created_at?: string;
  updated_at?: string;
}

export const grievancesApi = {
  list: () => apiRequest<GrievanceRecord[]>("/grievances"),
  create: (payload: {
    category: string;
    subject: string;
    description: string;
    schemeId?: string;
    applicationId?: string;
  }) =>
    apiRequest<{ id: string; grievanceNumber: string; status: string; isDemo: boolean }>("/grievances", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  get: (grievanceId: string) =>
    apiRequest<{ grievance: GrievanceRecord; history: any[] }>(`/grievances/${grievanceId}`),
};

export const officerApi = {
  dashboard: () =>
    apiRequest<{
      totalFarmers: number;
      totalApplications: number;
      pendingReviews: number;
      openDiscrepancies: number;
      openGrievances: number;
      pendingVerifications: number;
      isDemo: boolean;
    }>("/officer/dashboard"),
  farmers: () => apiRequest<any[]>("/officer/farmers"),
  farmerDetail: (farmerId: string) => apiRequest<any>(`/officer/farmers/${farmerId}`),
  applications: () => apiRequest<ApplicationRecord[]>("/officer/applications"),
  reviewApplication: (applicationId: string, payload: { status: string; remarks?: string }) =>
    apiRequest<{ id: string; status: string }>(`/officer/applications/${applicationId}/review`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  grievances: () => apiRequest<GrievanceRecord[]>("/officer/grievances"),
  updateGrievance: (grievanceId: string, payload: { status: string; remarks?: string }) =>
    apiRequest<{ id: string; status: string }>(`/officer/grievances/${grievanceId}/update-status`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  discrepancies: () => apiRequest<any[]>("/officer/discrepancies"),
  resolveDiscrepancy: (alertId: string, payload: { status: string; remarks?: string }) =>
    apiRequest<{ id: string; status: string }>(`/officer/discrepancies/${alertId}/resolve`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
