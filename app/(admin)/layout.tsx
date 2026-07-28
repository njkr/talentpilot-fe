import type { Metadata } from "next";
import { AdminGuard } from "@/features/admin/components/admin-guard";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminTopbar } from "@/features/admin/components/admin-topbar";

export const metadata: Metadata = { title: { template: "%s · Admin", default: "Admin" } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-bg">
        <AdminSidebar />
        <div className="lg:pl-52">
          <AdminTopbar />
          <main className="mx-auto max-w-7xl p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
