import Navbar from '@/components/Navbar'
import Layout from '@/layout/Layout'
import Draggable from 'react-draggable'
import { useRef, useState } from 'react'
import DemoOne from '@/components/3DTestimonialsDemo'
import { Play, Sun, Moon, BedIcon, UserIcon, CurrencyIcon, ArrowRightIcon, DoorOpenIcon, MapPinIcon, StarIcon, HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroSection from '@/sections/HeroSection'
import { Button } from '@/components/ui/button'
import Marquee from '@/components/Marquee'
import { FontSwitcher } from '@/components/FontSwitcher'
import { Separator } from '@/components/ui/separator'
import { HouseHuntBoard } from '@/components/HouseHuntBoard'

export const Button3D = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: {
      base: 'bg-blue-500 text-white border-blue-600',
      hover: 'hover:bg-blue-600'
    },
    secondary: {
      base: 'bg-gray-500 text-white border-gray-600',
      hover: 'hover:bg-gray-600'
    },
    success: {
      base: 'bg-green-500 text-white border-green-600',
      hover: 'hover:bg-green-600'
    },
    danger: {
      base: 'bg-red-500 text-white border-red-600',
      hover: 'hover:bg-red-600'
    },
    warning: {
      base: 'bg-yellow-500 text-black border-yellow-600',
      hover: 'hover:bg-yellow-600'
    }
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm',
    md: 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base',
    lg: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg'
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  return (
    <motion.button
      className={`
        ${currentVariant.base}
        ${currentVariant.hover}
        font-bold
        rounded-lg
        border-b-4
        ${currentSize}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none
        focus:ring-4
        focus:ring-blue-300
        select-none
        flex
        items-center
        justify-center
        ${className}
      `}
      initial={{
        boxShadow: '0 6px 0 0 #1d4ed8',
        y: 0
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 8px 0 0 #1d4ed8',
        transition: { duration: 0.1 }
      }}
      whileTap={{
        scale: 0.98,
        y: 4,
        boxShadow: '0 2px 0 0 #1d4ed8',
        transition: { duration: 0.1 }
      }}
      animate={{
        y: isPressed ? 4 : 0,
        boxShadow: isPressed ? '0 2px 0 0 #1d4ed8' : '0 6px 0 0 #1d4ed8'
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

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

const PinnedCard = ({
  x,
  y,
  width,
  height,
  z,
  url,
}: {
  x: number
  y: number
  width: number
  height: number
  z: number
  url: string
}) => {
  const [hovered, setHovered] = useState(false)

  const scale = 0.85
  const displayWidth = width * scale
  const displayHeight = height * scale

  // Deterministic "random" tilt per card, based on position — so it stays
  // stable across re-renders but each card reads as hand-placed.
  const seed = (x * 13 + y * 7) % 100
  const baseRotate = (seed / 100) * 10 - 5 // -5deg to 5deg
  const rotate = hovered ? baseRotate * 0.4 : baseRotate

  return (
    <div
      style={{ position: 'absolute', left: x, top: y, zIndex: hovered ? 50 : z }}
      className="flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* pushpin */}
      <div className="relative z-10 -mb-1 w-3 h-3 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-red-800 border border-red-700 shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        <div className="absolute top-[2px] left-[2px] w-[3px] h-[3px] rounded-full bg-red-200/70" />
      </div>

      {/* card, hanging from the pin */}
      <div
        style={{
          width: displayWidth,
          transform: `perspective(800px) rotateX(3deg) rotate(${rotate}deg)`,
          transformOrigin: 'top center',
          transition: 'transform 150ms ease-out, box-shadow 250ms ease-out',
          boxShadow: hovered
            ? `
              0 1px 1px rgba(0,0,0,0.2),
              0 2px 5px rgba(0,0,0,0.2),
              ${6 + seed % 4}px ${18 + seed % 6}px 24px -8px rgba(0,0,0,0.45),
              ${2 + seed % 3}px ${8}px 10px -4px rgba(0,0,0,0.3)
            `
            : `
              0 1px 1px rgba(0,0,0,0.15),
              0 2px 4px rgba(0,0,0,0.15),
              ${4 + seed % 4}px ${10 + seed % 6}px 16px -6px rgba(0,0,0,0.4),
              ${1 + seed % 3}px ${4}px 6px -2px rgba(0,0,0,0.25)
            `,
        }}
        className="bg-muted flex flex-col border overflow-hidden group"
      >
        <div style={{ height: displayHeight }} className="p-1 w-full overflow-hidden">
          <div className="w-full h-full overflow-hidden">
            <img
              src={url}
              alt="Card"
              className="w-full h-full object-cover transition-transform duration-100 ease-out"
              draggable={false}
            />
          </div>
        </div>
        <div className="h-6 bg-white w-full border-t-black" />
      </div>
    </div>
  )
}
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
    hidden: { opacity: 0, y: 32 },
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
              <Marquee
                items={[
                  "14 homes live across bangalore",
                  "new listing — indiranagar 2bhk",
                  "average move-in time — 3 days",
                  "fully furnished, fully photographed",
                ]}
              />
            </motion.div>

            <motion.div
              variants={slideUpVariants}
              className="z-10 flex justify-between items-center w-full pt-4 px-8"
            >
              <img
                src="/alta-logo.png"
                alt="Logo"
                className="w-12 border-black shadow-[3px_3px_0px_#000] border rounded-xl"
              />
              <div className="bg-white flex gap-2 border rounded-full px-3 py-1 border-black shadow-md">
                <Button variant="link" className="text-foreground">Listings</Button>
                <Button variant="link" className="text-foreground">About Us</Button>
                <Button variant="link" className="text-foreground">Contact</Button>
              </div>
            </motion.div>

            <div className="z-10 flex flex-col flex-1 justify-center items-center p-8 px-16">
              <motion.div variants={slideUpVariants}>
                <p className="text-4xl font-mono">House Hunt ends today at</p>
              </motion.div>

              {/* Alta Living animates independently, ahead of everything else */}
              <motion.div initial="hidden" animate="visible" variants={altaVariants}>
                <p className="text-8xl font-extrabold">Alta Living</p>
              </motion.div>

              <motion.div variants={slideUpVariants} className='w-full flex justify-center'>
                <Button className="z-10 m-8 bg-white border-2 rounded-full text-black hover:text-white border-black h-16 w-1/2 mx-auto hover:bg-black shadow-[5px_6px_0px_#000]">
                  Browse Properties
                </Button>
              </motion.div>
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

            {/* <div className="flex justify-between items-center h-16 text-2xl font-extrabold p-2"> */}
            {/* <p>
                  ALTA LIVING
                </p> */}
            {/* <Button className="bg-black h-full w-full rounded-none hover:bg-black">Browse Properties
              </Button> */}
            {/* </div> */}
          </div>
          <div className="border grid grid-rows-[2fr_1fr]">
            <div className="border-b" ></div>
            <div className="" ></div>
          </div>
        </div>
      </Layout >
      {/* <Separator className='mt-10' /> */}
      <Layout className="p-8 mt-22">
        <div className="p-16 pb-12 flex justify-center items-center flex-col gap-8 border border-neutral-400 rounded-t-[60px]">
          <p className="w-full text-left text-6xl font-extrabold">Top Picks</p>
          <div className="flex justify-between gap-8 w-full">
            <PropertyCard src="/1.jpg" />
            <PropertyCard src="/2.jpg" />
            <PropertyCard src="/3.jpg" />
          </div>
        </div>
      </Layout>

      <Layout className="p-8 mt-22">
        <div className="p-16 pb-12 flex justify-center items-center flex-col gap-8 border border-neutral-400 rounded-t-[60px]">
          <p className="w-full text-left text-6xl font-extrabold">What people love about us</p>
          <div className="flex justify-between gap-8 w-full flex-wrap">
            <TestimonialCard />
            <TestimonialCard />
            <TestimonialCard />
            <TestimonialCard />
            <TestimonialCard />
            <TestimonialCard />
          </div>
        </div>
      </Layout>
    </>
  )
}

const PropertyCard = ({ src }: { src?: string }) => {
  return <div className="bg-blue-50 flex flex-1 flex-col border border-black min-w-100 gap-2 overflow-hidden">
    <div className="h-72 flex relative border-b border-black">
      <img src={src || "/1.jpg"} className="bg-cover w-full" />
    </div>
    <div className="flex flex-col w-full">
      <div className="flex flex-col p-4 w-full gap-2">
        <div className="flex w-full justify-between items-center">
          <p className="text-2xl font-bold">Property Title</p>

        </div>
        <p className="text-muted-foreground text-sm">Something nice about the property</p>
        <Separator />
        <div className="text-xs flex justify-between gap-2">
          <div className="bg-black text-white text-xs h-fit px-2 py-1 flex gap-2 items-center"> <MapPinIcon size={12} /> Location</div>
          <p className="flex items-center gap-1"><BedIcon size={16} /> 1BHK</p>
          {/* <Separator orientation="vertical" className="border-l-2" /> */}
          <p className="flex items-center gap-1"><DoorOpenIcon size={16} /> Available 1/3</p>
          {/* <Separator orientation="vertical" className="border-l-2" /> */}
        </div>
        <Separator />
        <div className="flex gap-2 p-2">
          <p className="flex flex-1 items-baseline gap-2 text-3xl font-bold">₹ 30,000 <span className="text-sm font-normal">per night</span></p>
          {/* <Separator orientation='vertical' className="border-muted-foreground" />
                <p className="flex flex-col flex-1 items-center text-3xl font-bold">₹ 1,50,000 <span className="text-sm font-normal">per month</span></p> */}
        </div>
        {/* <div className="flex gap-1 items-center">
                <Separator className='flex-1'/>
                OR
                <Separator className='flex-1'/>
              </div>
              <p className="justify-end flex items-baseline gap-2 text-2xl font-bold">₹ 1,50,000 <span className="text-lg font-normal">/ month</span></p> */}
      </div>
      <div className="p-4 pt-0 w-full">
        <Button variant="default" className="w-full h-10 flex justify-between rounded-none bg-white text-black hover:bg-black hover:text-white border-t shadow-[5px_6px_0px_#000] border-black">View <ArrowRightIcon /></Button>
      </div>
    </div>
  </div>;
}

const TestimonialCard = ({
  quote,
  name,
  location,
  rating = 5,
}: {
  quote?: string
  name?: string
  location?: string
  rating?: number
}) => {
  return (
    <div className="max-w-[300px] bg-blue-50 flex flex-1 flex-col border-2 border-black/20 min-w-100 gap-2 overflow-hidden">
      <div className="flex flex-col w-full">
        <div className="flex flex-col p-4 w-full gap-2">
          <div className="flex w-full justify-between items-center">
            <p className="text-2xl font-bold">{name || "Guest Name"}</p>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  size={16}
                  className={i < rating ? "fill-black text-black" : "text-muted-foreground"}
                />
              ))}
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {quote ||
              "Something nice this guest said about staying at the property, kept short enough to fit a couple of lines."}
          </p>

          <Separator />

          <div className="text-xs flex justify-between gap-2 items-center">
            <div className="bg-blue-200 text-blue-800 text-xs h-fit px-2 py-1 flex gap-2 items-center">
              <MapPinIcon size={12} />
              {location || "Indiranagar, Bangalore"}
            </div>
            <p className="flex items-center gap-1 text-muted-foreground">
              <HomeIcon size={16} /> Verified Stay
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
