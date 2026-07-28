import type { Metadata } from "next";
import { UserManagement } from "@/features/admin/components/user-management";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return <UserManagement />;
}
