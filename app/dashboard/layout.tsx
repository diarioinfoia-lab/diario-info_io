'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Newspaper, Tag, ListMusic, Layout, Users, Bell, Settings, LogOut, Globe, ChevronLeft } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/dashboard/noticias', icon: Newspaper, label: 'Noticias' },
  { href: '/dashboard/categorias', icon: Tag, label: 'Categorías' },
  { href: '/dashboard/playlists', icon: ListMusic, label: 'Playlists' },
  { href: '/dashboard/portada', icon: Layout, label: 'Portada' },
  { href: '/dashboard/usuarios', icon: Users, label: 'Usuarios' },
  { href: '/dashboard/notificaciones', icon: Bell, label: 'Notificaciones' },
  { href: '/dashboard/ajustes', icon: Settings, label: 'Ajustes' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token) { router.push('/signin'); return }
    if (userData) { try { setUser(JSON.parse(userData)) } catch {} }
  }, [router])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/signin')
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <aside className={`${collapsed ? 'w-16' : 'w-56'} shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200`}>
        <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && <span className="font-bold text-sm text-gray-900 dark:text-white">DiarioInfo</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ml-auto">
            <ChevronLeft className={`w-4 h-4 text-gray-500 transition-transform ${collapsed ? 'rotate-180' : ''}`}/>
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Icon className="w-4 h-4 shrink-0"/>
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Globe className="w-4 h-4 shrink-0"/>
            {!collapsed && <span>Ir al Diario</span>}
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4 shrink-0"/>
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
            {navItems.find(n => n.href === pathname)?.label || 'Dashboard'}
          </h2>
          {user && <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>}
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}