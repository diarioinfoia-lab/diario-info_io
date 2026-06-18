'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GripVertical, Pencil, Trash2, X, Search, Plus, AlignLeft, Columns2, LayoutGrid, BookOpen, MonitorPlay, Megaphone, FileText, Save, ChevronDown } from 'lucide-react';
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

// Destinos: coinciden con el formulario de Noticias
const DESTINATIONS = [
  { value: 'general',            label: 'General' },
  { value: 'analisis',           label: 'Analisis' },
  { value: 'especial',           label: 'Especial' },
  { value: 'ultimomomento',      label: 'Ultimo Momento' },
  { value: 'tuayllu',            label: 'TuAyllu' },
  { value: 'mundial2026',        label: 'Argentina en el Mundial 2026' },
  { value: 'charlycarabajal',    label: 'La Columna de Charly Carabajal' },
  { value: 'juanmanuelmartinez', label: 'La Columna de Juan Manuel Martinez' },
  { value: 'hockey',             label: 'Federacion Santiaguena de Hockey' },
];

// Colores por destino - replicados del original ia.diarioinfo.com
const DEST_COLORS: Record<string, string> = {
  general:            'bg-white border-gray-200',
  analisis:           'bg-gradient-to-br from-blue-500 to-indigo-700 border-blue-700',
  especial:           'bg-gradient-to-br from-purple-500 to-fuchsia-700 border-purple-700',
  ultimomomento:      'bg-gradient-to-br from-red-500 to-red-700 border-red-700',
  tuayllu:            'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600',
  mundial2026:        'bg-gradient-to-r from-[#74ACDF] via-white to-[#74ACDF] border-[#74ACDF]',
  charlycarabajal:    'bg-gradient-to-br from-[#B87333] to-[#A45A52] border-[#B87333]',
  juanmanuelmartinez: 'bg-gradient-to-br from-[#005B96] to-[#4E595D] border-[#005B96]',
  hockey:             'bg-gradient-to-br from-[#163E85] to-[#B71C2B] border-[#C79A1B]',
};

function getDestColorClass(dest: string): string {
  return DEST_COLORS[(dest || 'general').toLowerCase()] || DEST_COLORS.general;
}

function isColoredDest(dest: string): boolean {
  return (dest || 'general').toLowerCase() !== 'general';
}

interface Column { type: string; }
interface BlockConfig { destination?: string; }
interface BlockTemplate {
  id?: string; _id?: string;
  name: string; code: string; layout: string; columns: Column[];
}
interface Block {
  id?: string; _id?: string;
  name: string;
  template: BlockTemplate | null;
  order: number;
  isVisible: boolean;
  config?: BlockConfig;
  content?: unknown[];
  _tempId?: string; // for optimistic new blocks
}

function getId(item: { id?: string; _id?: string }): string {
  return item.id || item._id || '';
}

