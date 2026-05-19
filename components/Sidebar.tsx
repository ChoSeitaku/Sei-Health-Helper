"use client"

import Link from 'next/link'
import { navItems } from './Navbar'
import { isActive } from './Navbar'

export function Sidebar({ items, pathname }: { items: typeof navItems; pathname: string }) {
  return (
    <aside className="sidebar" aria-label="主导航">
      <div style={{ display: 'grid', gap: 6 }}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className={`side-link ${isActive(pathname, item.href) ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
      <div className="card card-subtle" style={{ marginTop: 18, padding: 16 }}>
        <div className="badge">隐私优先</div>
        <p className="muted" style={{ margin: '10px 0 0', fontSize: 13 }}>摄像头画面只在浏览器本地分析，不上传服务器。</p>
      </div>
    </aside>
  )
}
