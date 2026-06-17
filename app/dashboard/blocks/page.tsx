'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Plus, MoreVertical, X, Edit2, Trash2, LayoutGrid, LayoutTemplate, Columns, AlignLeft, FileText, Film } from 'lucide-react';

const API = 'https://api2.diarioinfo.com';

const LAYOUTS = [
  'Full-width',
  '2 Cols',
  '3 Cols',
  '4 Cols',
  'Hero (Principal Izquierda)',
  'Hero (Principal Derecha)',
];

const LAYOUT_LABELS: Record<string,string> = {
  'Full-width': 'Full-width (Ancho Completo)',
  '2 Cols': '2 Columnas',
  '3 Cols': '3 Columnas',
  '4 Cols': '4 Columnas',
  'Hero (Principal Izquierda)': 'Hero (Principal Izquierda)',
  'Hero (Principal Derecha)': 'Hero (Principal Derecha)',
};

const COL_TYPES = ['Noticia','Multimedia','Publicidad','Vacio'];

const LAYOUT_COLS: Record<string,number> = {
  'Full-width': 1, '2 Cols': 2, '3 Cols': 3, '4 Cols': 4,
  'Hero (Principal Izquierda)': 2, 'Hero (Principal Derecha)': 2,
};

function layoutIcon(layout: string) {
  if (layout.includes('Full')) return <AlignLeft size={18} className="text-rose-500" />;
  if (layout.includes('Hero')) return <LayoutTemplate size={18} className="text-purple-500" />;
  if (layout.includes('2')) return <Columns size={18} className="text-blue-500" />;
  if (layout.includes('3')) return <LayoutGrid size={18} className="text-green-500" />;
  return <LayoutGrid size={18} className="text-yellow-500" />;
}

function slugCode(name: string) {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/(^_|_$)/g,'');
}

interface BlockTemplate {
  id: string;
  name: string;
  code: string;
  layout: string;
  columns: { type: string }[];
}

function TemplateModal({
  template,
  onClose,
  onSaved,
}: {
  template: BlockTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(template?.name || '');
  const [layout, setLayout] = useState(template?.layout || '3 Cols');
  const [columns, setColumns] = useState<{ type: string }[]>(
    template?.columns || [{ type: 'Noticia' }, { type: 'Noticia' }, { type: 'Noticia' }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const numCols = LAYOUT_COLS[layout] || 1;

  useEffect(() => {
    setColumns(prev => {
      const n = [...prev];
      while (n.length < numCols) n.push({ type: 'Noticia' });
      return n.slice(0, numCols);
    });
  }, [layout, numCols]);

  const setColType = (idx: number, type: string) => {
    setColumns(prev => prev.map((c, i) => i === idx ? { type } : c));
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('El nombre es requerido'); return; }
    setSaving(true); setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const payload = { name: name.trim(), code: slugCode(name), layout, columns: columns.slice(0, numCols) };
      if (template) {
        const r = await fetch(`${API}/block-template/${template.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error(await r.text());
      } else {
        const r = await fetch(`${API}/block-templates`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error(await r.text());
      }
      onSaved(); onClose();
    } catch (e: any) {
      setError('Error al guardar: ' + (e.message || ''));
    } finally { setSaving(false); }
  };

  const colLabels: Record<string,string> = {
    'Full-width': ['Principal'],
    '2 Cols': ['Columna 1', 'Columna 2'],
    '3 Cols': ['Columna 1', 'Columna 2', 'Columna 3'],
    '4 Cols': ['Columna 1', 'Columna 2', 'Columna 3', 'Columna 4'],
    'Hero (Principal Izquierda)': ['Principal (2/3)', 'Secundario'],
    'Hero (Principal Derecha)': ['Secundario', 'Principal (2/3)'],
  }[layout] || ['Columna 1'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {template ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Configura la estructura y propiedades de esta plantilla de bloque.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Plantilla</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Layout</label>
              <select value={layout} onChange={e => setLayout(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400">
                {LAYOUTS.map(l => <option key={l} value={l}>{LAYOUT_LABELS[l] || l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Configuracion y Previsualizacion de Columnas</label>
            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-xl p-4">
              <div className={`grid gap-3`} style={{gridTemplateColumns: `repeat(${numCols}, 1fr)`}}>
                {columns.slice(0, numCols).map((col, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 mb-2">{colLabels[i] || 'Columna ' + (i+1)}</p>
                    <select value={col.type} onChange={e => setColType(i, e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 outline-none">
                      {COL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
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

export default function BlocksPage() {
  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlockTemplate | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string; ok: boolean} | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({msg, ok});
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const r = await fetch(`${API}/block-templates?limit=50`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setTemplates(d.templates || d.blockTemplates || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (t: BlockTemplate) => { setEditing(t); setShowModal(true); setOpenMenu(null); };

  const handleDelete = async (t: BlockTemplate) => {
    if (!confirm('Eliminar la plantilla "' + t.name + '"?')) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      await fetch(`${API}/block-template/${t.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      showToast('Plantilla eliminada');
      load();
    } catch { showToast('Error al eliminar', false); }
    setOpenMenu(null);
  };

  const filtered = templates.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plantillas de Bloque</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Crea y gestiona las plantillas reutilizables para la portada.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium text-sm">
          <Plus size={16} />Nueva Plantilla
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="grid grid-cols-[56px_1fr_200px_60px] px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Icono</span><span>Nombre de Plantilla</span><span>Layout</span><span></span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <LayoutGrid size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No hay plantillas</p>
            <button onClick={openCreate} className="mt-3 text-blue-500 text-sm hover:underline">Crear la primera</button>
          </div>
        ) : (
          filtered.map(t => (
            <div key={t.id} className="grid grid-cols-[56px_1fr_200px_60px] items-center px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {layoutIcon(t.layout)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</p>
                <p className="text-xs text-gray-400 font-mono">{t.code}</p>
              </div>
              <div>
                <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">{t.layout}</span>
              </div>
              <div className="flex items-center justify-end">
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                    <MoreVertical size={15} />
                  </button>
                  {openMenu === t.id && (
                    <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[130px]">
                      <button onClick={() => openEdit(t)} className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                        <Edit2 size={13} />Editar
                      </button>
                      <button onClick={() => handleDelete(t)} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                        <Trash2 size={13} />Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
      {showModal && (
        <TemplateModal
          template={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { showToast(editing ? 'Plantilla actualizada' : 'Plantilla creada'); load(); }}
        />
      )}
    </div>
  );
}