function getDestLabel(val: string): string {
  const found = DESTINATIONS.find(d => d.value === (val || 'general').toLowerCase());
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

function getLayoutPreview(template: BlockTemplate | null, colored: boolean) {
  const bg = colored ? 'bg-white/20' : 'bg-gray-100';
  const text = colored ? 'text-white/80' : 'text-gray-500';
  if (!template) {
    return (
      <div className={`mt-2 rounded-lg ${bg} p-3 flex items-center justify-center text-xs ${text} h-14`}>
        Sin plantilla asignada
      </div>
    );
  }
  const cols = template.columns || [];
  const layout = template.layout || '';
  if (layout === 'Full-width' || cols.length === 1) {
    return (
      <div className={`mt-2 rounded-lg ${bg} p-3 flex items-center justify-center text-xs ${text} font-medium h-14`}>
        {cols[0]?.type || 'Noticia'}
      </div>
    );
  }
  if (layout.startsWith('Hero')) {
    return (
      <div className="mt-2 flex gap-2">
        <div className={`flex-1 rounded-lg ${bg} p-2 flex items-center justify-center text-xs ${text} font-medium`} style={{ minHeight: '3.5rem' }}>
          {cols[0]?.type || 'Noticia'}
        </div>
        <div className="w-1/3 flex flex-col gap-1.5">
          {cols.slice(1).map((c, i) => (
            <div key={i} className={`rounded-lg ${bg} p-2 flex items-center justify-center text-xs ${text} font-medium flex-1`}>{c.type}</div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-2 flex gap-2">
      {cols.map((col, i) => (
        <div key={i} className={`flex-1 rounded-lg ${bg} p-2 flex items-center justify-center text-xs ${text} font-medium`} style={{ minHeight: '3rem' }}>
          {col.type}
        </div>
      ))}
    </div>
  );
}

function getLayoutIcon(layout: string, white = false) {
  const cls = white ? 'w-4 h-4 text-white' : 'w-5 h-5 text-blue-700';
  if (!layout || layout === 'Full-width') return <AlignLeft className={cls} />;
  if (layout === '4 Cols') return <LayoutGrid className={cls} />;
  return <Columns2 className={cls} />;
}

// Custom destination selector - shows colored badge, native select underneath for accessibility
interface DestSelectProps {
  value: string;
  colored: boolean;
  onChange: (val: string) => void;
}
function DestSelect({ value, colored, onChange }: DestSelectProps) {
  const label = getDestLabel(value);
  return (
    <div className="relative flex-1">
      {/* Visual badge layer */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-medium pointer-events-none select-none ${colored ? 'bg-white/20 border-white/30 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <span className="truncate">{label}</span>
        <ChevronDown className={`w-4 h-4 ml-1 flex-shrink-0 ${colored ? 'text-white/70' : 'text-gray-400'}`} />
      </div>
      {/* Real select on top - transparent, full coverage */}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ fontSize: '16px' }}
      >
        {DESTINATIONS.map(d => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>
    </div>
  );
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
            <p className="text-sm text-gray-500 mt-1">Asigna el contenido especifico para "{block.name}" en la portada.</p>
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
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DESTINATIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Define de que seccion del diario se alimentara este bloque.</p>
          </div>
          {cols.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Previsualizacion y Asignacion de Contenido</label>
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
                        <span className="text-[10px] text-blue-500 text-center">Desde: "{getDestLabel(destination)}"</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
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
  const [saving, setSaving] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Drag state for block reorder
  const dragBlockIdx = useRef<number | null>(null);
  const dragOverBlockIdx = useRef<number | null>(null);
  // Drag state for template-to-preview
  const dragTemplateId = useRef<string | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
  const [isDraggingTemplate, setIsDraggingTemplate] = useState(false);

  // Initial load only
  const fetchAll = useCallback(async () => {
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
      setBlocks([]); setTemplates([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ---- Optimistic destination change (no refresh) ----
  const handleDestinationChange = (block: Block, destination: string) => {
    const bid = getId(block);
    // Update local state immediately - no fetchAll
    setBlocks(prev => prev.map(b => getId(b) === bid ? { ...b, config: { ...b.config, destination } } : b));
    setHasPendingChanges(true);
    // Save to API in background
    fetch(API + '/block/' + bid, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ config: { destination } }),
    }).catch(() => {/* silently ignore, will retry on save */});
  };

  // ---- Add template at position (optimistic) ----
  const addTemplateAtPosition = async (tmpl: BlockTemplate, insertAtIdx?: number) => {
    const posIdx = insertAtIdx !== undefined ? insertAtIdx : blocks.length;
    const tempId = 'temp-' + Date.now();

    // Build optimistic block
    const optimisticBlock: Block = {
      _tempId: tempId,
      name: tmpl.name,
      template: tmpl,
      order: posIdx + 1,
      isVisible: true,
      config: { destination: 'general' },
      content: [],
    };

    // Insert into local state immediately
    setBlocks(prev => {
      const newBlocks = [...prev];
      newBlocks.splice(posIdx, 0, optimisticBlock);
      return newBlocks.map((b, i) => ({ ...b, order: i + 1 }));
    });
    setHasPendingChanges(true);

    // Shift existing blocks orders and create new one in background
    const blocksToShift = blocks.slice(posIdx);
    for (const b of blocksToShift) {
      fetch(API + '/block/' + getId(b), {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify({ order: b.order + 1 }),
      }).catch(() => {});
    }

    const body = {
      name: tmpl.name,
      template: getId(tmpl),
      order: posIdx + 1,
      isVisible: true,
      config: { destination: 'general' },
      content: [],
    };
    try {
      const res = await fetch(API + '/blocks', { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      const realBlock = data.block || data;
      // Replace temp block with real one
      setBlocks(prev => prev.map(b => b._tempId === tempId ? { ...realBlock, template: tmpl } : b));
    } catch {
      // Remove temp block on error
      setBlocks(prev => prev.filter(b => b._tempId !== tempId));
    }
  };

  // ---- Delete block (optimistic) ----
  const deleteBlock = async (block: Block) => {
    if (!confirm('Eliminar este bloque de la portada?')) return;
    const bid = getId(block);
    // Remove locally immediately
    setBlocks(prev => prev.filter(b => getId(b) !== bid));
    setHasPendingChanges(true);
    // Delete in background
    fetch(API + '/block/' + bid, { method: 'DELETE', headers: getHeaders() }).catch(() => {});
  };

  // ---- Save content from modal (optimistic) ----
  const handleSaveContent = (block: Block, destination: string) => {
    const bid = getId(block);
    setBlocks(prev => prev.map(b => getId(b) === bid ? { ...b, config: { ...b.config, destination } } : b));
    setHasPendingChanges(true);
    fetch(API + '/block/' + bid, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ config: { destination } }),
    }).catch(() => {});
  };

  // ---- Publish all changes ----
  const handleSaveAll = async () => {
    setSaving(true);
    for (let i = 0; i < blocks.length; i++) {
      const bid = getId(blocks[i]);
      if (!bid) continue;
      await fetch(API + '/block/' + bid, {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify({ order: i + 1 }),
      });
    }
    setSaving(false);
    setHasPendingChanges(false);
    alert('Portada publicada correctamente.');
  };

  // ---- Block reorder drag ----
  const handleBlockDragStart = (idx: number) => {
    if (isDraggingTemplate) return;
    dragBlockIdx.current = idx;
  };
  const handleBlockDragEnter = (idx: number) => {
    if (isDraggingTemplate) return;
    dragOverBlockIdx.current = idx;
  };
  const handleBlockDrop = () => {
    if (isDraggingTemplate) return;
    if (dragBlockIdx.current === null || dragOverBlockIdx.current === null) return;
    if (dragBlockIdx.current === dragOverBlockIdx.current) {
      dragBlockIdx.current = null; dragOverBlockIdx.current = null; return;
    }
    const from = dragBlockIdx.current, to = dragOverBlockIdx.current;
    dragBlockIdx.current = null; dragOverBlockIdx.current = null;
    // Optimistic reorder
    setBlocks(prev => {
      const newBlocks = [...prev];
      const [removed] = newBlocks.splice(from, 1);
      newBlocks.splice(to, 0, removed);
      return newBlocks.map((b, i) => ({ ...b, order: i + 1 }));
    });
    setHasPendingChanges(true);
    // Save new orders in background
    setBlocks(prev => {
      for (let i = 0; i < prev.length; i++) {
        const bid = getId(prev[i]);
        if (bid) fetch(API + '/block/' + bid, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ order: i + 1 }) }).catch(() => {});
      }
      return prev;
    });
  };

  // ---- Template drag to preview ----
  const handleTemplateDragStart = (tmpl: BlockTemplate) => {
    dragTemplateId.current = getId(tmpl);
    setIsDraggingTemplate(true);
  };
  const handleTemplateDragEnd = () => {
    dragTemplateId.current = null;
    setIsDraggingTemplate(false);
    setDropTargetIdx(null);
  };
  const handleDropZoneDragOver = (e: React.DragEvent, idx: number) => {
    if (!isDraggingTemplate) return;
    e.preventDefault(); e.stopPropagation();
    setDropTargetIdx(idx);
  };
  const handleDropZoneDrop = async (e: React.DragEvent, insertAtIdx: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!isDraggingTemplate || !dragTemplateId.current) return;
    const tmpl = templates.find(t => getId(t) === dragTemplateId.current);
    if (!tmpl) return;
    setDropTargetIdx(null); setIsDraggingTemplate(false); dragTemplateId.current = null;
    await addTemplateAtPosition(tmpl, insertAtIdx);
  };
  const handlePreviewDragOver = (e: React.DragEvent) => { if (isDraggingTemplate) e.preventDefault(); };
  const handlePreviewDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingTemplate || !dragTemplateId.current) return;
    const tmpl = templates.find(t => getId(t) === dragTemplateId.current);
    if (!tmpl) return;
    setDropTargetIdx(null); setIsDraggingTemplate(false); dragTemplateId.current = null;
    await addTemplateAtPosition(tmpl);
  };

  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

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
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor de Portada</h1>
            <p className="text-sm text-gray-500 mt-1">Arrastra, suelta y organiza las instancias de bloques para construir la pagina principal.</p>
          </div>
          {hasPendingChanges && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Publicando...' : 'Publicar Portada'}
            </button>
          )}
        </div>

        {hasPendingChanges && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-center gap-2">
            <span className="font-semibold">Cambios pendientes:</span> Los cambios se publicaran al hacer clic en "Publicar Portada". La portada en vivo no se ha modificado aun.
          </div>
        )}

        <div className="flex gap-6 items-start">
          {/* Left panel */}
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
                        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">{getLayoutIcon(t.layout)}</div>
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

          {/* Right panel: Preview */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Previsualizacion de la Portada</h2>
                {isDraggingTemplate && <p className="text-xs text-blue-500 mt-1">Suelta la plantilla en la posicion deseada</p>}
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
                      onDrop={e => { e.stopPropagation(); handlePreviewDrop(e); }}
                    >
                      <FileText className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="font-medium text-gray-500">{isDraggingTemplate ? 'Suelta aqui para agregar' : 'No hay bloques en la portada'}</p>
                      <p className="text-sm">{isDraggingTemplate ? '' : 'Haz clic o arrastra una plantilla para agregarla'}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {/* Drop zone before first block */}
                      <div
                        className={`rounded-lg transition-all duration-150 ${dropTargetIdx === 0 && isDraggingTemplate ? 'h-10 bg-blue-100 border-2 border-dashed border-blue-400 flex items-center justify-center' : 'h-2'}`}
                        onDragOver={e => handleDropZoneDragOver(e, 0)}
                        onDrop={e => handleDropZoneDrop(e, 0)}
                      >
                        {dropTargetIdx === 0 && isDraggingTemplate && <span className="text-xs text-blue-500 font-medium">Insertar aqui</span>}
                      </div>

                      {blocks.map((block, idx) => {
                        const bid = getId(block) || block._tempId || '';
                        const currentDest = (block.config?.destination || 'general').toLowerCase();
                        const colored = isColoredDest(currentDest);
                        const colorClass = getDestColorClass(currentDest);
                        const textClass = colored ? 'text-white' : 'text-gray-900';
                        const isTemp = !!block._tempId && !block.id && !block._id;

                        return (
                          <div key={bid}>
                            <div
                              draggable={!isDraggingTemplate && !isTemp}
                              onDragStart={() => handleBlockDragStart(idx)}
                              onDragEnter={() => handleBlockDragEnter(idx)}
                              onDragEnd={handleBlockDrop}
                              onDragOver={e => { if (!isDraggingTemplate) e.preventDefault(); }}
                              className={`rounded-xl border shadow-sm overflow-hidden transition-colors duration-200 ${colorClass} ${isTemp ? 'opacity-70' : ''}`}
                            >
                              <div className="flex items-center gap-2 px-3 py-3">
                                <div className={`cursor-grab active:cursor-grabbing p-1 -ml-1 flex-shrink-0 ${isDraggingTemplate ? 'opacity-30' : ''}`}>
                                  <GripVertical className={`w-5 h-5 ${colored ? 'text-white/60' : 'text-gray-400'}`} />
                                </div>
                                <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${colored ? 'bg-white/20' : 'bg-gray-100'}`}>
                                  {block.template
                                    ? getLayoutIcon(block.template.layout, colored)
                                    : <FileText className={`w-4 h-4 ${colored ? 'text-white' : 'text-gray-400'}`} />}
                                </div>

                                {/* Custom destination selector */}
                                <DestSelect
                                  value={currentDest}
                                  colored={colored}
                                  onChange={val => handleDestinationChange(block, val)}
                                />

                                <button
                                  onClick={() => setContentModal(block)}
                                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${colored ? 'border-white/30 text-white hover:bg-white/20' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Cont.
                                </button>
                                <button
                                  onClick={() => deleteBlock(block)}
                                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${colored ? 'hover:bg-white/20' : 'hover:bg-red-50'}`}
                                >
                                  <Trash2 className={`w-4 h-4 ${colored ? 'text-white/70' : 'text-gray-400'}`} />
                                </button>
                              </div>
                              <div className="px-3 pb-3">
                                {getLayoutPreview(block.template, colored)}
                              </div>
                            </div>

                            {/* Drop zone after this block */}
                            <div
                              className={`rounded-lg transition-all duration-150 mt-1 ${dropTargetIdx === idx + 1 && isDraggingTemplate ? 'h-10 bg-blue-100 border-2 border-dashed border-blue-400 flex items-center justify-center' : 'h-2'}`}
                              onDragOver={e => handleDropZoneDragOver(e, idx + 1)}
                              onDrop={e => handleDropZoneDrop(e, idx + 1)}
                            >
                              {dropTargetIdx === idx + 1 && isDraggingTemplate && <span className="text-xs text-blue-500 font-medium">Insertar aqui</span>}
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
          onSave={dest => handleSaveContent(contentModal, dest)}
        />
      )}
    </div>
  );
}
