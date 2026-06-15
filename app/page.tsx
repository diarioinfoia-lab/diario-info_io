import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import NewsTicker from '@/components/NewsTicker'
import { api } from '@/lib/api'
import type { Article } from '@/types'

async function getArticles() {
  try {
    const r = await api.get('/articles?limit=20&page=1')
    return r.data?.articles || r.data || []
  } catch { return [] }
}

export const revalidate = 60

export default async function Home() {
  const articles: Article[] = await getArticles()
  const featured = articles.slice(0, 3)
  const rest = articles.slice(3)

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header/>
      <NewsTicker articles={articles.slice(0,8)}/>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Featured */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2">
              {featured[0] && <ArticleCard article={featured[0]} size="lg"/>}
            </div>
            <div className="flex flex-col gap-4">
              {featured[1] && <ArticleCard article={featured[1]} size="lg"/>}
              {featured[2] && <ArticleCard article={featured[2]} size="md"/>}
            </div>
          </div>
        )}

        {/* Rest */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rest.map(a => <ArticleCard key={a._id} article={a}/>)}
        </div>

        {!articles.length && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">No hay artículos disponibles</p>
          </div>
        )}
      </div>
      <Footer/>
    </main>
  )
}