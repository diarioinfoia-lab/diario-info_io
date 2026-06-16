'use client'
import { useState, useEffect, useCallback } from 'react'
import { getArticles, getCategories, deleteArticle } from '@/lib/api'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Upload, ArrowDown } from 'lucide-react'
import Link from 'next/link'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showCatMenu, setShowCatMenu] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 20 }
      if (search) params.search = search
      const r = await getArticles(params)
      if (page === 1) setArticles(r?.articles || r?.data || [])
      else setArticles(prev => [...prev, ...(r?.articles || r?.data || [])])
      setTotal(r?.total || 0)
    } catch { }
    setLoading(false)
  }, [page, search])

  useEffect(() => { 
    getCategories().then(r => setCategories(r?.categories || r?.data || (Array.isArray(r) ? r : [])))
  }, [])

  useEffect(() => { setPage(1) }, [search, statusFilter, catFilter])
  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este artículo?')) return
    try { await deleteArticle(id); setArticles(a => a.filter(x => x._id !== id)) } catch { alert('Error al eliminar') }
  }

  const statusLabel = (s: string) => s === 'published' ? 'Published' : s === 'draft' ? 'Draft' : s || 'Published'
  const statusColor = (s: string) => s === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Noticias</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Edita, crea y gestiona todos los artículos del diario.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Upload className="w-4 h-4"/> Importar Noticia
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4"/> Nueva Noticia
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Filters */}
        <div className="p-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título, categoría o autor..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"/>
          </div>
          {/* Estado filter */}
          <div className="relative">
            <button onClick={() => { setShowStatusMenu(!showStatusMenu); setShowCatMenu(false) }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Filter className="w-4 h-4"/> Estado
            </button>
            {showStatusMenu && (
              <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 min-w-[140px]">
                {['', 'published', 'draft'].map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setShowStatusMenu(false) }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {s === '' ? 'Todos' : s === 'published' ? 'Published' : 'Draft'}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Categorías filter */}
          <div className="relative">
            <button onClick={() => { setShowCatMenu(!showCatMenu); setShowStatusMenu(false) }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Filter className="w-4 h-4"/> Categorías
            </button>
            {showCatMenu && (
              <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 min-w-[160px]">
                <button onClick={() => { setCatFilter(''); setShowCatMenu(false) }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Todas</button>
                {categories.map(c => (
                  <button key={c._id} onClick={() => { setCatFilter(c._id); setShowCatMenu(false) }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">{c.name}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_100px_120px_60px] gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
          <span>Título</span><span>Categoría</span><span>Autor</span><span>Estado</span><span>Fecha</span><span/>
        </div>

        {/* Rows */}
        {loading && page === 1 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No hay artículos</div>
        ) : (
          articles.map(a => (
            <div key={a._id} className="grid grid-cols-[2fr_1fr_1fr_100px_120px_60px] gap-4 px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 items-center group">
              <div className="flex items-center gap-2 min-w-0">
                <ArrowDown className="w-3.5 h-3.5 text-gray-300 shrink-0"/>
                <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{a.title}</span>
              </div>
              <div>
                {a.category && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: a.category?.color || '#6366f1' }}>
                    {(a.category?.name || '').toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{a.author?.name || a.user?.name || '-'}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${statusColor(a.status)}`}>{statusLabel(a.status)}</span>
              <span className="text-xs text-gray-400">{a.publishedAt || a.createdAt ? new Date(a.publishedAt || a.createdAt).toLocaleDateString('es-AR') : '-'}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/dashboard/articles/${a._id}`} className="p-1 hover:text-rose-600 text-gray-400 rounded transition-colors">
                  <Edit className="w-3.5 h-3.5"/>
                </Link>
                <button onClick={() => handleDelete(a._id)} className="p-1 hover:text-red-500 text-gray-400 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Load more */}
        {articles.length < total && (
          <div className="p-4 text-center">
            <button onClick={() => setPage(p => p + 1)} className="text-sm text-rose-600 hover:text-rose-700 font-medium">
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>

      {/* New Article Modal */}
      {showNew && <ArticleModal onClose={() => setShowNew(false)} onSave={() => { setShowNew(false); setPage(1); load() }} categories={categories}/>}
    </div>
  )
}

function ArticleModal({ onClose, onSave, categories }: any) {
  const [form, setForm] = useState({ title: '', slug: '', description: '', content: '', categoryId: '', status: 'published', tags: [] as string[], priority: 'Media', destination: 'General' })
  const [tag, setTag] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const addTag = () => { if (tag.trim()) { set('tags', [...form.tags, tag.trim()]); setTag('') } }

  const handleSave = async (status: string) => {
    if (!form.title.trim()) { alert('El título es requerido'); return }
    setSaving(true)
    try {
      const { createArticle } = await import('@/lib/api')
      await createArticle({ ...form, status, category: form.categoryId || undefined })
      onSave()
    } catch (e: any) { alert(e.message || 'Error al guardar') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center gap-3 p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Nueva Publicación</h2>
            <p className="text-xs text-gray-500">Configura los detalles, contenido y visibilidad de tu artículo.</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contenido Principal */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">Contenido Principal</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título del artículo</label>
              <input value={form.title} onChange={e => { set('title', e.target.value); set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) }}
                placeholder="El titular principal" className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL amigable)</label>
              <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="titulo-de-la-noticia"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción corta</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                placeholder="Un resumen atractivo para listados y SEO"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"/>
            </div>
          </div>
          {/* Cuerpo */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Cuerpo de la Noticia</h3>
            <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={6}
              placeholder="Escribe el contenido de la noticia aquí..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"/>
          </div>
          {/* Categoría + Fecha */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <option value="">Seleccionar categoría</option>
                  {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Publicación</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
              </div>
            </div>
          </div>
          {/* Jerarquía y SEO */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">Jerarquía y SEO</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
                <select value={form.priority} onChange={e => set('priority', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500">
                  {['Alta', 'Media', 'Baja'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destino</label>
                <select value={form.destination} onChange={e => set('destination', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500">
                  {['General', 'Portada', 'Destacado'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Etiquetas (Tags)</label>
              </div>
              <div className="flex gap-2">
                <input value={tag} onChange={e => setTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Añadir etiqueta y presionar Enter"
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
                <button onClick={addTag} className="px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700">Añadir</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((t, i) => (
                  <span key={i} className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-xs flex items-center gap-1">
                    {t} <button onClick={() => set('tags', form.tags.filter((_, j) => j !== i))} className="ml-1 hover:text-rose-900">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancelar
          </button>
          <div className="flex gap-3">
            <button onClick={() => handleSave('draft')} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60">
              Guardar Borrador
            </button>
            <button onClick={() => handleSave('published')} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
              <Globe className="w-4 h-4"/> Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
