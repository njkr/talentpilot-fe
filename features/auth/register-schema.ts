import { z } from "zod";

// Mirrors the backend policy (>=8 chars, a letter AND a number) so client errors match server
// errors. Shared by the standalone register page and the onboarding wizard's register step so the
// two can never drift.
export const registerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/\d/, "Include a number"),
});

export type RegisterForm = z.infer<typeof registerSchema>;
