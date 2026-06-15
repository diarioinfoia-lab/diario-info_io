'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatDate, getImageUrl } from '@/lib/utils'
import Image from 'next/image'
import type { Article } from '@/types'

export default function NoticiasAdmin() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    api.get(`/articles?limit=15&page=${page}`)
      .then(r => { setArticles(r.data?.articles || r.data || []); setTotal(r.data?.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  const deleteArticle = async (id: string) => {
    if (!confirm('¿Eliminar este artículo?')) return
    await api.delete(`/articles/${id}`).catch(() => {})
    setArticles(prev => prev.filter(a => a._id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Noticias <span className="text-gray-400 font-normal text-base">({total})</span></h1>
        <Link href="/dashboard/noticias/nueva" className="px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors">+ Nueva</Link>
      </div>
      
      {loading ? <div className="text-center py-20 text-gray-500">Cargando...</div> : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {articles.map(a => (
            <div key={a._id} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                <Image src={getImageUrl(a.image)} alt={a.title} fill className="object-cover"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{a.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{a.category?.name} · {formatDate(a.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/dashboard/noticias/${a._id}`} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Editar</Link>
                <button onClick={() => deleteArticle(a._id)} className="px-3 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 transition-colors">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}