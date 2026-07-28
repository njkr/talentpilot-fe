// Real shape confirmed live 2026-07-26 (GET /referrals/me) — matches the doc's guess exactly.
export interface ReferralInfo {
  code: string;
  shareUrl: string;
  rewardPerReferral: number;
  enabled: boolean;
  stats: { invited: number; qualified: number; creditsEarned: number };
}
