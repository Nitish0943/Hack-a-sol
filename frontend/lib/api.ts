import type {
  ApiStatus,
  FarmerQueryRequest,
  FarmerQueryResponse,
  RAGStatusResponse,
  SchemesListResponse,
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

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/rag/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
