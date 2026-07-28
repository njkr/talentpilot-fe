import {
  HomeIcon,
  ChartBarIcon,
  QueueListIcon,
  CommandLineIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  TicketIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export const adminNavItems = [
  { href: "/admin", label: "Overview", icon: HomeIcon },
  { href: "/admin/costs", label: "Costs", icon: ChartBarIcon },
  { href: "/admin/queues", label: "Dead-letter queue", icon: QueueListIcon },
  { href: "/admin/prompts", label: "Prompts", icon: CommandLineIcon },
  { href: "/admin/audit", label: "Audit log", icon: ClipboardDocumentListIcon },
  { href: "/admin/plans", label: "Plans", icon: CurrencyDollarIcon },
  { href: "/admin/credit-packs", label: "Credit packs", icon: TicketIcon },
  { href: "/admin/payment-config", label: "Payment config", icon: AdjustmentsHorizontalIcon },
  { href: "/admin/referrals", label: "Referrals", icon: UserGroupIcon },
] as const;
