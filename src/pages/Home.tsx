import Layout from '@/layout/Layout'
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'
import Marquee from '@/components/Marquee'
import { HouseHuntBoard } from '@/components/HouseHuntBoard'
import { PinnedCard } from '@/components/PinnedCard';
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
import { FontSwitcher } from '@/components/FontSwitcher';


// Base sizes are the "true" thumbnail size before the 0.55 display scale below.
// Position (x, y) is where the top-left of the marker stack sits inside .collage-container.
const cards = [
  { x: 40, y: 100, width: 176, height: 132, z: 2, url: '1.jpg' },
  { x: 20, y: 300, width: 152, height: 132, z: 1, url: '2.jpg' },
  { x: 340, y: 250, width: 176, height: 132, z: 2, url: '3.jpg' },
  { x: 560, y: 70, width: 152, height: 132, z: 3, url: '1.jpg' },
  { x: 780, y: 160, width: 176, height: 132, z: 2, url: '2.jpg' },
  { x: 600, y: 320, width: 152, height: 132, z: 1, url: '3.jpg' },
  { x: 300, y: 440, width: 164, height: 132, z: 1, url: '1.jpg' },
]



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
            <motion.div variants={slideUpVariants} className="z-10 bg-orange-800/60 border-b">
              <Marquee items={tickerItems} />
            </motion.div>

            <motion.div
              variants={slideUpVariants}
              className="z-10 flex justify-between items-center w-full pt-4 px-8"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src="/alta-logo.png"
                  alt="Logo"
                  className="w-12 border-black shadow-[3px_3px_0px_#000] border rounded-xl"
                />
                <span className="alta-living-title text-3xl uppercase leading-none hidden sm:inline">
                  Alta Living
                </span>
              </div>
              <div className="bg-white flex gap-2 border rounded-full px-1 pl-2 py-1 border-black shadow-md">
                <Button variant="link" className="text-foreground">Listings</Button>
                <Button variant="link" className="text-foreground">About Us</Button>
                <Button variant="link" className="text-foreground">Contact</Button>
                <FontSwitcher />
              </div>
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
      <Layout className="p-4">
        {/* <Navbar /> */}
        <div className="grid grid-cols-[1fr_4fr_1fr] gap-4 h-full">
          <div className="border grid grid-rows-3">
            <div className="p-4 flex flex-col gap-2 justify-between">
              <p className="font-extrabold text-7xl mb-2">12+</p>
              <p className="font-extralight text text-right ">Properties and counting</p>
            </div>
            <div className="p-4 flex flex-col gap-2 justify-between">
              <p className="font-extrabold text-7xl mb-2">5+</p>
              <p className="font-extralight text text-right ">Years of hosting</p>
            </div>
            <div className="p-4 flex flex-col gap-2 justify-between">
              <p className="font-extrabold text-7xl mb-2">100+</p>
              <p className="font-extralight text text-right ">Happy Customers</p>
            </div>
          </div>
          <div className="flex flex-col border overflow-hidden">
            <div className=" collage-container w-full h-full relative overflow-hidden bg-cover bg-center bg-[linear-gradient(to_bottom,white_0%,transparent_40%,transparent_75%,white_95%),url('/image-4.png')]">

              <div className="absolute inset-0 z-10">
                {cards.map((card, i) => (
                  <PinnedCard key={i} {...card} />
                ))}
              </div>
            </div>
          </div>
          <div className="border grid grid-rows-[2fr_1fr]">
            <div className="border-b" ></div>
            <div className="" ></div>
          </div>
        </div>
      </Layout >


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
