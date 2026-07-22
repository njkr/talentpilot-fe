import { HomeIcon, DocumentTextIcon, BriefcaseIcon, RectangleStackIcon, CreditCardIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

// One place defines the nav. Add a route here -> it appears in the sidebar. No duplication.
export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/resumes", label: "Resumes", icon: DocumentTextIcon },
  { href: "/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/workspaces", label: "Workspaces", icon: RectangleStackIcon },
  { href: "/billing", label: "Billing", icon: CreditCardIcon },
  { href: "/settings", label: "Settings", icon: Cog6ToothIcon },
] as const;
