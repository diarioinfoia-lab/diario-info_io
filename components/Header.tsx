'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Moon, Sun, User, Menu, X, Bell } from 'lucide-react'
import { api } from '@/lib/api'
import type { Category } from '@/types'

export default function Header() {
  const [dark, setDark] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') { setDark(true); document.documentElement.classList.add('dark') }
    api.get('/categories').then(r => setCategories(r.data?.categories || r.data || [])).catch(() => {})
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">D</span>
          </div>
          <div className="leading-tight hidden sm:block">
            <span className="font-bold text-gray-900 dark:text-white text-sm">diario info</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Información Inteligente</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {categories.slice(0,6).map(c => (
            <Link key={c._id} href={`/categoria/${c.slug || c._id}`}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 whitespace-nowrap transition-colors">
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={e => { e.preventDefault(); if(query) window.location.href='/buscar?q='+encodeURIComponent(query) }} className="flex items-center gap-2">
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Buscar..." className="border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1 text-sm bg-white dark:bg-gray-800 dark:text-white w-40 focus:outline-none focus:ring-2 focus:ring-rose-500"/>
              <button type="button" onClick={() => setSearchOpen(false)}><X className="w-4 h-4 text-gray-500"/></button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
            </button>
          )}
          <button onClick={toggleDark} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {dark ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5 text-gray-600"/>}
          </button>
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            {menuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          {categories.map(c => (
            <Link key={c._id} href={`/categoria/${c.slug || c._id}`}
              className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-rose-600 border-b border-gray-100 dark:border-gray-800">
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}