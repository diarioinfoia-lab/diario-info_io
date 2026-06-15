'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Article } from '@/types'

export default function NewsTicker({ articles }: { articles: Article[] }) {
  const ref = useRef<HTMLDivElement>(null)
  
  if (!articles.length) return null
  
  return (
    <div className="bg-rose-600 text-white py-2 overflow-hidden">
      <div className="flex items-center gap-4 max-w-full">
        <span className="shrink-0 px-3 font-bold text-xs uppercase tracking-wider bg-white/20 py-1 rounded">EN VIVO</span>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-8 animate-[ticker_30s_linear_infinite] whitespace-nowrap">
            {[...articles, ...articles].map((a, i) => (
              <Link key={i} href={`/noticia/${a._id}`} className="shrink-0 text-sm hover:underline">
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}