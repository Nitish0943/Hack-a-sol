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