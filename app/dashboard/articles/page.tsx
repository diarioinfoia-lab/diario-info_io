'use client'
import { useState, useEffect, useCallback } from 'react'
import { getArticles, getCategories, deleteArticle, createArticle } from '@/lib/api'
import { Plus, Search, Filter, MoreHorizontal, Trash2, Upload, ArrowDown, Globe, Newspaper } from 'lucide-react'

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
      const arts = r?.articles || r?.data || []
      // Normalizar _id
      const normalized = arts.map((a: any) => ({ ...a, _id: a._id || a.id }))
      if (page === 1) setArticles(normalized)
      else setArticles(prev => [...prev, ...normalized])
      setTotal(r?.total || 0)
    } catch { }
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    getCategories().then(r => {
      const cats = r?.categories || r?.data || (Array.isArray(r) ? r : [])
      setCategories(cats.map((c: any) => ({ ...c, _id: c._id || c.id })))
    })
  }, [])

  useEffect(() => { setPage(1) }, [search, statusFilter, catFilter])
  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este artículo?')) return
    try { await deleteArticle(id); setArticles(a => a.filter(x => x._id !== id)) } catch { alert('Error al eliminar') }
  }

  const statusLabel = (s: string) => s === 'published' ? 'Publicado' : s === 'draft' ? 'Borrador' : s || 'Publicado'
  const statusColor = (s: string) => s === 'draft'
    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'

  const filtered = articles.filter(a => {
    if (statusFilter && a.status !== statusFilter) return false
    if (catFilter && (a.category?._id || a.category?.id || a.category) !== catFilter) return false
    return true
  })

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

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <input type="text" placeholder="Buscar por título, categoría o autor..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"/>
          </div>
          <div className="relative">
            <button onClick={() => { setShowStatusMenu(!showStatusMenu); setShowCatMenu(false) }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Filter className="w-4 h-4"/> Estado
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10">
                {['', 'published', 'draft'].map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setShowStatusMenu(false) }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${statusFilter === s ? 'text-rose-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                    {s === '' ? 'Todos' : s === 'published' ? 'Publicados' : 'Borradores'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => { setShowCatMenu(!showCatMenu); setShowStatusMenu(false) }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Filter className="w-4 h-4"/> Categorías
            </button>
            {showCatMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10">
                <button onClick={() => { setCatFilter(''); setShowCatMenu(false) }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${catFilter === '' ? 'text-rose-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                  Todas las categorías
                </button>
                {categories.map(c => (
                  <button key={c._id} onClick={() => { setCatFilter(c._id); setShowCatMenu(false) }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${catFilter === c._id ? 'text-rose-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Título</th>
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Categoría</th>
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Autor</th>
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Estado</th>
              <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Newspaper className="w-12 h-12 opacity-30"/>
                    <p className="text-sm">No hay artículos</p>
                    <button onClick={() => setShowNew(true)} className="text-sm text-rose-600 hover:underline">Crear primer artículo</button>
                  </div>
                </td>
              </tr>
            ) : filtered.map(a => (
              <tr key={a._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {a.image && <img src={a.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{a.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{a.description || a.subtitle || a.summary}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{a.category?.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{a.author?.name || a.author || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(a.status)}`}>{statusLabel(a.status)}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{a.createdAt ? new Date(a.createdAt).toLocaleDateString('es-AR') : '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(a._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <MoreHorizontal className="w-4 h-4"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > 20 && (
          <div className="flex justify-center p-4">
            <button onClick={() => setPage(p => p + 1)} className="flex items-center gap-2 text-sm text-rose-600 hover:underline">
              Cargar más <ArrowDown className="w-4 h-4"/>
            </button>
          </div>
        )}
      </div>

      {showNew && (
        <ArticleModal
          categories={categories}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); setPage(1); load() }}
        />
      )}
    </div>
  )
}

function ArticleModal({ categories, onClose, onCreated }: { categories: any[], onClose: () => void, onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    status: 'draft',
    tags: '',
    image: '',
    slug: ''
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        content: form.content,
        status: form.status,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      if (form.category) payload.category = form.category
      if (form.image) payload.image = form.image
      if (form.slug) payload.slug = form.slug
      else payload.slug = form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
      await createArticle(payload)
      onCreated()
    } catch (err: any) {
      alert('Error al crear artículo: ' + (err?.message || 'desconocido'))
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-rose-600"/>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nueva Noticia</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
            <input required value={form.title}
              onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Título de la noticia"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción / Subtítulo</label>
            <input value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Breve descripción de la noticia"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenido *</label>
            <textarea required value={form.content}
              onChange={e => setForm(f => ({...f, content: e.target.value}))}
              rows={6}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              placeholder="Contenido completo de la noticia..."/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
              <select value={form.category}
                onChange={e => setForm(f => ({...f, category: e.target.value}))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option value="">Sin categoría</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <select value={form.status}
                onChange={e => setForm(f => ({...f, status: e.target.value}))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (separados por coma)</label>
            <input value={form.tags}
              onChange={e => setForm(f => ({...f, tags: e.target.value}))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="ej: política, economía, deporte"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Imagen</label>
            <input value={form.image}
              onChange={e => setForm(f => ({...f, image: e.target.value}))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="https://..."/>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
              <Globe className="w-4 h-4"/> {saving ? 'Guardando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
