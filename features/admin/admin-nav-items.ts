import {
  HomeIcon,
  ChartBarIcon,
  PuzzlePieceIcon,
  QueueListIcon,
  CommandLineIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  TicketIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  UsersIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

export const adminNavItems = [
  { href: "/admin", label: "Overview", icon: HomeIcon },
  { href: "/admin/costs", label: "Costs", icon: ChartBarIcon },
  { href: "/admin/integrations", label: "Integrations", icon: PuzzlePieceIcon },
  { href: "/admin/queues", label: "Dead-letter queue", icon: QueueListIcon },
  { href: "/admin/prompts", label: "Prompts", icon: CommandLineIcon },
  { href: "/admin/audit", label: "Audit log", icon: ClipboardDocumentListIcon },
  { href: "/admin/plans", label: "Plans", icon: CurrencyDollarIcon },
  { href: "/admin/credit-packs", label: "Credit packs", icon: TicketIcon },
  { href: "/admin/payment-config", label: "Payment config", icon: AdjustmentsHorizontalIcon },
  { href: "/admin/referrals", label: "Referrals", icon: UserGroupIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/affiliate-links", label: "Affiliate links", icon: LinkIcon },
] as const;
