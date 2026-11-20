import { ImmersiveHero } from "@/sections/hero/ImmersiveHero"
import { PropertyCoverflow } from "@/sections/PropertyCoverflow"
import { PropertyScatterReveal } from "@/sections/PropertyScatterReveal"
import { StatsBar } from "@/sections/StatsBar"
import { WhoWeAre } from "@/sections/WhoWeAre"
import { TestimonialsSection } from "@/sections/TestimonialsSection"
import { AreaExplorer } from "@/sections/AreaExplorer"
// import { PricingSection } from "@/sections/PricingSection"
import { ContactSection } from "@/sections/ContactSection"
import { ClosingCta } from "@/sections/ClosingCta"
import { Footer } from "@/sections/Footer"
import { ForCompaniesAndOwners } from "@/sections/ForCompaniesAndOwners"
import { FaqSection } from "@/sections/FaqSection"

/**
 * The landing page is a stack of self-contained sections. Each one owns its
 * own layout and animation; reorder, add or remove them here.
 * Copy for every section lives in src/content/site.ts.
 */
const Home = () => {
  return (
    <>
      {/* Fixed background + letter-by-letter wave headline. Tune in HERO_MOTION. */}
      <ImmersiveHero />

      <PropertyScatterReveal />
      <PropertyCoverflow />
      <StatsBar />
      <WhoWeAre />
      <TestimonialsSection />
      <AreaExplorer />
      {/* <PricingSection /> */}
      <ContactSection />
      <ForCompaniesAndOwners />
      <FaqSection />
      <ClosingCta />
      <Footer />
    </>
  )
}

export default Home
