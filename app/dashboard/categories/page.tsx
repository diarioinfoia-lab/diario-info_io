'use client'
import { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api'
import { Plus, Search, Edit, Trash2, GripVertical } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await getCategories()
      setCategories(r?.categories || r?.data || (Array.isArray(r) ? r : []))
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try { await deleteCategory(id); setCategories(c => c.filter(x => x._id !== id)) } catch { alert('Error') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorías</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administra las categorías de noticias del sitio.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4"/> Nueva Categoría
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o descripción..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"/>
          </div>
        </div>
        <div className="grid grid-cols-[40px_80px_80px_150px_150px_1fr_80px] gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
          <span/>
          <span>Color</span><span>Posición</span><span>Nombre</span><span>Slug</span><span>Descripción</span><span/>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No hay categorías</div>
        ) : (
          filtered.map((c, i) => (
            <div key={c._id} className="grid grid-cols-[40px_80px_80px_150px_150px_1fr_80px] gap-4 px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 items-center group">
              <GripVertical className="w-4 h-4 text-gray-300 cursor-grab"/>
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: c.color || '#6366f1' }}/>
              <span className="text-sm text-gray-600 dark:text-gray-400">{i + 1} º</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{c.name}</span>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{c.slug}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{c.description}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(c); setShowModal(true) }} className="p-1.5 hover:text-rose-600 text-gray-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                  <Edit className="w-3.5 h-3.5"/>
                </button>
                <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:text-red-500 text-gray-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <CategoryModal
          category={editing}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}

function CategoryModal({ category, onClose, onSave }: any) {
  const [form, setForm] = useState({ name: category?.name || '', slug: category?.slug || '', description: category?.description || '', color: category?.color || '#6366f1' })
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { alert('El nombre es requerido'); return }
    setSaving(true)
    try {
      if (category) await updateCategory(category._id, form)
      else await createCategory(form)
      onSave()
    } catch (e: any) { alert(e.message || 'Error') }
    setSaving(false)
  }

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#1e293b']

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">{category ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input value={form.name} onChange={e => { set('name', e.target.value); if (!category) set('slug', e.target.value.toLowerCase().replace(/s+/g, '-').replace(/[^a-z0-9-]/g, '')) }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button key={color} onClick={() => set('color', color)} className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : ''}`} style={{ backgroundColor: color }}/>
              ))}
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)} className="w-8 h-8 rounded-full cursor-pointer"/>
            </div>
          </div>
        </div>
        <div className="flex justify-between p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
