export type ApiStatus = {
  status: string;
  application: string;
  version: string;
  environment: string;
};

export type Citation = {
  document_title: string;
  scheme_name: string;
  issuing_department: string;
  page_reference: string;
  page_start?: number | null;
  page_end?: number | null;
  source_url: string;
  publication_date?: string | null;
  effective_date?: string | null;
  verification_status?: string;
  relevance_rank?: number;
};

export type FarmerQueryRequest = {
  question: string;
  language?: "auto" | "en" | "hi" | "chg" | string;
  state?: string | null;
  scheme_name?: string | null;
  response_style?: "detailed" | "ivr";
};

export type FarmerQueryResponse = {
  answer: string;
  ivr_summary?: string | null;
  language: string;
  scheme_name?: string | null;
  answer_status: "answered" | "abstained" | "conflict_detected" | "error" | string;
  evidence_status: string;
  citations: Citation[];
  important_conditions: string[];
  verification_required: boolean;
  limitations: string[];
  eligibility_disclaimer: string;
};

export type IndexedScheme = {
  scheme_name: string;
  government_level: string;
  applicable_state: string;
  document_title: string;
  source_url: string;
};

export type SchemesListResponse = {
  total_schemes: number;
  schemes: IndexedScheme[];
};

export type RAGStatusResponse = {
  status: string;
  service: string;
  indexed_documents: number;
  llm_provider: string;
  supported_languages: string[];
};
