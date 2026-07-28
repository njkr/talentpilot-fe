import { api } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

// Response shapes copied from the API doc's captured responses (§2.2-2.4).
interface SessionResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  // referralCode confirmed live (2026-07-26): accepted by /auth/register, associates the new
  // account with the referrer immediately (visible in GET /admin/referrals right after register,
  // status "signed_up" before the referee even verifies their email).
  register: (body: { email: string; password: string; referralCode?: string }) => api.post<User>("/auth/register", body),

  verifyEmail: (body: { email: string; code: string }) => api.post<SessionResponse>("/auth/verify-email", body),

  resendOtp: (body: { email: string }) => api.post<void>("/auth/resend-otp", body),

  login: (body: { email: string; password: string }) => api.post<SessionResponse>("/auth/login", body),

  logout: () => api.post<void>("/auth/logout"),

  forgotPassword: (body: { email: string }) => api.post<void>("/auth/forgot-password", body),

  resetPassword: (body: { token: string; password: string }) => api.post<void>("/auth/reset-password", body),

  me: () => api.get<User>("/users/me"),
};
