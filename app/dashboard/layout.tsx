'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Newspaper, Tag, ListMusic, Layout, Users, Bell,
  Settings, User, LogOut, ChevronLeft, ChevronRight,
  Globe, Moon, Sun, FileText, Clock, BarChart3
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/articles', label: 'Noticias', icon: Newspaper },
  { href: '/dashboard/categories', label: 'Categorías', icon: Tag },
  { href: '/dashboard/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/dashboard/blocks', label: 'Plantillas', icon: FileText },
  { href: '/dashboard/layout', label: 'Portada', icon: Layout },
  { href: '/dashboard/users', label: 'Usuarios', icon: Users },
  { href: '/dashboard/encuestas', label: 'Encuestas', icon: BarChart3 },
  { href: '/dashboard/logs', label: 'Logs del Sistema', icon: Clock },
  { href: '/dashboard/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/dashboard/profile', label: 'Mi Perfil', icon: User },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/signin'); return }
    const u = localStorage.getItem('user')
    if (u) { try { setUser(JSON.parse(u)) } catch {} }
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') { setDark(true); document.documentElement.classList.add('dark') }
  }, [router])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/signin')
  }

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'A'

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-300 fixed h-full z-30`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">diario info</p>
                <p className="text-xs text-gray-400">Información Inteligente</p>
              </div>
            )}
          </Link>
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
                <Icon className="w-4 h-4 flex-shrink-0"/>
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-2 space-y-0.5">
          <Link href="/dashboard/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith('/dashboard/settings') ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <Settings className="w-4 h-4 flex-shrink-0"/>
            {!collapsed && <span>Ajustes</span>}
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4 flex-shrink-0"/>
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col ${collapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        {/* Topbar */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-20">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 transition-colors">
            <Globe className="w-4 h-4"/>
            <span>Ir al Diario</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              {dark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
            </button>
            <Link href="/dashboard/notifications" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-4 h-4 text-gray-500"/>
            </Link>
            <button onClick={logout} className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity">
              {initials}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-8">
          <div className="grid grid-cols-4 gap-8 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">diario info</span>
              </div>
              <p className="text-xs text-gray-400">PANEL DE CONTROL</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Plataforma de gestión de contenidos y administración integral.</p>
              <p className="text-xs text-gray-400 mt-1">© 2026 v2.4.0</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Soporte Técnico</p>
              <p className="text-xs text-gray-500">diarionews.io@gmail.com</p>
              <p className="text-xs text-gray-500">+54 9 3854 10-3821</p>
              <p className="text-xs text-gray-500">Documentación</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Sistema</p>
              <p className="text-xs text-green-600">Servidores: Operativos</p>
              <p className="text-xs text-green-600">Seguridad: Activa</p>
              <p className="text-xs text-gray-500">Log de Cambios</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Enlaces Rápidos</p>
              <p className="text-xs text-gray-500">Ir al Sitio Web</p>
              <p className="text-xs text-gray-500">Contacto</p>
              <p className="text-xs text-gray-500">Términos de Uso</p>
              <p className="text-xs text-gray-500">Política de Privacidad</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
