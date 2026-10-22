'use client'

import { type ReactNode, useState } from 'react'

// Category filter chips over the server-rendered project cards.
export function ProjectGrid({ categories, cards }: { categories: string[]; cards: { category: string; node: ReactNode }[] }) {
  const [filter, setFilter] = useState('all')
  return (
    <>
      {categories.length > 1 && (
        <div className="filter">
          {['all', ...categories].map((c) => (
            <button key={c} className={`chip${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      )}
      <div className="projects">{cards.filter((c) => filter === 'all' || c.category === filter).map((c) => c.node)}</div>
    </>
  )
}
