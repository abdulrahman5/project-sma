'use client'

import { type ReactNode, useState } from 'react'

export function MobileNav({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="menu-btn" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        ☰
      </button>
      <ul className={`nav-links${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
        {children}
      </ul>
    </>
  )
}
