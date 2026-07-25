// Real shape confirmed live + Postman, matching the doc exactly. No field distinguishes which
// entry is the CURRENT device — don't try to guess/highlight one, there's no real signal for it.
export interface Session {
  familyId: string;
  createdAt: string;
  ip: string;
  userAgent: string;
}
