'use client';

import { useState, useEffect, useRef } from 'react';
import { GripVertical, Pencil, Trash2, X, Search, Plus, AlignLeft, Columns2, LayoutGrid, BookOpen, MonitorPlay, Megaphone, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API = 'https://api2.diarioinfo.com';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken(),
  };
}

const DESTINATIONS = [
  { value: 'general', label: 'General' },
  { value: 'especial', label: 'Especial' },
  { value: 'tuayyu', label: 'TuAyllú' },
  { value: 'analisis', label: 'Análisis' },
  { value: 'mundial2026', label: 'Mundial 2026' },
  { value: 'politica', label: 'Política' },
  { value: 'deportes', label: 'Deportes' },
  { value: 'economia', label: 'Economía' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'internacional', label: 'Internacional' },
  { value: 'sociedad', label: 'Sociedad' },
];

interface Column { type: string; }

interface BlockConfig {
  destination?: string;
}

interface BlockTemplate {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  layout: string;
  columns: Column[];
}

interface Block {
  id?: string;
  _id?: string;
  name: string;
  template: BlockTemplate | null;
  order: number;
  isVisible: boolean;
  config?: BlockConfig;
  content?: unknown[];
}

function getId(item: { id?: string; _id?: string }): string {
  return item.id || item._id || '';
}

function getDestLabel(val: string): string {
  const found = DESTINATIONS.find(d => d.value === val?.toLowerCase());
  return found ? found.label : (val ? val.charAt(0).toUpperCase() + val.slice(1) : 'General');
}

function getColTypeIcon(type: string) {
  switch (type) {
    case 'Multimedia': return <MonitorPlay className="w-5 h-5 text-blue-400" />;
    case 'Publicidad': return <Megaphone className="w-5 h-5 text-yellow-500" />;
    case 'Playlist de Videos': return <MonitorPlay className="w-5 h-5 text-purple-500" />;
    default: return <BookOpen className="w-5 h-5 text-blue-400" />;
  }
}

