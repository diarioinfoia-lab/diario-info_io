import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { api } from '@/lib/api'
import { formatDate, getImageUrl } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Article } from '@/types'

async function getArticle(id: string): Promise<Article | null> {
  try {
    const r = await api.get(`/articles/${id}`)
    return r.data?.article || r.data
  } catch { return null }
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)
  if (!article) notFound()

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header/>
      <article className="max-w-3xl mx-auto px-4 py-8">
        {article.category && (
          <Link href={`/categoria/${article.category._id}`}
            className="inline-block px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded uppercase mb-4 hover:bg-rose-700 transition-colors">
            {article.category.name}
          </Link>
        )}
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">{article.title}</h1>
        {article.subtitle && <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{article.subtitle}</p>}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{formatDate(article.createdAt)}</p>
        
        {article.image && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-gray-200 dark:bg-gray-800">
            <Image src={getImageUrl(article.image)} alt={article.title} fill className="object-cover"/>
          </div>
        )}
        
        <div className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content || article.summary || '' }}/>
      </article>
      <Footer/>
    </main>
  )
}