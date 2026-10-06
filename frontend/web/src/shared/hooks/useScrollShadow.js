import { useEffect, useState } from 'react'

/** Returns true once the page has scrolled past `threshold` px — used to compact the navbar. */
export function useScrollShadow(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
