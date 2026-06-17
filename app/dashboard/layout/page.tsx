'use client';

import { useState, useEffect, useRef } from 'react';
import { LayoutTemplate, Plus, Trash2, Eye, EyeOff, GripVertical, X, Search, RefreshCw, Columns2, AlignLeft, FileText } from 'lucide-react';

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
  'Principal',
  'Secundario',
  'Deportes',
  'Economia',
  'Politica',
  'Cultura',
  'Tecnologia',
  'Internacional',
  'Sociedad',
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

function getLayoutIcon(layout: string) {
  if (!layout || layout === 'Full-width') return <AlignLeft className="w-4 h-4" />;
  return <Columns2 className="w-4 h-4" />;
}

interface ContentModalProps {
  block: Block;
  onClose: () => void;
  onSave: (content: BlockContent[]) => void;
}

function ContentModal({ block, onClose, onSave }: ContentModalProps) {
  const cols = block.template?.columns || [];
  const [content, setContent] = useState<BlockContent[]>(
    cols.map((c, i) => ({
      destination: block.content?.[i]?.destination || DESTINATIONS[0],
    }))
  );

  const setDest = (idx: number, destination: string) => {
    setContent(prev => prev.map((item, i) => i === idx ? { ...item, destination } : item));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Editor de Contenido de Instancia</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Destino general</label>
            <select
              value={content[0]?.destination || DESTINATIONS[0]}
              onChange={e => setContent(prev => prev.map(c => ({ ...c, destination: e.target.value })))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {cols.length > 1 && (
            <div>
              <label className="block text-sm font-medium mb-2">Destino por columna</label>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(' + cols.length + ', 1fr)' }}>
                {cols.map((col, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                    <div className="text-xs text-gray-500 mb-2 text-center font-medium">{col.type}</div>
                    <select
                      value={content[idx]?.destination || DESTINATIONS[0]}
                      onChange={e => setDest(idx, e.target.value)}
                      className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm">
            Cancelar
          </button>
          <button
            onClick={() => { onSave(content); onClose(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LayoutPage() {
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
        fetch(API + '/blocks?limit=50', { headers: getHeaders() }),
        fetch(API + '/block-templates?limit=50', { headers: getHeaders() }),
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

  const addTemplate = async (tmpl: BlockTemplate) => {
    const order = blocks.length + 1;
    const body = {
      name: tmpl.name,
      template: getId(tmpl),
      order,
      isVisible: true,
      content: (tmpl.columns || []).map(() => ({ destination: DESTINATIONS[0] })),
    };
    await fetch(API + '/blocks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    fetchAll();
  };

  const toggleVisibility = async (block: Block) => {
    const id = getId(block);
    setSaving(id);
    await fetch(API + '/block/' + id, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isVisible: !block.isVisible }),
    });
    setSaving(null);
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
    if (dragItem.current === dragOver.current) return;

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

  const handleSaveContent = async (block: Block, content: BlockContent[]) => {
    await fetch(API + '/block/' + getId(block), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    fetchAll();
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LayoutTemplate className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portada</h1>
              <p className="text-sm text-gray-500">Editor de layout principal</p>
            </div>
          </div>
          <button
            onClick={fetchAll}
            className="p-2 border bg-white rounded-lg hover:bg-gray-100"
            title="Recargar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel: Templates */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-gray-900 mb-3">Plantillas disponibles</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar plantilla..."
                      className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {filteredTemplates.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No hay plantillas disponibles
                    </div>
                  ) : filteredTemplates.map(t => {
                    const tid = getId(t);
                    return (
                      <div key={tid} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getLayoutIcon(t.layout)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{t.name}</div>
                            <div className="text-xs text-gray-500">{t.layout}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => addTemplate(t)}
                          className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          title="Agregar a portada"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel: Layout Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-gray-900">Layout activo</h2>
                  <p className="text-sm text-gray-500">Arrastra para reordenar los bloques</p>
                </div>
                <div className="p-4 space-y-3 min-h-64">
                  {blocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <LayoutTemplate className="w-12 h-12 mb-4 text-gray-300" />
                      <p className="font-medium">No hay bloques en la portada</p>
                      <p className="text-sm">Agrega plantillas desde el panel izquierdo</p>
                    </div>
                  ) : blocks.map((block, idx) => {
                    const bid = getId(block);
                    return (
                      <div
                        key={bid}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragEnter={() => handleDragEnter(idx)}
                        onDragEnd={handleDrop}
                        onDragOver={e => e.preventDefault()}
                        className={`flex items-center gap-3 p-3 border rounded-xl transition-colors cursor-grab active:cursor-grabbing ${block.isVisible ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 opacity-70'}`}
                      >
                        <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0">
                          {block.template ? getLayoutIcon(block.template.layout) : <FileText className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">{block.name}</div>
                          <div className="text-xs text-gray-500">
                            {block.template ? block.template.layout : 'Sin plantilla'} · Orden {block.order}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <select
                            value={block.content?.[0]?.destination || DESTINATIONS[0]}
                            onChange={async (e) => {
                              const newContent = (block.template?.columns || [{ type: 'Noticia' }]).map((_, i) => ({
                                destination: block.content?.[i]?.destination || e.target.value,
                              }));
                              newContent[0] = { destination: e.target.value };
                              await fetch(API + '/block/' + bid, {
                                method: 'PUT',
                                headers: getHeaders(),
                                body: JSON.stringify({ content: newContent }),
                              });
                              fetchAll();
                            }}
                            className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <button
                            onClick={() => setContentModal(block)}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                          >
                            Cont.
                          </button>
                          <button
                            onClick={() => toggleVisibility(block)}
                            disabled={saving === bid}
                            className="p-1.5 hover:bg-gray-100 rounded-lg"
                            title={block.isVisible ? 'Ocultar' : 'Mostrar'}
                          >
                            {block.isVisible
                              ? <Eye className="w-4 h-4 text-gray-600" />
                              : <EyeOff className="w-4 h-4 text-gray-400" />
                            }
                          </button>
                          <button
                            onClick={() => deleteBlock(block)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                            title="Eliminar bloque"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Modal */}
      {contentModal && (
        <ContentModal
          block={contentModal}
          onClose={() => setContentModal(null)}
          onSave={(content) => handleSaveContent(contentModal, content)}
        />
      )}
    </div>
  );
}
