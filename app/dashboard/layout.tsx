'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Newspaper, Tag, ListMusic, Layout, Users, Bell,
  Settings, User, LogOut, ChevronLeft, ChevronRight,
  Globe, Moon, Sun, FileText, Clock
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/articles', label: 'Noticias', icon: Newspaper },
  { href: '/dashboard/categories', label: 'Categorías', icon: Tag },
  { href: '/dashboard/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/dashboard/blocks', label: 'Plantillas', icon: FileText },
  { href: '/dashboard/layout', label: 'Portada', icon: Layout },
  { href: '/dashboard/users', label: 'Usuarios', icon: Users },
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
    if (u) try { setUser(JSON.parse(u)) } catch {}
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') { setDark(true); document.documentElement.classList.add('dark') }
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/signin')
  }

  const initials = user?.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">D</span>
              </div>
              <div className="leading-tight">
                <span className="font-bold text-gray-900 dark:text-white text-sm">diario info</span>
                <p className="text-xs text-gray-400">Información Inteligente</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xs">D</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all ${active ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
                <Icon className="w-4 h-4 shrink-0"/>
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: Ajustes + collapse */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-3 shrink-0">
          <Link href="/dashboard/settings"
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all ${pathname === '/dashboard/settings' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <Settings className="w-4 h-4 shrink-0"/>
            {!collapsed && <span>Ajustes</span>}
          </Link>
          <button onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 w-[calc(100%-16px)] transition-all">
            {collapsed ? <ChevronRight className="w-4 h-4 shrink-0"/> : <><ChevronLeft className="w-4 h-4 shrink-0"/><span>Colapsar</span></>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 transition-colors">
            <Globe className="w-4 h-4"/>
            <span>Ir al Diario</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={toggleDark} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
              {dark ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5 text-gray-500"/>}
            </button>
            <Link href="/dashboard/notifications" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-500"/>
            </Link>
            <button onClick={logout} className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity" title="Cerrar sesión">
              {initials}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-6 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs">D</span>
                </div>
                <div><p className="font-bold text-gray-900 dark:text-white text-sm">diario info</p><p className="text-xs text-gray-400">PANEL DE CONTROL</p></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Plataforma de gestión de contenidos y administración integral.</p>
              <p className="text-xs text-gray-400 mt-1">© 2026 v2.4.0</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">Soporte Técnico</p>
              <p className="text-xs text-gray-500">diarioinfo.io@gmail.com</p>
              <p className="text-xs text-gray-500">+54 9 3854 10-3821</p>
              <p className="text-xs text-gray-500">Documentación</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">Sistema</p>
              <p className="text-xs text-green-600">Servidores: Operativos</p>
              <p className="text-xs text-green-600">Seguridad: Activa</p>
              <p className="text-xs text-gray-500">Log de Cambios</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">Enlaces Rápidos</p>
              <Link href="/" className="block text-xs text-gray-500 hover:text-rose-600">Ir al Sitio Web</Link>
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
