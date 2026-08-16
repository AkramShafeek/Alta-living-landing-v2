import Layout from '@/layout/Layout'
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'
import Marquee from '@/components/Marquee'
import { HouseHuntBoard } from '@/components/HouseHuntBoard'
import { PropertyCard } from '@/components/PropertyCard';
import { StatsBar } from '@/sections/StatsBar';
import { WhoWeAre } from '@/sections/WhoWeAre';
import { TestimonialsSection } from '@/sections/TestimonialsSection';
import { AreaExplorer } from '@/sections/AreaExplorer';
import { PricingSection } from '@/sections/PricingSection';
import { ContactSection } from '@/sections/ContactSection';
import { ClosingCta } from '@/sections/ClosingCta';
import { Footer } from '@/sections/Footer';
import { heroContent, properties, tickerItems } from '@/content/site';


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
        <div className="relative flex flex-col h-full w-full border-b">
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
            className="flex flex-col h-full w-full"
            initial="hidden"
            animate="visible"
            variants={restContainerVariants}
          >
            <motion.div data-marquee variants={slideUpVariants} className="z-10 bg-orange-800/60 border-b">
              <Marquee items={tickerItems} />
            </motion.div>

            <div className="z-10 flex flex-col flex-1 justify-center items-center p-8 px-16 text-center">
              <motion.div variants={slideUpVariants}>
                <p className="cedarville-cursive-regular text-3xl text-black/70 mb-4">{heroContent.eyebrow}</p>
              </motion.div>

              {/* <motion.div variants={slideUpVariants}>
                <p className="text-4xl font-mono">Alta Living</p>
              </motion.div> */}

              {/* Alta Living animates independently, ahead of everything else */}
              <motion.div initial="hidden" animate="visible" variants={altaVariants}>
                <p className="text-8xl font-extrabold max-w-2xl">Looking for a house rental?</p>
              </motion.div>

              <motion.div variants={slideUpVariants}>
                <p className="max-w-2xl text-lg font-serif leading-relaxed text-black/70 text-balance mt-4">
                  {heroContent.body}
                </p>
              </motion.div>

              <motion.div variants={slideUpVariants} className='w-full flex justify-center mt-5'>
                <Button className="z-10 m-8 bg-white border-2 rounded-full text-black hover:text-white border-black h-16 w-1/2 mx-auto hover:bg-black shadow-[5px_6px_0px_#000]">
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


      {/* <Layout className="p-8 mt-22" id="showcase"> */}
      <div className="p-16 m-8 mt-30 pb-12 flex flex-col gap-8 border border-neutral-400 rounded-t-[60px]">
        <div>
          <p className="cedarville-cursive-regular text-2xl text-black/70 mb-1">the pinboard</p>
          <p className="w-full text-left text-6xl font-bold">Every home, right now</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full flex-wrap">
          {properties.map((property) => (
            <PropertyCard key={property.slug} property={property} />
          ))}
        </div>
      </div>
      {/* </Layout> */}


      <StatsBar />
      <WhoWeAre />
      <TestimonialsSection />
      <AreaExplorer />
      <PricingSection />
      <ContactSection />
      <ClosingCta />
      <Footer />
    </>
  )
}




export default Home
