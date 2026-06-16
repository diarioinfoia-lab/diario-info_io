'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getArticles, getCategories, getUsers, getNotifications } from '@/lib/api'
import { Newspaper, Tag, Users, Heart, Bookmark, Bell, ArrowRight } from 'lucide-react'

export default function DashboardHome() {
  const [stats, setStats] = useState({ published: 0, drafts: 0, users: 0, favorites: 0, saved: 0, notifications: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getArticles({ limit: 1 }).catch(() => null),
      getCategories().catch(() => null),
      getUsers({ limit: 1 }).catch(() => null),
      getNotifications().catch(() => null),
    ]).then(([arts, cats, usrs, notifs]) => {
      setStats({
        published: arts?.total || 0,
        drafts: 0,
        users: usrs?.total || 0,
        favorites: 0,
        saved: 0,
        notifications: (Array.isArray(notifs) ? notifs : notifs?.notifications || []).length,
      })
      setLoading(false)
    })
  }, [])

  const cards = [
    { label: 'PUBLICADOS', sub: 'ARTÍCULOS EN LÍNEA', value: stats.published, icon: Newspaper, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', href: '/dashboard/articles?status=published' },
    { label: 'BORRADORES', sub: 'PENDIENTES DE REVISIÓN', value: stats.drafts, icon: Newspaper, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', href: '/dashboard/articles?status=draft' },
    { label: 'USUARIOS', sub: 'COMUNIDAD TOTAL', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', href: '/dashboard/users' },
    { label: 'ARTÍCULOS FAVORITOS', sub: 'INTERACCIONES POSITIVAS', value: stats.favorites, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', href: '/dashboard?view=favorites' },
    { label: 'ARTÍCULOS GUARDADOS', sub: 'LECTURAS PENDIENTES', value: stats.saved, icon: Bookmark, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', href: '/dashboard?view=saved' },
    { label: 'NOTIFICACIONES', sub: 'SIN AVISOS NUEVOS', value: stats.notifications, icon: Bell, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', href: '/dashboard/notifications' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Control</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Resumen general de tu actividad y estadísticas en la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">{c.label}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                <c.icon className={`w-5 h-5 ${c.color}`}/>
              </div>
            </div>
            <p className={`text-4xl font-bold text-gray-900 dark:text-white mb-1`}>
              {loading ? <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-12 h-8 inline-block"/> : c.value}
            </p>
            <p className="text-xs text-gray-400 mb-4">{c.sub}</p>
            <Link href={c.href} className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
              VER DETALLES <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
