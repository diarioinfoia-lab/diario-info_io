'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, GripVertical, Edit2, Trash2, X, Plus, Save, AlignLeft, LayoutGrid, LayoutTemplate, Columns, ChevronDown, Eye, EyeOff } from 'lucide-react';

const API = 'https://api2.diarioinfo.com';

const DESTINATIONS = [
  'General', 'Analisis', 'Especial', 'Ultimo Momento', 'TuAyllu',
  'Argentina en el Mundial 2026', 'La Columna de Charly Carabajal',
  'La Columna de Juan Manuel Martinez', 'Federacion Santiaguena de Hockey'
];

interface BlockTemplate {
  id: string;
  name: string;
  code: string;
  layout: string;
  columns: { type: string }[];
}

interface LayoutBlock {
  id: string;
  name: string;
  template: BlockTemplate | null;
  order: number;
  isVisible: boolean;
  content: { destination?: string; articles?: string[] }[];
}

function layoutIcon(layout?: string) {
  if (!layout) return <LayoutGrid size={16} className="text-gray-400" />;
  if (layout.includes('Full')) return <AlignLeft size={16} className="text-rose-500" />;
  if (layout.includes('Hero')) return <LayoutTemplate size={16} className="text-purple-500" />;
  if (layout.includes('2')) return <Columns size={16} className="text-blue-500" />;
  if (layout.includes('3')) return <LayoutGrid size={16} className="text-green-500" />;
  return <LayoutGrid size={16} className="text-yellow-500" />;
}

