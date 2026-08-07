import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { ApiError } from "./error";
import type { ApiSuccess, ApiFailure } from "./types";

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// This client is browser-only in intent (useAuthStore, cookie-based refresh), but the module can
// still get bundled into a shared server chunk and evaluated during SSR/build page-data
// collection, even though nothing server-side ever calls `api`. NEXT_PUBLIC_API_URL can now be a
// relative path (the same-origin proxy rewrite in next.config.ts), which only resolves against a
// real browser location — axios's Node-side URL handling has no implicit origin, so a bare
// relative baseURL throws at construction time there (confirmed live on Vercel: "Invalid URL",
// input "/api/v1"). Give it a harmless absolute placeholder when evaluated outside a browser; the
// real relative value is only ever used for actual requests, which only happen client-side.
const envApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const baseURL = typeof window === "undefined" && envApiUrl.startsWith("/") ? `http://localhost${envApiUrl}` : envApiUrl;

const raw = axios.create({
  baseURL,
  withCredentials: true, // sends the httpOnly refresh cookie
  headers: { "Content-Type": "application/json" },
});

// attach the access token from the store
raw.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// dedupe concurrent 401s into ONE refresh call
let refreshing: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  try {
    // bypass the wrapper (no interceptor recursion). Refresh reads the cookie, returns a new token.
    const res = await raw.post<ApiSuccess<{ accessToken: string; user: import("./types").User }>>("/auth/refresh");
    const { accessToken, user } = res.data.data;
    useAuthStore.getState().setSession(accessToken, user);
  } catch (err) {
    useAuthStore.getState().clear();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw err;
  }
}

// response interceptor: normalize errors + handle token lifecycle
raw.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiFailure>) => {
    const original = error.config as RetriableConfig | undefined;
    const body = error.response?.data;
    const code = body?.error?.code;
    const status = error.response?.status ?? 0;

    // TOKEN_EXPIRED → refresh once, dedupe, retry the original request
    if (code === "TOKEN_EXPIRED" && original && !original._retried) {
      original._retried = true;
      refreshing ??= doRefresh().finally(() => {
        refreshing = null;
      });
      await refreshing;
      return raw(original); // replay with the new token (request interceptor re-attaches it)
    }

    // TOKEN_SUPERSEDED = the two-tab refresh race. NOT theft, NOT logout — retry once silently.
    if (code === "TOKEN_SUPERSEDED" && original && !original._retried) {
      original._retried = true;
      return raw(original);
    }

    // hard-invalid → clear and bounce to login, but only for a request that actually carried a
    // bearer token. The session bootstrap's initial /auth/refresh call (Sprint 1) has none — a
    // first-time anonymous visitor with no refresh cookie can plausibly get this same code back,
    // and redirecting then would hard-reload whatever public page they're already on, in a loop.
    const hadAuthHeader = Boolean(original?.headers?.Authorization);
    if ((code === "TOKEN_INVALID" || code === "TOKEN_REUSE_DETECTED") && hadAuthHeader) {
      useAuthStore.getState().clear();
      if (typeof window !== "undefined") window.location.href = "/login";
    }

    // normalize EVERYTHING into an ApiError so callers have one type to catch
    throw new ApiError(
      code ?? "UNKNOWN",
      body?.error?.message ?? error.message ?? "Request failed",
      status,
      body?.error?.details,
      body?.error?.fields,
      body?.meta?.requestId,
    );
  },
);

// the typed wrapper every feature uses: unwraps `data`, or throws ApiError
export const api = {
  get: <T>(url: string, params?: object) => raw.get<ApiSuccess<T>>(url, { params }).then((r) => r.data.data),
  // FormData bodies (file uploads) must NOT carry the instance's default JSON Content-Type — the
  // browser needs to set multipart/form-data itself, boundary and all. Passing Content-Type:
  // 'multipart/form-data' explicitly (without a boundary) breaks the upload server-side; the fix
  // is to unset the header for this one request so the browser fills it in.
  post: <T>(url: string, body?: unknown, headers?: object) =>
    raw
      .post<ApiSuccess<T>>(url, body, {
        headers: body instanceof FormData ? { ...headers, "Content-Type": undefined } : headers,
      })
      .then((r) => r.data.data),
  patch: <T>(url: string, body?: unknown) => raw.patch<ApiSuccess<T>>(url, body).then((r) => r.data.data),
  put: <T>(url: string, body?: unknown) => raw.put<ApiSuccess<T>>(url, body).then((r) => r.data.data),
  del: <T>(url: string) => raw.delete<ApiSuccess<T>>(url).then((r) => r.data.data),

  // list helper — returns data + pagination meta together (the wrapper above drops meta)
  list: <T>(url: string, params?: object) =>
    raw.get<ApiSuccess<T>>(url, { params }).then((r) => ({
      data: r.data.data,
      nextCursor: r.data.meta.nextCursor,
      hasMore: r.data.meta.hasMore,
    })),

  // for endpoints needing an Idempotency-Key (analyze, checkout)
  postIdempotent: <T>(url: string, body: unknown, key: string) =>
    raw.post<ApiSuccess<T>>(url, body, { headers: { "Idempotency-Key": key } }).then((r) => r.data.data),
};