function getLayoutPreview(template: BlockTemplate | null) {
  if (!template) {
    return (
      <div className="mt-2 rounded-lg bg-gray-100 p-3 flex items-center justify-center text-xs text-gray-400 h-14">
        Sin plantilla asignada
      </div>
    );
  }
  const cols = template.columns || [];
  const layout = template.layout || '';
  if (layout === 'Full-width' || cols.length === 1) {
    return (
      <div className="mt-2 rounded-lg bg-gray-100 p-3 flex items-center justify-center text-xs text-gray-500 font-medium h-14">
        {cols[0]?.type || 'Noticia'}
      </div>
    );
  }
  if (layout.startsWith('Hero')) {
    return (
      <div className="mt-2 flex gap-2">
        <div className="flex-1 rounded-lg bg-gray-100 p-2 flex items-center justify-center text-xs text-gray-500 font-medium" style={{ minHeight: '3.5rem' }}>
          {cols[0]?.type || 'Noticia'}
        </div>
        <div className="w-1/3 flex flex-col gap-1.5">
          {cols.slice(1).map((c, i) => (
            <div key={i} className="rounded-lg bg-gray-100 p-2 flex items-center justify-center text-xs text-gray-500 font-medium flex-1">
              {c.type}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-2 flex gap-2">
      {cols.map((col, i) => (
        <div key={i} className="flex-1 rounded-lg bg-gray-100 p-2 flex items-center justify-center text-xs text-gray-500 font-medium" style={{ minHeight: '3rem' }}>
          {col.type}
        </div>
      ))}
    </div>
  );
}

function getLayoutIcon(layout: string) {
  if (!layout || layout === 'Full-width') return <AlignLeft className="w-5 h-5 text-blue-700" />;
  if (layout === '4 Cols') return <LayoutGrid className="w-5 h-5 text-blue-700" />;
  return <Columns2 className="w-5 h-5 text-blue-700" />;
}

// ---- Content Modal ----
interface ContentModalProps {
  block: Block;
  onClose: () => void;
  onSave: (destination: string) => void;
}

function ContentModal({ block, onClose, onSave }: ContentModalProps) {
  const currentDest = block.config?.destination || 'general';
  const [destination, setDestination] = useState(currentDest);
  const cols = block.template?.columns || [];

  const getSlotLabel = (idx: number, total: number, layout: string) => {
    if (total === 1) return 'PRINCIPAL';
    if (layout?.startsWith('Hero')) {
      if (idx === 0) return 'PRINCIPAL (2/3)';
      return `SECUNDARIO ${idx}`;
    }
    if (idx === 0) return 'PRINCIPAL';
    return `SECUNDARIO ${idx}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Editor de Contenido de Instancia</h2>
            <p className="text-sm text-gray-500 mt-1">
              Asigna el contenido específico para "{block.name}" en la portada.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg ml-4 flex-shrink-0">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-6 pb-4 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Destino del Contenido</label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {DESTINATIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Define de qué sección del diario se alimentará este bloque.
            </p>
          </div>
          {cols.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Previsualización y Asignación de Contenido
              </label>
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(cols.length, 3)}, 1fr)` }}>
                  {cols.map((col, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col items-center gap-2 min-h-24">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                        {getSlotLabel(idx, cols.length, block.template?.layout || '')}
                      </span>
                      <div className="flex-1 flex flex-col items-center justify-center gap-1">
                        {getColTypeIcon(col.type)}
                        <span className="text-xs font-medium text-gray-700 text-center">Contenido de {col.type}</span>
                        <span className="text-[10px] text-blue-500 text-center">
                          Desde Destino: "{getDestLabel(destination)}" ℹ️
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { onSave(destination); onClose(); }}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function LayoutPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [contentModal, setContentModal] = useState<Block | null>(null);
  
  // Drag state for block reorder (right panel)
  const dragBlockIdx = useRef<number | null>(null);
  const dragOverBlockIdx = useRef<number | null>(null);
  
  // Drag state for template-to-layout (left panel → right panel)
  const dragTemplateId = useRef<string | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
  const [isDraggingTemplate, setIsDraggingTemplate] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([
        fetch(API + '/blocks?limit=100', { headers: getHeaders() }),
        fetch(API + '/block-templates?limit=100', { headers: getHeaders() }),
      ]);
      const bData = await bRes.json();
      const tData = await tRes.json();
      const sorted = (bData.blocks || []).sort((a: Block, b: Block) => a.order - b.order);
      setBlocks(sorted);
      setTemplates(tData.templates || []);
    } catch {
      setBlocks([]);
      setTemplates([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Add template at a specific position (default: end)
  const addTemplateAtPosition = async (tmpl: BlockTemplate, insertAfterIdx?: number) => {
    const insertAt = insertAfterIdx !== undefined ? insertAfterIdx + 1 : blocks.length;
    // Shift orders for blocks after insertion point
    const newOrder = insertAt + 1;
    const body = {
      name: tmpl.name,
      template: getId(tmpl),
      order: newOrder,
      isVisible: true,
      config: { destination: 'general' },
      content: [],
    };
    await fetch(API + '/blocks', { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
    // Reorder the blocks after insertion to keep order consistent
    await fetchAll();
    // Re-sort and fix orders if needed
  };

  const deleteBlock = async (block: Block) => {
    if (!confirm('¿Eliminar este bloque de la portada?')) return;
    await fetch(API + '/block/' + getId(block), { method: 'DELETE', headers: getHeaders() });
    fetchAll();
  };

  const handleSaveContent = async (block: Block, destination: string) => {
    await fetch(API + '/block/' + getId(block), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ config: { destination } }),
    });
    fetchAll();
  };

  const handleDestinationChange = async (block: Block, destination: string) => {
    await fetch(API + '/block/' + getId(block), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ config: { destination } }),
    });
    fetchAll();
  };

  // ---- Block reorder drag (right panel) ----
  const handleBlockDragStart = (idx: number) => {
    if (isDraggingTemplate) return;
    dragBlockIdx.current = idx;
  };
  const handleBlockDragEnter = (idx: number) => {
    if (isDraggingTemplate) return;
    dragOverBlockIdx.current = idx;
  };
  const handleBlockDrop = async () => {
    if (isDraggingTemplate) return;
    if (dragBlockIdx.current === null || dragOverBlockIdx.current === null) return;
    if (dragBlockIdx.current === dragOverBlockIdx.current) {
      dragBlockIdx.current = null; dragOverBlockIdx.current = null; return;
    }
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(dragBlockIdx.current, 1);
    newBlocks.splice(dragOverBlockIdx.current, 0, removed);
    dragBlockIdx.current = null; dragOverBlockIdx.current = null;
    setBlocks(newBlocks);
    for (let i = 0; i < newBlocks.length; i++) {
      await fetch(API + '/block/' + getId(newBlocks[i]), {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify({ order: i + 1 }),
      });
    }
  };

  // ---- Template drag to preview (left panel → right panel) ----
  const handleTemplateDragStart = (tmpl: BlockTemplate) => {
    dragTemplateId.current = getId(tmpl);
    setIsDraggingTemplate(true);
  };
  const handleTemplateDragEnd = () => {
    dragTemplateId.current = null;
    setIsDraggingTemplate(false);
    setDropTargetIdx(null);
  };
  
  // Drop zone: before each block and after the last
  const handleDropZoneDragOver = (e: React.DragEvent, idx: number) => {
    if (!isDraggingTemplate) return;
    e.preventDefault();
    setDropTargetIdx(idx);
  };
  const handleDropZoneDrop = async (e: React.DragEvent, insertBeforeIdx: number) => {
    e.preventDefault();
    if (!isDraggingTemplate || !dragTemplateId.current) return;
    const tmpl = templates.find(t => getId(t) === dragTemplateId.current);
    if (!tmpl) return;
    setDropTargetIdx(null);
    setIsDraggingTemplate(false);
    
    // Insert before insertBeforeIdx → after (insertBeforeIdx - 1)
    const insertAfterIdx = insertBeforeIdx - 1;
    await addTemplateAtPosition(tmpl, insertAfterIdx >= 0 ? insertAfterIdx : undefined);
  };
  const handlePreviewDragOver = (e: React.DragEvent) => {
    if (!isDraggingTemplate) return;
    e.preventDefault();
  };
  const handlePreviewDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingTemplate || !dragTemplateId.current) return;
    const tmpl = templates.find(t => getId(t) === dragTemplateId.current);
    if (!tmpl) return;
    setDropTargetIdx(null);
    setIsDraggingTemplate(false);
    await addTemplateAtPosition(tmpl);
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editor de Portada</h1>
          <p className="text-sm text-gray-500 mt-1">
            Arrastra, suelta y organiza las instancias de bloques para construir la página principal.
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* ---- Left panel: Templates ---- */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4">
                <h2 className="text-base font-bold text-gray-900 mb-3">Plantillas de Bloque</h2>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar plantilla..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
              </div>
              <div className="overflow-y-auto px-3 pb-3" style={{ maxHeight: '60vh' }}>
                <div className="space-y-1.5">
                  {filteredTemplates.map(t => {
                    const tid = getId(t);
                    return (
                      <div
                        key={tid}
                        draggable
                        onDragStart={() => handleTemplateDragStart(t)}
                        onDragEnd={handleTemplateDragEnd}
                        onClick={() => addTemplateAtPosition(t)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-150 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors group cursor-grab active:cursor-grabbing select-none"
                      >
                        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                          {getLayoutIcon(t.layout)}
                        </div>
                        <span className="text-sm font-medium text-gray-800 flex-1 truncate">{t.name}</span>
                        <Pencil className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={() => router.push('/dashboard/blocks')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Plantilla
                </button>
              </div>
            </div>
          </div>

          {/* ---- Right panel: Preview ---- */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Previsualización de la Portada</h2>
                {isDraggingTemplate && (
                  <p className="text-xs text-blue-500 mt-1">Suelta la plantilla en la posición deseada</p>
                )}
              </div>
              <div className="p-5">
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50 min-h-64"
                  onDragOver={handlePreviewDragOver}
                  onDrop={handlePreviewDrop}
                >
                  {blocks.length === 0 ? (
                    <div
                      className={`flex flex-col items-center justify-center py-16 text-gray-400 rounded-xl transition-colors ${isDraggingTemplate ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
                      onDragOver={e => { if (isDraggingTemplate) e.preventDefault(); }}
                      onDrop={handlePreviewDrop}
                    >
                      <FileText className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="font-medium text-gray-500">
                        {isDraggingTemplate ? 'Suelta aquí para agregar' : 'No hay bloques en la portada'}
                      </p>
                      <p className="text-sm">
                        {isDraggingTemplate ? '' : 'Haz clic o arrastra una plantilla para agregarla'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {/* Drop zone BEFORE first block */}
                      <div
                        className={`h-2 rounded-lg transition-all duration-150 ${dropTargetIdx === 0 && isDraggingTemplate ? 'h-10 bg-blue-100 border-2 border-dashed border-blue-400 flex items-center justify-center' : ''}`}
                        onDragOver={e => handleDropZoneDragOver(e, 0)}
                        onDrop={e => handleDropZoneDrop(e, 0)}
                      >
                        {dropTargetIdx === 0 && isDraggingTemplate && (
                          <span className="text-xs text-blue-500 font-medium">Insertar aquí</span>
                        )}
                      </div>

                      {blocks.map((block, idx) => {
                        const bid = getId(block);
                        const currentDest = block.config?.destination || 'general';
                        return (
                          <div key={bid}>
                            <div
                              draggable={!isDraggingTemplate}
                              onDragStart={() => handleBlockDragStart(idx)}
                              onDragEnter={() => handleBlockDragEnter(idx)}
                              onDragEnd={handleBlockDrop}
                              onDragOver={e => { if (!isDraggingTemplate) e.preventDefault(); }}
                              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                            >
                              <div className="flex items-center gap-2 px-3 py-3">
                                <div className={`cursor-grab active:cursor-grabbing p-1 -ml-1 flex-shrink-0 ${isDraggingTemplate ? 'opacity-30' : ''}`}>
                                  <GripVertical className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                                  {block.template ? getLayoutIcon(block.template.layout) : <FileText className="w-4 h-4 text-gray-400" />}
                                </div>
                                <div className="flex-1">
                                  <select
                                    value={currentDest}
                                    onChange={e => handleDestinationChange(block, e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                                  >
                                    {DESTINATIONS.map(d => (
                                      <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  onClick={() => setContentModal(block)}
                                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Cont.
                                </button>
                                <button
                                  onClick={() => deleteBlock(block)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                </button>
                              </div>
                              <div className="px-3 pb-3">
                                {getLayoutPreview(block.template)}
                              </div>
                            </div>

                            {/* Drop zone AFTER this block */}
                            <div
                              className={`h-2 rounded-lg transition-all duration-150 mt-1 ${dropTargetIdx === idx + 1 && isDraggingTemplate ? 'h-10 bg-blue-100 border-2 border-dashed border-blue-400 flex items-center justify-center' : ''}`}
                              onDragOver={e => handleDropZoneDragOver(e, idx + 1)}
                              onDrop={e => handleDropZoneDrop(e, idx + 1)}
                            >
                              {dropTargetIdx === idx + 1 && isDraggingTemplate && (
                                <span className="text-xs text-blue-500 font-medium">Insertar aquí</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {contentModal && (
        <ContentModal
          block={contentModal}
          onClose={() => setContentModal(null)}
          onSave={(dest) => handleSaveContent(contentModal, dest)}
        />
      )}
    </div>
  );
}
