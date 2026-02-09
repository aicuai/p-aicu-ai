"use client"

import { LiquidGlassNav } from "@aicujp/ui"
import type { NavItem } from "@aicujp/ui"

const navItems: NavItem[] = [
  {
    id: "home",
    label: "ホーム",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  },
  {
    id: "points",
    label: "ポイント",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M15.5 9.4a3.04 3.04 0 0 0-2.15-1.4h-2.7a2.5 2.5 0 1 0 0 5h2.7a2.5 2.5 0 0 1 0 5h-2.7A3.04 3.04 0 0 1 8.5 16.6"/></svg>,
  },
  {
    id: "profile",
    label: "プロフィール",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>,
  },
]

export default function DashboardNav() {
  return (
    <LiquidGlassNav
      items={navItems}
      activeId="home"
      position="bottom"
      theme="dark"
    />
  )
}
