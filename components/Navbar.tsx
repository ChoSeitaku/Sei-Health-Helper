"use client"

import Link from 'next/link'
import { Activity, BarChart3, Droplets, Eye, Flower2, Home, LayoutDashboard, ListChecks, ScanLine, Settings, ShieldCheck, SlidersHorizontal } from 'lucide-react'

export const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/posture', label: '体态', icon: ScanLine },
  { href: '/kegel', label: '提肛', icon: Activity },
  { href: '/eye-care', label: '护眼', icon: Eye },
  { href: '/water', label: '喝水', icon: Droplets },
  { href: '/neck', label: '颈椎', icon: Flower2 },
  { href: '/records', label: '记录', icon: ListChecks },
  { href: '/stats', label: '统计', icon: BarChart3 },
  { href: '/admin', label: '后台', icon: SlidersHorizontal },
  { href: '/settings', label: '设置', icon: Settings }
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar({ pathname }: { pathname: string }) {
  const mobileItems = navItems.filter((item) => ['/', '/dashboard', '/posture', '/water', '/settings'].includes(item.href))

  return (
    <>
      <header className="top-nav">
        <Link className="logo" href="/">
          <span className="logo-mark"><ShieldCheck size={22} /></span>
          <span>星拓健康助手</span>
        </Link>
        <nav className="nav-actions" aria-label="快捷入口">
          <Link className="btn btn-ghost" href="/records">训练记录</Link>
          <Link className="btn btn-primary" href="/posture"><ScanLine size={18} />开始体态检测</Link>
        </nav>
      </header>
      <nav className="bottom-nav" aria-label="移动端导航">
        {mobileItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className={`bottom-link ${isActive(pathname, item.href) ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export { isActive }
