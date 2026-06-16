'use client'
import { useState, useEffect } from 'react'
import { Newspaper, Users, Heart, Bookmark, Bell, ArrowRight } from 'lucide-react'
import { getArticles, getUsers } from '@/lib/api'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({ published: 0, drafts: 0, users: 0, favorites: 0, saved: 0, notifications: 0 })

  useEffect(() => {
    getArticles({ limit: 1 }).then(r => {
      const all = r?.total || 0
      const pub = r?.published || 0
      setStats(s => ({ ...s, published: pub || all, drafts: r?.drafts || 0 }))
    }).catch(() => {})
    getUsers().then(r => {
      const users = r?.users || r?.data || (Array.isArray(r) ? r : [])
      setStats(s => ({ ...s, users: r?.total || users.length || 0 }))
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'PUBLICADOS', sub: 'ARTÍCULOS EN LÍNEA', value: stats.published, icon: Newspaper, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', href: '/dashboard/articles' },
    { label: 'BORRADORES', sub: 'PENDIENTES DE REVISIÓN', value: stats.drafts, icon: Newspaper, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', href: '/dashboard/articles' },
    { label: 'USUARIOS', sub: 'COMUNIDAD TOTAL', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', href: '/dashboard/users' },
    { label: 'ARTÍCULOS FAVORITOS', sub: 'INTERACCIONES POSITIVAS', value: stats.favorites, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', href: '/dashboard/articles' },
    { label: 'ARTÍCULOS GUARDADOS', sub: 'LECTURAS PENDIENTES', value: stats.saved, icon: Bookmark, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', href: '/dashboard/articles' },
    { label: 'NOTIFICACIONES', sub: 'SIN AVISOS NUEVOS', value: stats.notifications, icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', href: '/dashboard/notifications' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Control</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Resumen general de tu actividad y estadísticas en la plataforma.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">{card.label}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`}/>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">{card.sub}</p>
            <Link href={card.href} className="flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600 transition-colors font-medium uppercase tracking-wider">
              VER DETALLES <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
