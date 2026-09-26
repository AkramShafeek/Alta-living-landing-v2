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
import { heroContent, tickerItems } from "@/content/site"
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
                <p className="max-w-2xl text-8xl font-extrabold">
                  Looking for a house rental?
                </p>
              </motion.div>

              <motion.div variants={slideUpVariants}>
                <p className="mt-4 max-w-2xl font-serif text-lg leading-relaxed text-balance text-black/70">
                  {heroContent.body}
                </p>
              </motion.div>

              <motion.div
                variants={slideUpVariants}
                className="mt-5 flex w-full justify-center"
              >
                <Button className="z-10 m-8 mx-auto h-16 w-1/4 rounded-full border-2 border-black bg-white text-black shadow-[5px_6px_0px_#000] hover:bg-yellow-400 active:shadow-none">
                  {heroContent.ctaLabel}
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
      <ClosingCta />
      <Footer />
    </>
  )
}

export default Home
