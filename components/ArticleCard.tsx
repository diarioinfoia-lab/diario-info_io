import Link from 'next/link'
import Image from 'next/image'
import { formatDate, getImageUrl } from '@/lib/utils'
import type { Article } from '@/types'

interface Props {
  article: Article
  size?: 'sm' | 'md' | 'lg'
}

export default function ArticleCard({ article, size = 'md' }: Props) {
  const href = `/noticia/${article._id}`
  
  if (size === 'lg') return (
    <Link href={href} className="group relative block overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 aspect-video">
      <Image src={getImageUrl(article.image)} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300"/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {article.category && <span className="inline-block px-2 py-0.5 bg-rose-600 text-white text-xs font-semibold rounded mb-2 uppercase">{article.category.name}</span>}
        <h2 className="text-white font-bold text-lg leading-tight line-clamp-3">{article.title}</h2>
        <p className="text-gray-300 text-xs mt-1">{formatDate(article.createdAt)}</p>
      </div>
    </Link>
  )

  if (size === 'sm') return (
    <Link href={href} className="group flex gap-3 items-start py-2">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700">
        <Image src={getImageUrl(article.image)} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform"/>
      </div>
      <div className="flex-1 min-w-0">
        {article.category && <span className="text-xs font-semibold text-rose-600 uppercase">{article.category.name}</span>}
        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-rose-600 transition-colors">{article.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(article.createdAt)}</p>
      </div>
    </Link>
  )

  return (
    <Link href={href} className="group block overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
        <Image src={getImageUrl(article.image)} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300"/>
        {article.category && <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white text-xs font-semibold rounded uppercase">{article.category.name}</span>}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-rose-600 transition-colors text-sm">{article.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(article.createdAt)}</p>
      </div>
    </Link>
  )
}