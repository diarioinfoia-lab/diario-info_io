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
  'General',
  'Principal',
  'Deportes',
  'Economia',
  'Politica',
  'Cultura',
  'Tecnologia',
  'Internacional',
  'Sociedad',
  'Especial',
];

interface Column {
  type: string;
}

interface BlockTemplate {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  layout: string;
  columns: Column[];
}

interface BlockContent {
  destination: string;
}

interface Block {
  id?: string;
  _id?: string;
  name: string;
  template: BlockTemplate | null;
  order: number;
  isVisible: boolean;
  content: BlockContent[];
}

function getId(item: { id?: string; _id?: string }): string {
  return item.id || item._id || '';
}

function getColTypeIcon(type: string) {
  switch(type) {
    case 'Multimedia': return <MonitorPlay className="w-5 h-5 text-blue-400" />;
    case 'Publicidad': return <Megaphone className="w-5 h-5 text-yellow-500" />;
    case 'Playlist de Videos': return <MonitorPlay className="w-5 h-5 text-purple-500" />;
    default: return <BookOpen className="w-5 h-5 text-blue-400" />;
  }
}

function getLayoutPreview(template: BlockTemplate | null) {
  if (!template) {
    return (
      <div className="mt-3 rounded-lg bg-gray-100 p-3 flex items-center justify-center text-xs text-gray-400 h-16">
        Sin plantilla asignada
      </div>
    );
  }
  const cols = template.columns || [];
  const layout = template.layout || '';
  
  if (layout === 'Full-width' || cols.length === 1) {
    return (
      <div className="mt-3 rounded-lg bg-gray-100 p-3 flex items-center justify-center text-xs text-gray-500 font-medium h-16">
        {cols[0]?.type || 'Noticia'}
      </div>
    );
  }
  
  if (layout.startsWith('Hero')) {
    return (
      <div className="mt-3 flex gap-2">
        <div className="flex-1 rounded-lg bg-gray-100 p-2 flex items-center justify-center text-xs text-gray-500 font-medium" style={{minHeight:'4rem'}}>
          {cols[0]?.type || 'Noticia'}
        </div>
        <div className="w-1/3 flex flex-col gap-2">
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
    <div className="mt-3 flex gap-2">
      {cols.map((col, i) => (
        <div key={i} className="flex-1 rounded-lg bg-gray-100 p-2 flex items-center justify-center text-xs text-gray-500 font-medium" style={{minHeight:'3.5rem'}}>
          {col.type}
        </div>
      ))}
    </div>
  );
}

function getLayoutIcon(layout: string) {
  if (!layout || layout === 'Full-width') return <AlignLeft className="w-4 h-4 text-blue-700" />;
  if (layout === '4 Cols') return <LayoutGrid className="w-4 h-4 text-blue-700" />;
  if (layout.startsWith('Hero')) return <Columns2 className="w-4 h-4 text-blue-700" />;
  return <Columns2 className="w-4 h-4 text-blue-700" />;
}

function getSmallLayoutIcon(layout: string) {
  if (!layout || layout === 'Full-width') return <AlignLeft className="w-5 h-5 text-blue-700" />;
  if (layout === '4 Cols') return <LayoutGrid className="w-5 h-5 text-blue-700" />;
  return <Columns2 className="w-5 h-5 text-blue-700" />;
}

interface ContentModalProps {
  block: Block;
  onClose: () => void;
  onSave: (destination: string) => void;
}

function ContentModal({ block, onClose, onSave }: ContentModalProps) {
  const [destination, setDestination] = useState(
    block.content?.[0]?.destination || DESTINATIONS[0]
  );
  const cols = block.template?.columns || [];

  const getSlotLabel = (idx: number, total: number, layout: string) => {
    if (total === 1) return 'PRINCIPAL';
    if (layout?.startsWith('Hero')) {
      if (idx === 0) return `PRINCIPAL (2/3)`;
      return `SECUNDARIO ${idx}`;
    }
    if (idx === 0) return `PRINCIPAL`;
    return `SECUNDARIO ${idx}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
        {/* Header */}
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

        {/* Body */}
        <div className="px-6 pb-4 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Destino del Contenido
            </label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
              style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '2.5rem'}}
            >
              {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
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
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: cols.length <= 2
                      ? `repeat(${cols.length}, 1fr)`
                      : `repeat(${Math.min(cols.length, 3)}, 1fr)`,
                  }}
                >
                  {cols.map((col, idx) => {
                    const layout = block.template?.layout || '';
                    const label = getSlotLabel(idx, cols.length, layout);
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col items-center gap-2 min-h-24"
                      >
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                          {label}
                        </span>
                        <div className="flex-1 flex flex-col items-center justify-center gap-1">
                          {getColTypeIcon(col.type)}
                          <span className="text-xs font-medium text-gray-700 text-center">
                            Contenido de {col.type}
                          </span>
                          <span className="text-[10px] text-gray-400 text-center">
                            Desde Destino: "{destination}" ℹ️
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
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

export default function LayoutPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [contentModal, setContentModal] = useState<Block | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

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

  const addTemplateToLayout = async (tmpl: BlockTemplate) => {
    const order = blocks.length + 1;
    const body = {
      name: tmpl.name,
      template: getId(tmpl),
      order,
      isVisible: true,
      content: (tmpl.columns || [{ type: 'Noticia' }]).map(() => ({ destination: DESTINATIONS[0] })),
    };
    await fetch(API + '/blocks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    fetchAll();
  };

  const deleteBlock = async (block: Block) => {
    if (!confirm('¿Eliminar este bloque de la portada?')) return;
    await fetch(API + '/block/' + getId(block), { method: 'DELETE', headers: getHeaders() });
    fetchAll();
  };

  const handleDragStart = (idx: number) => { dragItem.current = idx; };
  const handleDragEnter = (idx: number) => { dragOver.current = idx; };

  const handleDrop = async () => {
    if (dragItem.current === null || dragOver.current === null) return;
    if (dragItem.current === dragOver.current) { dragItem.current = null; dragOver.current = null; return; }
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(dragItem.current, 1);
    newBlocks.splice(dragOver.current, 0, removed);
    dragItem.current = null;
    dragOver.current = null;
    setBlocks(newBlocks);
    for (let i = 0; i < newBlocks.length; i++) {
      await fetch(API + '/block/' + getId(newBlocks[i]), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ order: i + 1 }),
      });
    }
  };

  const handleSaveContent = async (block: Block, destination: string) => {
    setSaving(getId(block));
    const newContent = (block.template?.columns || [{ type: 'Noticia' }]).map(() => ({ destination }));
    await fetch(API + '/block/' + getId(block), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ content: newContent }),
    });
    setSaving(null);
    fetchAll();
  };

  const handleDestinationChange = async (block: Block, destination: string) => {
    const newContent = (block.template?.columns || [{ type: 'Noticia' }]).map(() => ({ destination }));
    await fetch(API + '/block/' + getId(block), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ content: newContent }),
    });
    fetchAll();
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

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">
          {/* Left panel: Templates */}
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

              {/* Template list with internal scroll */}
              <div className="overflow-y-auto px-3 pb-3" style={{maxHeight: '60vh'}}>
                <div className="space-y-1.5">
                  {filteredTemplates.map(t => {
                    const tid = getId(t);
                    return (
                      <button
                        key={tid}
                        onClick={() => addTemplateToLayout(t)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-150 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors group text-left"
                      >
                        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                          {getSmallLayoutIcon(t.layout)}
                        </div>
                        <span className="text-sm font-medium text-gray-800 flex-1 truncate">{t.name}</span>
                        <Pencil className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nueva Plantilla button */}
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

          {/* Right panel: Preview */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Previsualización de la Portada</h2>
              </div>

              <div className="p-5">
                {/* Dashed container */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50 min-h-64">
                  {blocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <FileText className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="font-medium text-gray-500">No hay bloques en la portada</p>
                      <p className="text-sm">Haz clic en una plantilla para agregarla</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blocks.map((block, idx) => {
                        const bid = getId(block);
                        const currentDest = block.content?.[0]?.destination || DESTINATIONS[0];
                        return (
                          <div
                            key={bid}
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragEnter={() => handleDragEnter(idx)}
                            onDragEnd={handleDrop}
                            onDragOver={e => e.preventDefault()}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                          >
                            {/* Block header row */}
                            <div className="flex items-center gap-2 px-3 py-3">
                              {/* Drag handle */}
                              <div className="cursor-grab active:cursor-grabbing p-1 -ml-1 flex-shrink-0">
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>

                              {/* Layout icon */}
                              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                                {block.template ? getSmallLayoutIcon(block.template.layout) : <FileText className="w-4 h-4 text-gray-400" />}
                              </div>

                              {/* Destination dropdown */}
                              <div className="flex-1">
                                <select
                                  value={currentDest}
                                  onChange={e => handleDestinationChange(block, e.target.value)}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none font-medium"
                                  style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '2rem'}}
                                >
                                  {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </div>

                              {/* Cont. button */}
                              <button
                                onClick={() => setContentModal(block)}
                                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Cont.
                              </button>

                              {/* Delete button */}
                              <button
                                onClick={() => deleteBlock(block)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                title="Eliminar bloque"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                              </button>
                            </div>

                            {/* Layout visual preview */}
                            <div className="px-3 pb-3">
                              {getLayoutPreview(block.template)}
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

      {/* Content Modal */}
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
