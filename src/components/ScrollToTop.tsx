import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Restores the scroll position on navigation. Without this, opening a
 * property from halfway down the listings grid lands you halfway down the
 * property page.
 *
 * A hash — "/#contact", "/#faq" — scrolls to that section instead. The
 * target may not exist yet when the route changes (the home page is still
 * rendering), so it is looked for over a few frames before giving up.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
      return
    }

    let frame = 0
    let tries = 0
    const find = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" })
        return
      }
      if (++tries < 60) frame = requestAnimationFrame(find)
    }
    find()
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}
