import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import { FAQ_ITEMS } from "./faq";

// Server component — renders <script type="application/ld+json"> that Google reads directly.
// Deliberately OMITS `aggregateRating` on the SoftwareApplication schema: there are no real
// reviews yet, and fabricating a rating/count is exactly the kind of markup Google's spam
// policies target (and can get a site manually actioned). Add it later, with real numbers, once
// real reviews exist — never before.
export function StructuredData() {
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "AI resume optimizer and ATS checker that scores, rewrites, and tailors resumes to job postings.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to start; paid plans unlock more monthly credits.",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
    </>
  );
}
