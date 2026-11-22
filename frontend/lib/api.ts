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
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const result = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !result.success) {
    throw new Error(result.message || "The KrishiSetu request failed.");
  }
  return result.data;
}

export const authApi = {
  demoLogin: (role: "farmer" | "officer" | "admin") =>
    apiRequest<{ accessToken: string; user: { role: string }; isDemo: true }>("/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ role }),
    }),
  sendOtp: (mobileNumber: string) =>
    apiRequest<{ expiresInSeconds: number; demoOtp: string }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobileNumber }),
    }),
  verifyOtp: (mobileNumber: string, otp: string, role: string) =>
    apiRequest<{ accessToken: string; user: { role: string } }>("/auth/verify-otp", {
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