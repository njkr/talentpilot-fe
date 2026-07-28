import { HomeIcon, ChartBarIcon, QueueListIcon, CommandLineIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

export const adminNavItems = [
  { href: "/admin", label: "Overview", icon: HomeIcon },
  { href: "/admin/costs", label: "Costs", icon: ChartBarIcon },
  { href: "/admin/queues", label: "Dead-letter queue", icon: QueueListIcon },
  { href: "/admin/prompts", label: "Prompts", icon: CommandLineIcon },
  { href: "/admin/audit", label: "Audit log", icon: ClipboardDocumentListIcon },
] as const;
