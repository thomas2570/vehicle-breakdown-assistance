'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Car, LayoutDashboard, Settings, LogOut, FileClock, PenTool, Users, Wrench } from 'lucide-react'
import { signout } from '@/app/(auth)/actions'

const customerLinks = [
  { href: '/customer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customer/request', label: 'Request Help', icon: PenTool },
  { href: '/customer/vehicles', label: 'My Vehicles', icon: Car },
  { href: '/customer/history', label: 'Service History', icon: FileClock },
  { href: '/customer/settings', label: 'Settings', icon: Settings },
]

const mechanicLinks = [
  { href: '/mechanic', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/mechanic/requests', label: 'Active Requests', icon: PenTool },
  { href: '/mechanic/history', label: 'Job History', icon: FileClock },
  { href: '/mechanic/settings', label: 'Settings', icon: Settings },
]

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/mechanics', label: 'Verify Mechanics', icon: Wrench },
  { href: '/admin/jobs', label: 'Global Job Tracker', icon: Settings },
]

export function Sidebar({ role }: { role: 'customer' | 'mechanic' | 'admin' }) {
  const pathname = usePathname()
  
  let links = customerLinks
  if (role === 'mechanic') links = mechanicLinks
  if (role === 'admin') links = adminLinks

  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold tracking-tight">RescueRoad</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <form action={signout}>
          <button type="submit" className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}
