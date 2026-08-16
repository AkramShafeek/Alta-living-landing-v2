import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FontSwitcher } from '@/components/FontSwitcher'

const slideUpVariants = {
  hidden: { opacity: 0, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
} as const

// The home page renders its own marquee bar (tagged with `data-marquee`)
// ahead of the hero content. On mount, and on every scroll/resize, we read
// its actual bottom edge and pin the nav row right there — so at scroll top
// the nav sits below the marquee, and as the marquee scrolls out of view the
// nav rides up with it 1:1 until it settles flush at the top. Pages without
// a marquee just get top 0.
function useNavTop(isHome: boolean) {
  const [navTop, setNavTop] = useState(0)

  useEffect(() => {
    if (!isHome) {
      setNavTop(0)
      return
    }

    let raf = 0
    const measure = () => {
      raf = 0
      const marquee = document.querySelector('[data-marquee]')
      setNavTop(marquee ? Math.max(0, marquee.getBoundingClientRect().bottom) : 0)
    }
    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(measure)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [isHome])

  return navTop
}

// Mounted once above <Routes> in main.tsx, so this component is never
// unmounted/remounted on route changes — initial="hidden" animate="visible"
// therefore only ever plays on the very first app load, not on page changes.
const Navbar = () => {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const navTop = useNavTop(isHome)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideUpVariants}
      style={{ top: navTop }}
      className="fixed inset-x-0 z-40 flex justify-between items-center w-full pt-4 px-8 bg-transparent"
    >
      <Link to="/" className="flex items-center gap-3.5 ">
        <img
          src="/alta-logo.png"
          alt="Logo"
          className="w-12 border-black shadow-[3px_3px_0px_#000] border rounded-xl"
        />
        <span className="alta-living-title text-3xl uppercase leading-none hidden sm:inline">
          Alta Living
        </span>
      </Link>
      <div className="bg-white flex gap-2 border rounded-full px-1 pl-2 py-1 border-black shadow-md">
        <Button variant="link" className="text-foreground" asChild>
          <Link to="/listings">Listings</Link>
        </Button>
        <Button variant="link" className="text-foreground">About Us</Button>
        <Button variant="link" className="text-foreground">Contact</Button>
        <FontSwitcher />
      </div>
    </motion.div>
  )
}

export default Navbar
