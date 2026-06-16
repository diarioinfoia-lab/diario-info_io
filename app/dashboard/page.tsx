'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getArticles, getCategories, getUsers } from '@/lib/api'
import { Newspaper, Tag, Users } from 'lucide-react'

export default function DashboardHome() {
  const [stats, setStats] = useState({ articles: 0, categories: 0, users: 0 })

  useEffect(() => {
    Promise.all([
      getArticles({ limit: 1 }).catch(() => null),
      getCategories().catch(() => null),
      getUsers({ limit: 1 }).catch(() => null),
    ]).then(([art, cat, usr]) => {
      setStats({
        articles: art?.total || art?.data?.total || 0,
        categories: (cat?.categories || cat?.data || (Array.isArray(cat) ? cat : [])).length,
        users: usr?.total || usr?.data?.total || 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Artículos', value: stats.articles, icon: Newspaper, href: '/dashboard/noticias', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' },
    { label: 'Categorías', value: stats.categories, icon: Tag, href: '/dashboard/categorias', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
    { label: 'Usuarios', value: stats.users, icon: Users, href: '/dashboard/usuarios', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Panel de control</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map(c => (
          <Link key={c.label} href={c.href} className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800">
            <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5"/>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/noticias/nueva" className="px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors">+ Nueva noticia</Link>
          <Link href="/dashboard/categorias" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Ver categorías</Link>
          <Link href="/dashboard/usuarios" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Ver usuarios</Link>
        </div>
      </div>
    </div>
  )
}
