// EVERY 2xx response
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    nextCursor?: string | null;
    hasMore?: boolean;
  };
}

// EVERY error response
export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    fields?: Record<string, string[]>;
  };
  meta: { requestId: string; timestamp: string };
}

// Domain types — mirror the SHAPES captured in docs/API-Full-Documentation.txt exactly.
// Grow this file per sprint as more endpoints are consumed. Never add a field the doc doesn't show.
export interface User {
  id: string;
  email: string;
  isVerified: boolean;
  role: "user" | "admin";
  createdAt: string;
}
