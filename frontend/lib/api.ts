import type {
  ApiStatus,
  FarmerQueryRequest,
  FarmerQueryResponse,
  RAGStatusResponse,
  SchemesListResponse,
  VoiceCall,
  VoiceEscalation,
  VoiceServiceStatus,
} from "@/types/api";

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

export async function queryPolicyRAG(
  payload: FarmerQueryRequest,
  signal?: AbortSignal,
): Promise<FarmerQueryResponse> {
  let response: Response;

  const normalizedPayload = {
    ...payload,
    language: payload.language === "hne" ? "chg" : payload.language,
  };

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/rag/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedPayload),
      cache: "no-store",
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new Error(
      `Unable to reach KrishiSetu AI backend at ${API_BASE_URL}. Please confirm the server is running on port 8000.`,
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`KrishiSetu AI query failed (HTTP ${response.status}): ${errorBody}`);
  }

  return (await response.json()) as FarmerQueryResponse;
}

export async function getIndexedSchemes(
  signal?: AbortSignal,
): Promise<SchemesListResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/rag/schemes`, {
      cache: "no-store",
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new Error(`Could not connect to schemes index at ${API_BASE_URL}.`);
  }

  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status} while fetching schemes.`);
  }

  return (await response.json()) as SchemesListResponse;
}

export async function getRAGStatus(
  signal?: AbortSignal,
): Promise<RAGStatusResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/rag/status`, {
      cache: "no-store",
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new Error(`Could not connect to RAG status endpoint at ${API_BASE_URL}.`);
  }

  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status}.`);
  }

  return (await response.json()) as RAGStatusResponse;
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

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new Error(
      `Could not connect to KrishiSetu backend at ${API_BASE_URL}. Please ensure the server is running on port 8000.`
    );
  }

  let result: Record<string, unknown> | null = null;
  try {
    result = (await response.json()) as Record<string, unknown>;
  } catch {
    // Non-JSON response
  }

  if (!response.ok || (result && result.success === false)) {
    let errorMessage = `The KrishiSetu request failed (HTTP ${response.status}).`;
    if (result) {
      if (typeof result.detail === "string") {
        errorMessage = result.detail;
      } else if (Array.isArray(result.detail) && result.detail.length > 0) {
        const first = result.detail[0] as Record<string, unknown> | undefined;
        errorMessage = String(first?.msg || first?.message || JSON.stringify(first));
      } else if (typeof result.message === "string") {
        errorMessage = result.message;
      }
    }
    throw new Error(errorMessage);
  }

  return (result?.data !== undefined ? result.data : result) as T;
}

export const authApi = {
  getDemoStatus: () =>
    apiRequest<{ demoLoginEnabled: boolean }>("/auth/demo-status"),
  sendOtp: (mobileNumber: string) =>
    apiRequest<{ expiresInSeconds: number; demoOtp: string }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobileNumber }),
    }),
  verifyOtp: (mobileNumber: string, otp: string, role?: string) =>
    apiRequest<{ accessToken: string; user: { id: string; role: string; full_name?: string } }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ mobileNumber, otp, role }),
    }),
  loginWithPassword: (identifier: string, password: string) =>
    apiRequest<{
      accessToken: string;
      user: { id: string; role: string; full_name?: string };
      farmer?: Record<string, unknown>;
      government?: Record<string, unknown>;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),
  demoLogin: (accountOrRole: string) =>
    apiRequest<{
      accessToken: string;
      user: { id: string; role: string; full_name?: string };
      farmer?: Record<string, unknown>;
      government?: Record<string, unknown>;
      isDemo: boolean;
    }>("/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({
        account: ["farmer1", "farmer2", "farmer3", "officer", "admin"].includes(accountOrRole)
          ? accountOrRole
          : undefined,
        role: ["farmer", "officer", "admin"].includes(accountOrRole)
          ? accountOrRole
          : undefined,
      }),
    }),
  logout: () =>
    apiRequest<{ loggedOut: boolean }>("/auth/logout", {
      method: "POST",
    }),
  me: () =>
    apiRequest<{ user: Record<string, unknown>; farmer?: Record<string, unknown>; government?: Record<string, unknown> }>("/auth/me"),
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
    password?: string;
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

export interface FarmerDashboardData {
  user?: {
    id: string;
    full_name: string;
    mobile_number: string;
    role: string;
  };
  farmer?: {
    farmer_id: string;
    district: string;
    village: string;
    state: string;
    block?: string;
    pincode?: string;
    cultivator_status: string;
    cultivated_area: number;
    crops: string;
    profile_completion: number;
    farmer_category: string;
  };
  financialOverview?: {
    potentialBenefits: number;
    sanctionedAmount: number;
    receivedAmount: number;
    applications: number;
    pendingActions: number;
  };
  benefits?: Array<Record<string, unknown>>;
  applications?: Array<Record<string, unknown>>;
  discrepancies?: Array<Record<string, unknown>>;
  notifications?: Array<Record<string, unknown>>;
  recommendedSchemes?: Array<Record<string, unknown>>;
  nextBestActions?: Array<{
    title: string;
    action: string;
    link: string;
    priority: string;
  }>;
  recommendations?: {
    government_schemes: Array<Record<string, unknown>>;
    private_products: Array<Record<string, unknown>>;
    loan_recommendations: Array<Record<string, unknown>>;
    next_best_actions: Array<Record<string, unknown>>;
    summary: Record<string, unknown>;
  };
  isDemo?: boolean;
}

