'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, GripVertical, LayoutTemplate, PanelLeft, PanelRight, Columns2, Columns3, Columns4, Maximize2, Save, ChevronDown } from 'lucide-react'
import { getBlockTemplates, getBlocks, createBlock, updateBlock, deleteBlock } from '@/lib/api'

const DESTINATIONS = [
  { value: 'general', label: 'General' },
  { value: 'deportes', label: 'Deportes' },
  { value: 'politica', label: 'Política' },
  { value: 'economia', label: 'Economía' },
]

interface Column { type: string }
interface Template {
  id: string
  name: string
  code: string
  layout: string
  columns: Column[]
}
interface Block {
  id: string
  name: string
  template: Template
  order: number
  isVisible: boolean
  destination: string
}
interface BlockRaw {
  id?: string
  _id?: string
  name: string
  template: Template
  order: number
  isVisible: boolean
  destination: string
}

function layoutIcon(layout: string, size = 'w-4 h-4') {
  if (layout === 'Full-width') return <Maximize2 className={`${size} text-gray-500`} />
  if (layout === '2 Cols') return <Columns2 className={`${size} text-gray-500`} />
  if (layout === '3 Cols') return <Columns3 className={`${size} text-gray-500`} />
  if (layout === '4 Cols') return <Columns4 className={`${size} text-gray-500`} />
  if (layout === 'Hero (Principal Izquierda)') return <PanelLeft className={`${size} text-gray-500`} />
  if (layout === 'Hero (Principal Derecha)') return <PanelRight className={`${size} text-gray-500`} />
  return <LayoutTemplate className={`${size} text-gray-500`} />
}

function typeColor(t: string) {
  if (t === 'Noticia') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  if (t === 'Multimedia') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  if (t === 'Publicidad') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
}

function BlockPreview({ template }: { template: Template }) {
  if (!template || !template.columns) return null
  const { layout, columns } = template
  const isHeroLeft = layout === 'Hero (Principal Izquierda)'
  const isHeroRight = layout === 'Hero (Principal Derecha)'
  const isFull = layout === 'Full-width'

  if (isFull) {
    return (
      <div className="w-full rounded border border-gray-200 dark:border-gray-600 overflow-hidden h-16">
        <div className={`w-full h-full flex items-center justify-center text-sm font-medium ${typeColor(columns[0]?.type || 'Noticia')}`}>
          {columns[0]?.type || 'Noticia'}
        </div>
      </div>
    )
  }
  if (isHeroLeft) {
    return (
      <div className="w-full flex gap-1 overflow-hidden h-16">
        <div className={`flex-1 flex items-center justify-center text-xs font-medium ${typeColor(columns[0]?.type || 'Noticia')}`}>{columns[0]?.type}</div>
        <div className="flex flex-col gap-0.5 w-2/5">
          {[1,2].map(i => (
            <div key={i} className={`flex-1 flex items-center justify-center text-xs ${typeColor(columns[i]?.type || 'Noticia')}`}>{columns[i]?.type}</div>
          ))}
        </div>
      </div>
    )
  }
  if (isHeroRight) {
    return (
      <div className="w-full flex gap-1 overflow-hidden h-16">
        <div className="flex flex-col gap-0.5 w-2/5">
          {[0,1].map(i => (
            <div key={i} className={`flex-1 flex items-center justify-center text-xs ${typeColor(columns[i]?.type || 'Noticia')}`}>{columns[i]?.type}</div>
          ))}
        </div>
        <div className={`flex-1 flex items-center justify-center text-xs font-medium ${typeColor(columns[2]?.type || 'Noticia')}`}>{columns[2]?.type}</div>
      </div>
    )
  }
  return (
    <div className="w-full flex gap-1 overflow-hidden h-16">
      {columns.map((col, i) => (
        <div key={i} className={`flex-1 flex items-center justify-center text-xs font-medium ${typeColor(col.type)}`}>
          {col.type}
        </div>
      ))}
    </div>
  )
}

