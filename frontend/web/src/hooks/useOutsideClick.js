import { useEffect } from 'react'

/** Calls `handler` when a click happens outside every ref in `refs`. */
export function useOutsideClick(refs, handler) {
  useEffect(() => {
    function onDocClick(e) {
      const list = Array.isArray(refs) ? refs : [refs]
      const clickedInside = list.some((ref) => ref.current && ref.current.contains(e.target))
      if (!clickedInside) handler()
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [refs, handler])
}
