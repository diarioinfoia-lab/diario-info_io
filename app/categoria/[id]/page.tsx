import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import { getCategory, getPublicArticles } from '@/lib/api'
import type { Article } from '@/types'

async function getData(id: string) {
  try {
    const [catRes, artRes] = await Promise.all([
      getCategory(id).catch(() => null),
      getPublicArticles({ categoryId: id, limit: 20 }).catch(() => null),
    ])
    return {
      category: catRes?.category || catRes?.data || catRes,
      articles: artRes?.articles || artRes?.data || (Array.isArray(artRes) ? artRes : []),
    }
  } catch { return { category: null, articles: [] } }
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const { category, articles } = await getData(params.id)

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header/>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {category?.name || 'Categoría'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{articles.length} artículos</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {articles.map((a: Article) => <ArticleCard key={a._id} article={a}/>)}
        </div>
        {!articles.length && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">No hay artículos en esta categoría</p>
          </div>
        )}
      </div>
      <Footer/>
    </main>
  )
}
