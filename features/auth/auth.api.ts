import { api } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

// Response shapes copied from the API doc's captured responses (§2.2-2.4).
interface SessionResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  register: (body: { email: string; password: string }) => api.post<User>("/auth/register", body),

  verifyEmail: (body: { email: string; code: string }) => api.post<SessionResponse>("/auth/verify-email", body),

  resendOtp: (body: { email: string }) => api.post<void>("/auth/resend-otp", body),

  login: (body: { email: string; password: string }) => api.post<SessionResponse>("/auth/login", body),

  logout: () => api.post<void>("/auth/logout"),

  forgotPassword: (body: { email: string }) => api.post<void>("/auth/forgot-password", body),

  resetPassword: (body: { token: string; password: string }) => api.post<void>("/auth/reset-password", body),

  me: () => api.get<User>("/users/me"),
};