function ContentModal({
  block,
  onClose,
  onSaved,
}: {
  block: LayoutBlock;
  onClose: () => void;
  onSaved: (destination: string) => void;
}) {
  const [destination, setDestination] = useState(block.content?.[0]?.destination || 'General');
  const [saving, setSaving] = useState(false);
  const cols = block.template?.columns || [];
  const layout = block.template?.layout || 'Full-width';

  const getColLabel = (idx: number) => {
    const labels: Record<string, string[]> = {
      'Hero (Principal Izquierda)': ['PRINCIPAL (2/3)', 'SECUNDARIO 1', 'SECUNDARIO 2'],
      'Hero (Principal Derecha)': ['SECUNDARIO 1', 'PRINCIPAL (2/3)', 'SECUNDARIO 2'],
    };
    return (labels[layout] || [])[idx] || ('COLUMNA ' + (idx + 1));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      await fetch(`${API}/block/${block.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: [{ destination }] })
      });
      onSaved(destination);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Editor de Contenido de Instancia</h2>
            <p className="text-xs text-gray-500 mt-0.5">Asigna el contenido especifico para "{block.template?.name || block.name}" en la portada.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destino del Contenido</label>
            <select value={destination} onChange={e => setDestination(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400">
              {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Define de que seccion del diario se alimentara este bloque.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Previsualizacion y Asignacion de Contenido</label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className={`grid gap-3 p-4 bg-gray-50 dark:bg-gray-800/50`} style={{gridTemplateColumns: cols.length <= 1 ? '1fr' : (layout.includes('Hero') ? '2fr 1fr' : `repeat(${cols.length}, 1fr)`)}}>
                {cols.map((col, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px]">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">{getColLabel(i)}</p>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-2">
                      <LayoutGrid size={20} className="text-blue-400" />
                    </div>
                    <p className="text-xs text-center text-gray-500 font-medium">Contenido de {col.type}</p>
                    <p className="text-xs text-center text-gray-400 mt-0.5">Desde Destino: "{destination}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LayoutPage() {
  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTemplate, setSearchTemplate] = useState('');
  const [contentEditBlock, setContentEditBlock] = useState<LayoutBlock | null>(null);
  const [toast, setToast] = useState<{msg: string; ok: boolean} | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragItemRef = useRef<LayoutBlock | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({msg, ok});
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    try {
      const [tRes, bRes] = await Promise.all([
        fetch(`${API}/block-templates?limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/blocks?limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [tData, bData] = await Promise.all([tRes.json(), bRes.json()]);
      setTemplates(tData.templates || tData.blockTemplates || []);
      const blist: LayoutBlock[] = bData.blocks || [];
      blist.sort((a, b) => (a.order || 0) - (b.order || 0));
      setBlocks(blist);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const addBlock = async (template: BlockTemplate) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    try {
      const r = await fetch(`${API}/blocks`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: template.name, template: template.id, order: blocks.length + 1, isVisible: true, content: [] })
      });
      if (!r.ok) throw new Error();
      showToast('Bloque agregado');
      loadData();
    } catch { showToast('Error al agregar bloque', false); }
  };

  const deleteBlock = async (block: LayoutBlock) => {
    if (!confirm('Eliminar este bloque de la portada?')) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    try {
      await fetch(`${API}/block/${block.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      showToast('Bloque eliminado');
      loadData();
    } catch { showToast('Error al eliminar', false); }
  };

  const toggleVisible = async (block: LayoutBlock) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    try {
      await fetch(`${API}/block/${block.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !block.isVisible })
      });
      setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, isVisible: !b.isVisible } : b));
    } catch { showToast('Error', false); }
  };

  // Drag & drop for blocks order
  const handleDragStart = (block: LayoutBlock) => {
    dragItemRef.current = block;
    setDragging(block.id);
  };
  const handleDragOver = (e: React.DragEvent, block: LayoutBlock) => {
    e.preventDefault();
    setDragOver(block.id);
  };
  const handleDrop = async (targetBlock: LayoutBlock) => {
    const dragBlock = dragItemRef.current;
    if (!dragBlock || dragBlock.id === targetBlock.id) {
      setDragging(null); setDragOver(null); return;
    }
    const newOrder = [...blocks];
    const fromIdx = newOrder.findIndex(b => b.id === dragBlock.id);
    const toIdx = newOrder.findIndex(b => b.id === targetBlock.id);
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragBlock);
    const updated = newOrder.map((b, i) => ({ ...b, order: i + 1 }));
    setBlocks(updated);
    setDragging(null); setDragOver(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    try {
      await Promise.all(updated.map(b =>
        fetch(`${API}/block/${b.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: b.order })
        })
      ));
      showToast('Orden actualizado');
    } catch { showToast('Error al reordenar', false); }
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const filteredTemplates = templates.filter(t =>
    !searchTemplate || t.name.toLowerCase().includes(searchTemplate.toLowerCase())
  );

  const getBlockDestination = (block: LayoutBlock) => block.content?.[0]?.destination || 'General';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editor de Portada</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Arrastra, suelta y organiza las instancias de bloques para construir la pagina principal.</p>
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-6">
        {/* Left: Templates panel */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 h-fit sticky top-6">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-2">Plantillas de Bloque</h2>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar plantilla..." value={searchTemplate} onChange={e => setSearchTemplate(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            {filteredTemplates.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  {layoutIcon(t.layout)}
                </div>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{t.name}</span>
                <button
                  onClick={() => addBlock(t)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded bg-rose-500 hover:bg-rose-600 text-white transition-opacity"
                  title="Agregar a portada"
                >
                  <Plus size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Preview panel */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Previsualizacion de la Portada</h2>
            <span className="text-xs text-gray-400">{blocks.length} bloques</span>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
            ) : blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <LayoutGrid size={48} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">No hay bloques en la portada</p>
                <p className="text-xs mt-1">Haz click en el + de una plantilla para agregarla.</p>
              </div>
            ) : (
              blocks.map(block => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => handleDragStart(block)}
                  onDragOver={e => handleDragOver(e, block)}
                  onDrop={() => handleDrop(block)}
                  onDragEnd={handleDragEnd}
                  className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all ${dragging === block.id ? 'opacity-50' : ''} ${dragOver === block.id ? 'border-blue-400 bg-blue-50/30' : ''}`}
                >
                  {/* Block header */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="cursor-grab text-gray-300 hover:text-gray-500">
                      <GripVertical size={15} />
                    </div>
                    <div className="w-7 h-7 rounded bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                      {layoutIcon(block.template?.layout)}
                    </div>
                    <select
                      value={getBlockDestination(block)}
                      onChange={async e => {
                        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
                        await fetch(`${API}/block/${block.id}`, {
                          method: 'PUT',
                          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ content: [{ destination: e.target.value }] })
                        });
                        setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: [{ destination: e.target.value }] } : b));
                      }}
                      className="flex-1 text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
                    >
                      {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button
                      onClick={() => setContentEditBlock(block)}
                      className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    >
                      <Edit2 size={11} />Cont.
                    </button>
                    <button onClick={() => toggleVisible(block)} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400" title={block.isVisible ? 'Ocultar' : 'Mostrar'}>
                      {block.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button onClick={() => deleteBlock(block)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {/* Block preview */}
                  <div className={`p-3 ${!block.isVisible ? 'opacity-40' : ''}`}>
                    {block.template ? (
                      <div
                        className="grid gap-2"
                        style={{gridTemplateColumns: (() => {
                          const l = block.template?.layout || '';
                          if (l.includes('Full')) return '1fr';
                          if (l === '2 Cols') return '1fr 1fr';
                          if (l === '3 Cols') return '1fr 1fr 1fr';
                          if (l === '4 Cols') return '1fr 1fr 1fr 1fr';
                          if (l.includes('Hero')) return '2fr 1fr';
                          return '1fr';
                        })()}}
                      >
                        {(block.template?.columns || []).map((col, i) => (
                          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-16 flex items-center justify-center">
                            <span className="text-xs text-gray-400">{col.type}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">{block.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {contentEditBlock && (
        <ContentModal
          block={contentEditBlock}
          onClose={() => setContentEditBlock(null)}
          onSaved={(dest) => {
            setBlocks(prev => prev.map(b => b.id === contentEditBlock.id ? { ...b, content: [{ destination: dest }] } : b));
            showToast('Contenido actualizado');
          }}
        />
      )}
    </div>
  );
}