'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Moon, Sun, User, Menu, X } from 'lucide-react'
import { getCategories } from '@/lib/api'
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
    getCategories().then(r => setCategories(r?.categories || r?.data || (Array.isArray(r) ? r : [])))
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="relative w-10 h-10 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 p-[2px] shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900 flex items-center justify-center">
                <Image
                  src="https://ia.diarioinfo.com/logo-info_sm.png"
                  alt="diario info"
                  width={36}
                  height={36}
                  className="object-contain transition-transform group-hover:scale-110 duration-300"
                  unoptimized
                />
              </div>
            </div>
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="flex items-baseline gap-0.5">
              <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">diario</span>
              <span className="font-bold text-orange-500 text-sm tracking-tight">info</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">Información Inteligente</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 justify-center">
          {categories.slice(0,6).map(c => (
            <Link key={c._id} href={'/categoria/' + (c.slug || c._id)}
              className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide hover:text-orange-500 dark:hover:text-orange-400 whitespace-nowrap transition-colors">
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={e => { e.preventDefault(); if (query.trim()) window.location.href = '/buscar?q=' + encodeURIComponent(query) }} className="flex items-center gap-1">
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Buscar..." className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-800 dark:text-white w-40"/>
              <button type="button" onClick={() => setSearchOpen(false)}><X className="w-4 h-4 text-gray-500"/></button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
            </button>
          )}
          <button onClick={toggleDark} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {dark ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
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
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-2">
          {categories.map(c => (
            <Link key={c._id} href={'/categoria/' + (c.slug || c._id)}
              className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-orange-500 font-medium">
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
