import { api } from "@/lib/api/client";
import type { Profile, ProfileUpdate } from "./profile.types";

export const profileApi = {
  get: () => api.get<Profile>("/profiles/me"),
  update: (body: ProfileUpdate) => api.put<Profile>("/profiles/me", body),
};
