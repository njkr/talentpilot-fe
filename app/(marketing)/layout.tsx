import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import { MarketingHeader } from "./components/marketing-header";
import { MarketingFooter } from "./components/marketing-footer";
import { MarketingAuthRedirect } from "@/components/auth/marketing-auth-redirect";

// Defaults every marketing page inherits and overrides via its own page.tsx `metadata` export.
//
// title.absolute (not title.default) for the homepage's own title: the ROOT layout (app/layout.tsx)
// defines its own title.template ("%s · TalentPilot") for the (app)/(auth)/(admin) groups — without
// `absolute`, that root template wraps THIS layout's default too, producing a real, confirmed-live
// doubled title ("...ATS Checker · TalentPilot"). `absolute` opts this segment out of every
// ancestor template; `template` below still applies normally to this group's OWN child pages
// (pricing, features), which get "Pricing | TalentPilot", not double-suffixed either.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    absolute: `${SITE_NAME} — AI Resume Optimizer & ATS Checker`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Score your resume against any job, rewrite it with AI that never invents experience you don't " +
    "have, and get a tailored cover letter — free to start.",
  keywords: [
    "ATS resume checker",
    "resume optimizer",
    "AI resume builder",
    "ATS score",
    "resume scanner",
    "cover letter generator",
    "tailor resume to job",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: `${SITE_NAME} — AI Resume Optimizer & ATS Checker`,
    description: "Score, optimize, and tailor your resume to any job in one click.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — AI Resume Optimizer & ATS Checker`,
    description: "Score, optimize, and tailor your resume to any job in one click.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: SITE_URL },
};

// Public route group — NOT behind auth, fully server-rendered. Only MarketingHeader's mobile
// menu toggle and FAQ's native <details> are interactive; everything else here is static HTML.
// MarketingAuthRedirect renders nothing itself (a sibling, not a wrapper) and only bounces an
// already-signed-in visitor to /dashboard client-side, after the page has already rendered — see
// its own doc comment for why it must never block initial render the way RequireAuth/
// RedirectIfAuthed legitimately do for (app)/(auth).
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingAuthRedirect />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
