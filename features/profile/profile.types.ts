// Real shape confirmed live + Postman, matching the doc exactly. GET never 404s — a user who
// never saved gets this all-null shell with completeness: 0.
export interface Profile {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  yearsExperience: number | null;
  targetRole: string | null;
  salaryExpectation: number | null;
  salaryCurrency: string | null;
  completeness: number; // 0-100
}

// PUT body: an upsert of individual fields — an omitted field is left untouched, not cleared.
export type ProfileUpdate = Partial<Omit<Profile, "completeness">>;