export const farmersApi = {
  dashboard: () => apiRequest<FarmerDashboardData>("/farmers/me/dashboard"),
  me: () => apiRequest<{ user: Record<string, unknown>; farmer: Record<string, unknown> }>("/farmers/me"),
  recommendations: () =>
    apiRequest<{
      government_schemes: Array<Record<string, unknown>>;
      private_products: Array<Record<string, unknown>>;
      loan_recommendations: Array<Record<string, unknown>>;
      next_best_actions: Array<Record<string, unknown>>;
      summary: Record<string, unknown>;
    }>("/farmers/me/recommendations"),
  update: (payload: Record<string, unknown>) =>
    apiRequest<{ user: Record<string, unknown>; farmer: Record<string, unknown> }>("/farmers/me", {
      method: "PATCH",
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
  benefit_description?: string;
  eligibility_summary?: string;
  policy_version?: string;
  official_url?: string;
  image_url?: string;
  source_license?: string;
  requiredDocuments?: string[];
  status?: string;
  last_updated?: string;
}

export interface PrivateSchemeItem {
  id: string;
  name: string;
  lender: string;
  category: string;
  benefit_text: string;
  image_url: string;
  logo_url?: string;
  source_url: string;
  last_verified: string;
  is_active?: number;
  source_license?: string;
}

export const privateSchemesApi = {
  list: () => apiRequest<PrivateSchemeItem[]>("/private-schemes"),
};

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
  history: () => apiRequest<Record<string, unknown>[]>("/calculator/history"),
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
  results: () => apiRequest<Record<string, unknown>[]>("/eligibility/results"),
  get: (resultId: string) => apiRequest<Record<string, unknown>>(`/eligibility/results/${resultId}`),
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
  get: (id: string) => apiRequest<{ benefit: BenefitRecord; discrepancies: Record<string, unknown>[] }>(`/benefits/${id}`),
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
    apiRequest<{ application: ApplicationRecord; history: Record<string, unknown>[] }>(`/applications/${applicationId}`),
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
    apiRequest<{ grievance: GrievanceRecord; history: Record<string, unknown>[] }>(`/grievances/${grievanceId}`),
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
  farmers: () => apiRequest<Record<string, unknown>[]>("/officer/farmers"),
  farmerDetail: (farmerId: string) => apiRequest<Record<string, unknown>>(`/officer/farmers/${farmerId}`),
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
  discrepancies: () => apiRequest<Record<string, unknown>[]>("/officer/discrepancies"),
  resolveDiscrepancy: (alertId: string, payload: { status: string; remarks?: string }) =>
    apiRequest<{ id: string; status: string }>(`/officer/discrepancies/${alertId}/resolve`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const voiceApi = {
  status: () => apiRequest<VoiceServiceStatus>("/voice/status"),
  calls: () => apiRequest<VoiceCall[]>("/voice/calls"),
  myEscalations: () => apiRequest<VoiceEscalation[]>("/voice/my-escalations"),
  officerEscalations: () => apiRequest<VoiceEscalation[]>("/voice/officer/escalations"),
  updateEscalation: (id: string, status: "pending" | "assigned" | "contacted" | "closed") =>
    apiRequest<{ id: string; status: string }>(`/voice/officer/escalations/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
};

export const adminApi = {
  dashboard: () =>
    apiRequest<{
      totalUsers: number;
      totalFarmers: number;
      activeSchemes: number;
      openDiscrepancies: number;
      policyVersions: number;
      isDemo: boolean;
    }>("/admin/dashboard"),
  users: () =>
    apiRequest<
      Array<{
        id: string;
        mobile_number: string;
        full_name: string;
        email?: string;
        role: string;
        is_active: number;
        created_at: string;
      }>
    >("/admin/users"),
  provisionUser: (payload: {
    fullName: string;
    email: string;
    mobileNumber: string;
    role: string;
    password: string;
    department?: string;
    designation?: string;
    state?: string;
    district?: string;
    block?: string;
    employeeReference?: string;
  }) =>
    apiRequest<{
      id: string;
      mobile_number: string;
      full_name: string;
      email?: string;
      role: string;
      is_active: number;
    }>("/admin/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateRole: (userId: string, role: string) =>
    apiRequest<{ id: string; role: string }>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  toggleStatus: (userId: string, isActive: boolean) =>
    apiRequest<{ id: string; is_active: number }>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),
  schemes: () => apiRequest<SchemeItem[]>("/admin/schemes"),
  createScheme: (payload: {
    name: string;
    department: string;
    category: string;
    state?: string;
    description: string;
    policyVersion: string;
  }) =>
    apiRequest<{ id: string }>("/admin/schemes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  auditLogs: () => apiRequest<Array<Record<string, unknown>>>("/admin/audit-logs"),
};

export interface AssistantResponse {
  text: string;
  spokenText: string;
  intent: "navigation" | "personalized_info" | "action" | "explanation" | "clarification";
  action: string;
  navigation?: {
    targetRoute: string;
    description: string;
  };
  data?: Record<string, unknown>;
  cards?: Array<Record<string, unknown>>;
  applicationChannel?: {
    id?: string;
    name: string;
    provider?: string;
    category?: string;
    interest_rate?: string;
    limit_summary?: string;
    official_url?: string;
    application_channel: string;
    online_portal?: string;
    required_documents?: string[];
    application_steps?: string[];
  };
  followUpSuggestions?: string[];
  sessionId: string;
  language: string;
}

export const assistantApi = {
  sendCommand: (payload: {
    message: string;
    sessionId?: string;
    currentRoute?: string;
    language?: string;
  }) =>
    apiRequest<AssistantResponse>("/assistant/command", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getRegistry: () =>
    apiRequest<{
      registry: Record<string, Record<string, unknown>>;
      totalCommands: number;
      supportedLanguages: string[];
    }>("/assistant/registry"),
};
