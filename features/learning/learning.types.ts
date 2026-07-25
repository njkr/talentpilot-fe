export interface LearningItem {
  title: string;
  // ⚠️ Confirmed live 2026-07-24: at least one real item returned the LITERAL STRING "null" here
  // (four characters, not a JSON null) when the model wouldn't vouch for a link. `Boolean("null")`
  // is true, so a naive `item.url ? <a> : ...` truthy check renders a broken `href="null"` link —
  // exactly the failure mode this field exists to prevent. Always go through hasRealUrl() below,
  // never a bare truthy check.
  url: string | null;
  estHours: number;
  priority: "required" | "preferred";
  gapReason: string;
  resourceType: "course" | "book" | "documentation" | "article" | "video";
}
export interface LearningRoadmap {
  id: string;
  workspaceId: string;
  runId: string;
  items: LearningItem[];
  createdAt: string;
}

export const hasRealUrl = (url: string | null): url is string => !!url && url.trim() !== "" && url.trim().toLowerCase() !== "null";
