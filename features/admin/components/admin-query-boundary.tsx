import { Card } from "@/components/ui/card";
import { H3, Body } from "@/components/ui/typography";
import { ApiError } from "@/lib/api/error";

// The double-gate made visible: a role-admin user NOT on the email allowlist gets a 403 from
// EVERY admin query. Keyed on HTTP status, not error.code, as a deliberate exception to CLAUDE.md's
// usual "switch on code" rule — confirmed live 2026-07-25 this endpoint reuses the generic
// INTERNAL_ERROR code for the rejection (the Postman collection's saved example claims FORBIDDEN
// instead; live wins), so status is the only reliable signal here.
export function AdminQueryBoundary({ error, children }: { error: unknown; children: React.ReactNode }) {
  if (error instanceof ApiError && error.status === 403) {
    return (
      <Card className="border-danger/30">
        <H3 className="text-danger">Access denied</H3>
        <Body className="mt-1">Your account has the admin role but isn&apos;t on the operator allowlist. Ask an existing operator to add your email to ADMIN_ALLOWED_EMAILS.</Body>
      </Card>
    );
  }
  return <>{children}</>;
}
