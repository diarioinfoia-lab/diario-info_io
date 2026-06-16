'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, LayoutTemplate, PanelLeft, PanelRight, Columns2, Columns3, Columns4, Maximize2 } from 'lucide-react'
import { getBlockTemplates, createBlockTemplate, updateBlockTemplate, deleteBlockTemplate } from '@/lib/api'

const LAYOUTS = [
  { value: 'Full-width', label: 'Full-width (Ancho Completo)' },
  { value: '2 Cols', label: '2 Columnas' },
  { value: '3 Cols', label: '3 Columnas' },
  { value: '4 Cols', label: '4 Columnas' },
  { value: 'Hero (Principal Izquierda)', label: 'Hero (Principal Izquierda)' },
  { value: 'Hero (Principal Derecha)', label: 'Hero (Principal Derecha)' },
]

const COLUMN_TYPES = ['Noticia', 'Publicidad', 'Multimedia', 'Playlist de Videos']

const COLUMN_COUNT: Record<string, number> = {
  'Full-width': 1, '2 Cols': 2, '3 Cols': 3, '4 Cols': 4,
  'Hero (Principal Izquierda)': 3, 'Hero (Principal Derecha)': 3,
}

interface Column { type: string }
interface Template { id: string; name: string; code: string; layout: string; columns: Column[] }
interface TemplateRaw extends Omit<Template, 'id'> { id?: string; _id?: string }

function layoutIcon(layout: string) {
  if (layout === 'Full-width') return <Maximize2 className="w-4 h-4 text-gray-500" />
  if (layout === '2 Cols') return <Columns2 className="w-4 h-4 text-gray-500" />
  if (layout === '3 Cols') return <Columns3 className="w-4 h-4 text-gray-500" />
  if (layout === '4 Cols') return <Columns4 className="w-4 h-4 text-gray-500" />
  if (layout === 'Hero (Principal Izquierda)') return <PanelLeft className="w-4 h-4 text-gray-500" />
  if (layout === 'Hero (Principal Derecha)') return <PanelRight className="w-4 h-4 text-gray-500" />
  return <LayoutTemplate className="w-4 h-4 text-gray-500" />
}

function typeColor(t: string) {
  if (t === 'Noticia') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  if (t === 'Multimedia') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  if (t === 'Publicidad') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
}

function ColumnPreview({ layout, columns }: { layout: string; columns: Column[] }) {
  const isHeroLeft = layout === 'Hero (Principal Izquierda)'
  const isHeroRight = layout === 'Hero (Principal Derecha)'
  const isFull = layout === 'Full-width'

  if (isFull) {
    return (
      <div className={`w-full h-10 rounded flex items-center justify-center text-xs font-medium ${typeColor(columns[0]?.type || 'Noticia')}`}>
        {columns[0]?.type || 'Noticia'}
      </div>
    )
  }
  if (isHeroLeft) {
    return (
      <div className="w-full flex gap-1 h-10">
        <div className={`flex-1 rounded flex items-center justify-center text-xs font-medium ${typeColor(columns[0]?.type || 'Noticia')}`}>{(columns[0]?.type || '').substring(0,4)}</div>
        <div className="flex flex-col gap-0.5 w-2/5">
          {[1,2].map(i => (
            <div key={i} className={`flex-1 rounded flex items-center justify-center text-xs ${typeColor(columns[i]?.type || 'Noticia')}`}>{(columns[i]?.type || '').substring(0,3)}</div>
          ))}
        </div>
      </div>
    )
  }
  if (isHeroRight) {
    return (
      <div className="w-full flex gap-1 h-10">
        <div className="flex flex-col gap-0.5 w-2/5">
          {[0,1].map(i => (
            <div key={i} className={`flex-1 rounded flex items-center justify-center text-xs ${typeColor(columns[i]?.type || 'Noticia')}`}>{(columns[i]?.type || '').substring(0,3)}</div>
          ))}
        </div>
        <div className={`flex-1 rounded flex items-center justify-center text-xs font-medium ${typeColor(columns[2]?.type || 'Noticia')}`}>{(columns[2]?.type || '').substring(0,4)}</div>
      </div>
    )
  }
  return (
    <div className="w-full flex gap-1 h-10">
      {columns.map((col, i) => (
        <div key={i} className={`flex-1 rounded flex items-center justify-center text-xs font-medium ${typeColor(col.type)}`}>
          {col.type.substring(0, 3)}
        </div>
      ))}
    </div>
  )
}

export default function PlantillasPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTemplate, setEditTemplate] = useState<Template | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', layout: 'Full-width', columns: [{ type: 'Noticia' }] })

  useEffect(() => { loadTemplates() }, [])

  async function loadTemplates() {
    setLoading(true)
    try {
      const data = await getBlockTemplates()
      const list: Template[] = (data.templates || []).map((t: TemplateRaw) => ({ ...t, id: t.id || t._id || '' }))
      setTemplates(list)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function openNew() {
    setEditTemplate(null)
    setForm({ name: '', code: '', layout: 'Full-width', columns: [{ type: 'Noticia' }] })
    setShowModal(true)
  }

  function openEdit(t: Template) {
    setEditTemplate(t)
    setForm({ name: t.name, code: t.code || '', layout: t.layout, columns: t.columns.length ? [...t.columns] : [{ type: 'Noticia' }] })
    setShowModal(true)
  }

  function handleLayoutChange(layout: string) {
    const count = COLUMN_COUNT[layout] || 1
    const newCols = Array.from({ length: count }, (_: unknown, i: number) => ({ type: form.columns[i]?.type || 'Noticia' }))
    setForm(f => ({ ...f, layout, columns: newCols }))
  }

  function handleColumnType(idx: number, type: string) {
    setForm(f => ({ ...f, columns: f.columns.map((c, i) => i === idx ? { type } : c) }))
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = { name: form.name, code: form.code || form.name.toUpperCase().replace(/\\s+/g, '_'), layout: form.layout, columns: form.columns }
      if (editTemplate) {
        await updateBlockTemplate(editTemplate.id, payload)
      } else {
        await createBlockTemplate(payload)
      }
      setShowModal(false)
      await loadTemplates()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    try {
      await deleteBlockTemplate(id)
      setDeleteId(null)
      await loadTemplates()
    } catch (e) { console.error(e) }
  }

  const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plantillas de Bloque</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gestion\u00e1 las plantillas de estructura para armar la portada del sitio.</p>
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar plantilla..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nueva Plantilla
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">Cargando plantillas...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <LayoutTemplate className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No hay plantillas a\u00fan</p>
          <button onClick={openNew} className="mt-3 text-blue-600 hover:underline text-sm">Crear primera plantilla</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {layoutIcon(t.layout)}
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <ColumnPreview layout={t.layout} columns={t.columns} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">{LAYOUTS.find(l=>l.value===t.layout)?.label || t.layout}</span>
                {t.code && <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{t.code}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Editor de Plantilla</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configur\u00e1 la estructura y propiedades de esta plantilla de bloque.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Plantilla</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ej: N Full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Layout</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.layout}
                    onChange={e => handleLayoutChange(e.target.value)}
                  >
                    {LAYOUTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Configuraci\u00f3n y Previsualizaci\u00f3n de Columnas</label>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {form.columns.map((col, i) => (
                      <div key={i}>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Columna {i + 1}</span>
                        <select
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={col.type}
                          onChange={e => handleColumnType(i, e.target.value)}
                        >
                          {COLUMN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <ColumnPreview layout={form.layout} columns={form.columns} />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-60">
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Eliminar Plantilla</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">\u00bfEst\u00e1s seguro? Esta acci\u00f3n no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
