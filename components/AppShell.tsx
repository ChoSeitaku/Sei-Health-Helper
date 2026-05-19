"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initializeDefaultData } from '@/lib/storage'
import { Navbar, navItems } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    initializeDefaultData()
  }, [])

  return (
    <div className="app-shell">
      <Navbar pathname={pathname} />
      <div className="main-frame">
        <Sidebar items={navItems} pathname={pathname} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
