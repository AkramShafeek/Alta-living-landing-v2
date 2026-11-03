import Layout from "@/layout/Layout"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Marquee from "@/components/Marquee"
import { HouseHuntBoard } from "@/components/HouseHuntBoard"
import { PropertyCoverflow } from "@/sections/PropertyCoverflow"
import { PropertyScatterReveal } from "@/sections/PropertyScatterReveal"
import { StatsBar } from "@/sections/StatsBar"
import { WhoWeAre } from "@/sections/WhoWeAre"
import { TestimonialsSection } from "@/sections/TestimonialsSection"
import { AreaExplorer } from "@/sections/AreaExplorer"
// import { PricingSection } from "@/sections/PricingSection" // unused — <PricingSection /> is commented out below
// import { Tabs } from "radix-ui" // unused
import { ContactSection } from "@/sections/ContactSection"
import { ClosingCta } from "@/sections/ClosingCta"
import { Footer } from "@/sections/Footer"
import { ForCompaniesAndOwners } from "@/sections/ForCompaniesAndOwners"
import { FaqSection } from "@/sections/FaqSection"
import { enquiryWhatsApp, heroContent, tickerItems } from "@/content/site"
import { whatsappTextLink } from "@/lib/whatsapp"
import { Link } from "react-router-dom"
// import { cn } from "@/lib/utils" // unused

const Home = () => {
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.1, transition: { duration: 4.4, ease: "easeOut" } },
  } as const

  const altaVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.9, ease: "easeOut" },
    },
  } as const

  const restContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0.9,
        staggerChildren: 0.15,
      },
    },
  } as const

  const slideUpVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  } as const

  return (
    <>
      <Layout className="p-0">
        <div className="relative flex h-full w-full flex-col border-b">
          <motion.div
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: "url('/pattern.jpg')",
              backgroundSize: "300px 300px",
            }}
            initial="hidden"
            animate="visible"
            variants={backgroundVariants}
          />

          <HouseHuntBoard />

          <motion.div
            className="flex h-full w-full flex-col"
            initial="hidden"
            animate="visible"
            variants={restContainerVariants}
          >
            <motion.div
              data-marquee
              variants={slideUpVariants}
              className="z-10 border-b bg-orange-800/60"
            >
              <Marquee items={tickerItems} />
            </motion.div>

            <div className="z-10 flex flex-1 flex-col items-center justify-center p-8 px-16 text-center">
              <motion.div variants={slideUpVariants}>
                <p className="cedarville-cursive-regular mb-4 text-3xl text-black/70">
                  {heroContent.eyebrow}
                </p>
              </motion.div>

              {/* <motion.div variants={slideUpVariants}>
                <p className="text-4xl font-mono">Alta Living</p>
              </motion.div> */}

              {/* Alta Living animates independently, ahead of everything else */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={altaVariants}
              >
                <h1 className="max-w-4xl text-6xl leading-[0.95] font-extrabold tracking-tight text-balance md:text-8xl">
                  {heroContent.headline}
                </h1>
              </motion.div>

              <motion.div variants={slideUpVariants}>
                <p className="mt-4 max-w-2xl font-serif text-lg leading-relaxed text-balance text-black/70">
                  {heroContent.body}
                </p>
              </motion.div>

              <motion.div
                variants={slideUpVariants}
                className="z-10 mt-10 mb-8 flex w-full flex-wrap justify-center gap-4"
              >
                <Button
                  asChild
                  className="h-16 rounded-full border-2 border-black bg-white px-10 text-base text-black shadow-[5px_6px_0px_#000] hover:bg-yellow-400 active:shadow-none"
                >
                  <Link to="/listings">{heroContent.ctaLabel}</Link>
                </Button>
                <Button
                  asChild
                  className="h-16 rounded-full border-2 border-black bg-black px-10 text-base text-amber-400 shadow-[5px_6px_0px_#000] hover:bg-amber-400 hover:text-black active:shadow-none"
                >
                  <a
                    href={whatsappTextLink(enquiryWhatsApp, "Hi Alta, I'm looking for a home.")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {heroContent.whatsappLabel}
                  </a>
                </Button>
              </motion.div>

              {/* <motion.div variants={slideUpVariants} className="flex gap-2.5 flex-wrap justify-center -mt-4">
                {heroContent.areas.map((area) => (
                  <Tag key={area}>{area}</Tag>
                ))}
              </motion.div> */}
            </div>
          </motion.div>
        </div>
      </Layout>
      {/* <CaseStudyBoard /> */}

      <PropertyScatterReveal />

      {/* <Layout className="p-8 mt-22" id="showcase"> */}
      <PropertyCoverflow />
      {/* </Layout> */}

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
