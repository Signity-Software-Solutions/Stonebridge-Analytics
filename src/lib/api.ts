/**
 * Typed client for the Stonebridge API (the FastAPI service in /backend).
 *
 * The screens still render from the typed fixtures in this folder; nothing
 * calls this module yet. It is the one place that knows where the backend
 * lives and how its errors look, so a screen can adopt an endpoint later with
 * a single import.
 *
 * NEXT_PUBLIC_API_BASE_URL is inlined by Next.js at build time, so changing it
 * for a deployed site means rebuilding the frontend.
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const API_PREFIX = "/api/v1";

/* Response shapes, mirroring backend/app/schemas. */

export interface HealthStatus {
  status: "ok";
}

export interface ServiceMeta {
  name: string;
  version: string;
  environment: string;
}

export interface GuardMatch {
  term: string;
  category: string;
}

export interface GuardResult {
  allowed: boolean;
  matches: GuardMatch[];
  refusal: { title: string; body: string } | null;
}

export interface PolicyCategory {
  category: string;
  label: string;
  description: string;
}

export interface AskPolicy {
  protected: PolicyCategory[];
}

interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    request_id?: string;
    details?: { field: string; message: string }[];
  };
}

/** Thrown for every failed call. status 0 means the API could not be reached. */
export class ApiError extends Error {
  status: number;
  code: string;
  requestId?: string;
  details?: { field: string; message: string }[];

  constructor(
    status: number,
    code: string,
    message: string,
    requestId?: string,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string>) },
    });
  } catch {
    throw new ApiError(0, "network_error", "Could not reach the Stonebridge API.");
  }

  if (!res.ok) {
    let envelope: ErrorEnvelope | undefined;
    try {
      envelope = (await res.json()) as ErrorEnvelope;
    } catch {
      /* the body was not the expected envelope */
    }
    const e = envelope?.error;
    throw new ApiError(
      res.status,
      e?.code ?? "http_error",
      e?.message ?? `Request failed with status ${res.status}.`,
      e?.request_id,
      e?.details,
    );
  }
  return (await res.json()) as T;
}

export const api = {
  health: () => request<HealthStatus>("/health"),
  meta: () => request<ServiceMeta>(`${API_PREFIX}/meta`),
  /** Server-side access check for a question. */
  checkQuestion: (question: string) =>
    request<GuardResult>(`${API_PREFIX}/ask/guard`, {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
  askPolicy: () => request<AskPolicy>(`${API_PREFIX}/ask/policy`),
};
