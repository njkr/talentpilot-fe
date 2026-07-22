import { create } from "zustand";
import type { User } from "@/lib/api/types";

interface AuthState {
  user: User | null;
  accessToken: string | null; // IN MEMORY ONLY — never localStorage (XSS steals localStorage)
  status: "loading" | "authed" | "anon";
  setSession: (token: string, user: User) => void;
  clear: () => void;
}

// Why in-memory, not persisted: the access token is short-lived and re-obtainable via the
// httpOnly refresh cookie on any reload (bootstrap logic lands in Sprint 1). Persisting it to
// localStorage would let any XSS steal a working credential. The refresh cookie is httpOnly —
// JS can't read it — which is the whole security point.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "loading",
  setSession: (accessToken, user) => set({ accessToken, user, status: "authed" }),
  clear: () => set({ accessToken: null, user: null, status: "anon" }),
}));
