import { StructuredData } from "./components/structured-data";
import { Hero } from "./components/hero";
import { HowItWorks } from "./components/how-it-works";
import { FeatureShowcase } from "./components/feature-showcase";
import { ScoreDemo } from "./components/score-demo";
import { PricingTeaser } from "./components/pricing-teaser";
import { FAQ } from "./components/faq";
import { FinalCTA } from "./components/final-cta";

// No SocialProof/Testimonials section: this is a genuinely new product with no real customer
// logos, usage stats, or reviews yet. Fabricating any of those (a "trusted by X companies" strip,
// invented quotes attributed to made-up people) is the same category of problem the JSON-LD
// aggregateRating warning covers — deceptive social proof, not just a missing section. Add a real
// one once real usage/testimonials exist; the anti-fabrication guarantee (FeatureShowcase) and the
// live score demo carry the "does it work" case honestly in the meantime.
export default function LandingPage() {
  return (
    <>
      <StructuredData />
      <Hero />
      <HowItWorks />
      <FeatureShowcase />
      <ScoreDemo />
      <PricingTeaser />
      <FAQ />
      <FinalCTA />
    </>
  );
}
