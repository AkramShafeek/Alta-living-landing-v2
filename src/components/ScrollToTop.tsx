import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Restores the scroll position on navigation. Without this, opening a
 * property from halfway down the listings grid lands you halfway down the
 * property page. Hash links (the page's own "#enquire" anchors) are left
 * alone so in-page jumps still work.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname, hash])

  return null
}
