import { useEffect, useState } from 'react'
import Card from '../shared/Card.jsx'
import { termLines } from '../../data/mockData.js'

export default function SyncTerminal() {
  const [expanded, setExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(termLines.length)

  // Render mostly-static output — this isn't a live process, so it shouldn't
  // replay a full typewriter animation on every visit.
  useEffect(() => {
    if (!expanded) return
    setVisibleCount(0)
    const id = setInterval(() => {
      setVisibleCount((c) => {
        if (c >= termLines.length) {
          clearInterval(id)
          return c
        }
        return c + 1
      })
    }, 140)
    return () => clearInterval(id)
  }, [expanded])

  return (
    <Card className="terminal terminal-compact" hover={false}>
      <div className="term-bar">
        <span className="term-dot" />
        <span className="term-title">sync.log</span>
        <button type="button" className="terminal-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'collapse' : 'expand'}
        </button>
      </div>
      {expanded ? (
        <div className="term-body term-body-compact">
          {termLines.slice(0, visibleCount).map((line, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
          ))}
          {visibleCount >= termLines.length && (
            <div>
              <span className="p">$</span> <span className="caret" />
            </div>
          )}
        </div>
      ) : (
        <div className="term-body term-body-compact term-body-collapsed" dangerouslySetInnerHTML={{ __html: termLines[termLines.length - 1] }} />
      )}
    </Card>
  )
}
