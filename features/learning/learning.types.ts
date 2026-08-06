export interface LearningItem {
  title: string;
  // ⚠️ Confirmed live 2026-07-24: at least one real item returned the LITERAL STRING "null" here
  // (four characters, not a JSON null) when the model wouldn't vouch for a link. `Boolean("null")`
  // is true, so a naive `item.url ? <a> : ...` truthy check renders a broken `href="null"` link —
  // exactly the failure mode this field exists to prevent. Always go through hasRealUrl() below,
  // never a bare truthy check.
  url: string | null;
  // Admin-configurable, computed at read time from a matching template in /admin/affiliate-links
  // (features/admin) — separate from `url` (the AI's own guess) and never overwrites it; render
  // both as distinct links when present, don't merge them. null when no template is configured
  // for this item's resourceType (confirmed live: real, not an error state). Subject to the same
  // literal-"null"-string quirk as `url` — always go through hasRealUrl(), never a bare check.
  affiliateUrl: string | null;
  estHours: number;
  priority: "required" | "preferred";
  gapReason: string;
  // ⚠️ Confirmed live 2026-08-03 (verifying affiliateUrl against a real roadmap): a real item had
  // resourceType "project" — missing from this union before now, so `resourceIcons[item.resourceType]`
  // in learning-card.tsx would have returned undefined and crashed rendering `<Icon />` on this
  // exact live workspace. Fixed alongside affiliateUrl since it's the same file/finding. `string`
  // fallback (not a closed union) since the admin affiliate-links resourceType set additionally
  // has "other" with no live-confirmed roadmap item to match it — don't guess it's impossible.
  resourceType: "course" | "book" | "documentation" | "article" | "video" | "project" | string;
}
export interface LearningRoadmap {
  id: string;
  workspaceId: string;
  runId: string;
  items: LearningItem[];
  createdAt: string;
}

export const hasRealUrl = (url: string | null): url is string => !!url && url.trim() !== "" && url.trim().toLowerCase() !== "null";
