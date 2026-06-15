import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import { api } from '@/lib/api'
import type { Article } from '@/types'

async function search(q: string) {
  if (!q) return []
  try {
    const r = await api.get(`/articles?search=${encodeURIComponent(q)}&limit=20`)
    return r.data?.articles || r.data || []
  } catch { return [] }
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || ''
  const articles: Article[] = await search(q)

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header/>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {q ? `Resultados para: "${q}"` : 'Buscar noticias'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{articles.length} resultados</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {articles.map(a => <ArticleCard key={a._id} article={a}/>)}
        </div>
        {!articles.length && q && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">No se encontraron resultados para "{q}"</p>
          </div>
        )}
      </div>
      <Footer/>
    </main>
  )
}