function NewBlockModal({ templateName, onConfirm, onCancel, saving }: {
  templateName: string
  onConfirm: (name: string, destination: string) => void
  onCancel: () => void
  saving: boolean
}) {
  const [name, setName] = useState(templateName)
  const [destination, setDestination] = useState('general')
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Agregar a Portada</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del bloque</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destino</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={destination}
              onChange={e => setDestination(e.target.value)}
            >
              {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancelar</button>
          <button onClick={() => onConfirm(name, destination)} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60 transition-colors">
            {saving ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EditorPortadaPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showContModal, setShowContModal] = useState(false)
  const [activeBlock, setActiveBlock] = useState<Block | null>(null)
  const [pendingNew, setPendingNew] = useState<{templateId: string, templateName: string, template: Template} | null>(null)
  const [showNewBlockModal, setShowNewBlockModal] = useState(false)
  const [deleteBlockId, setDeleteBlockId] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [tmplData, blocksData] = await Promise.all([getBlockTemplates(), getBlocks()])
      const tmplList: Template[] = (tmplData.templates || []).map((t: Template & { _id?: string }) => ({ ...t, id: t.id || t._id || '' }))
      const blockList: Block[] = (blocksData.blocks || [])
        .map((b: BlockRaw) => ({ ...b, id: b.id || b._id || '' }))
        .sort((a: Block, b: Block) => (a.order || 0) - (b.order || 0))
      setTemplates(tmplList)
      setBlocks(blockList)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function addBlockToPortada(template: Template) {
    setPendingNew({ templateId: template.id, templateName: template.name, template })
    setShowNewBlockModal(true)
  }

  async function confirmAddBlock(name: string, destination: string) {
    if (!pendingNew) return
    setSaving(true)
    try {
      await createBlock({ name: name || pendingNew.templateName, template: pendingNew.templateId, destination, order: blocks.length + 1 })
      setShowNewBlockModal(false)
      setPendingNew(null)
      setHasChanges(true)
      await loadData()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDeleteBlock(id: string) {
    try {
      await deleteBlock(id)
      setDeleteBlockId(null)
      setHasChanges(true)
      await loadData()
    } catch (e) { console.error(e) }
  }

  async function savePortada() {
    setSaving(true)
    try {
      await Promise.all(blocks.map((b, i) => updateBlock(b.id, { name: b.name, template: b.template?.id, order: i + 1, destination: b.destination })))
      setHasChanges(false)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  function onDragStart(idx: number) { setDragIdx(idx) }
  function onDragOver(e: React.DragEvent<HTMLDivElement>, idx: number) { e.preventDefault(); setDragOverIdx(idx) }
  function onDrop(idx: number) {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return }
    const newBlocks = [...blocks]
    const [moved] = newBlocks.splice(dragIdx, 1)
    newBlocks.splice(idx, 0, moved)
    setBlocks(newBlocks)
    setHasChanges(true)
    setDragIdx(null)
    setDragOverIdx(null)
  }

  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col" style={{minHeight: '80vh'}}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editor de Portada</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Arrastrá, soltá y organizá las instancias de bloques para construir la página principal.</p>
      </div>

      <div className="flex gap-4 flex-1">
        {/* Panel Izquierdo */}
        <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden" style={{maxHeight: '75vh'}}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="font-bold text-gray-900 dark:text-white text-base">Plantillas de Bloque</h2>
            <div className="mt-3 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar plantilla..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Cargando...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Sin plantillas</div>
            ) : filteredTemplates.map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
                onClick={() => addBlockToPortada(t)}
                title="Agregar a portada"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {layoutIcon(t.layout)}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{t.name}</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
            <h2 className="font-bold text-gray-900 dark:text-white">Previsualización de la Portada</h2>
            <div className="flex gap-2 items-center flex-wrap">
              {hasChanges && (
                <div className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-3 py-1.5 rounded-lg">
                  Se detectaron cambios en la portada. Asegúrarte de guardar para que se reflejen en el sitio en vivo.
                </div>
              )}
              <button onClick={() => { setHasChanges(false); loadData() }} className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Descartar
              </button>
              <button onClick={savePortada} disabled={saving} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-60">
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-y-auto p-3 space-y-2" style={{maxHeight: '70vh'}}>
            {loading ? (
              <div className="text-center py-20 text-gray-400">Cargando portada...</div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-20">
                <LayoutTemplate className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">La portada está vacía</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Hacé click en una plantilla del panel izquierdo para agregar bloques</p>
              </div>
            ) : blocks.map((block, idx) => (
              <div
                key={block.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={(e: React.DragEvent<HTMLDivElement>) => onDragOver(e, idx)}
                onDrop={() => onDrop(idx)}
                className={`border rounded-xl p-3 transition-all ${dragOverIdx === idx ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab flex-shrink-0" />
                  {layoutIcon(block.template?.layout || 'Full-width', 'w-3.5 h-3.5')}
                  <div className="relative flex-1 min-w-0">
                    <select
                      className="w-full pl-2 pr-7 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none appearance-none"
                      value={block.destination || 'general'}
                      onChange={e => {
                        const newBlocks = blocks.map((b, i) => i === idx ? {...b, destination: e.target.value} : b)
                        setBlocks(newBlocks)
                        setHasChanges(true)
                      }}
                    >
                      {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => { setActiveBlock(block); setShowContModal(true) }}
                    className="flex items-center gap-1 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Cont.
                  </button>
                  <button onClick={() => setDeleteBlockId(block.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {block.template && <BlockPreview template={block.template} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showNewBlockModal && pendingNew && (
        <NewBlockModal
          templateName={pendingNew.templateName}
          onConfirm={confirmAddBlock}
          onCancel={() => { setShowNewBlockModal(false); setPendingNew(null) }}
          saving={saving}
        />
      )}

      {showContModal && activeBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Contenido del Bloque</h2>
            <p className="text-sm text-gray-500 mb-4">Plantilla: <strong>{activeBlock.template?.name}</strong></p>
            <div className="space-y-3">
              {(activeBlock.template?.columns || []).map((col, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeColor(col.type)}`}>{col.type}</span>
                  <p className="text-xs text-gray-400 mt-1">Columna {i + 1}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowContModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {deleteBlockId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Eliminar Bloque</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">¿Eliminamos este bloque de la portada?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteBlockId(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancelar</button>
              <button onClick={() => handleDeleteBlock(deleteBlockId)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
