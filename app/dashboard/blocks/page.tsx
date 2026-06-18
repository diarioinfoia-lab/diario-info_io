'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, Plus, MoreVertical, X, RefreshCw, Columns2, Newspaper, Rows2, PanelLeft, PanelRight } from 'lucide-react';

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

const LAYOUTS = [
  'Full-width',
  '2 Cols',
  '3 Cols',
  '4 Cols',
  'Hero (Principal Izquierda)',
  'Hero (Principal Derecha)',
];

const COL_TYPES = ['Noticia', 'Multimedia', 'Publicidad', 'Vacio'];

function getColumnsForLayout(layout: string): number {
  if (layout === 'Full-width') return 1;
  if (layout === '2 Cols') return 2;
  if (layout === '3 Cols') return 3;
  if (layout === '4 Cols') return 4;
  if (layout.startsWith('Herfunction getLayoutIcon(layout: string, columns?: {type: string}[]) {
  const colTypes = columns ? columns.map(col => col.type).join(",").toLowerCase() : "";
  if (layout === "Full-width") {
    if (colTypes.includes("playlist") || colTypes.includes("video")) return <PanelLeft className="w-4 h-4 text-gray-500" />;
    return <Newspaper className="w-4 h-4 text-gray-500" />;
  }
  if (layout === "2 Cols") return <Columns2 className="w-4 h-4 text-gray-500" />;
  if (layout === "3 Cols") return <Rows2 className="w-4 h-4 text-gray-500" />;
  if (layout === "4 Cols") return <LayoutGrid className="w-4 h-4 text-gray-500" />;
  if (layout.includes("Izquierda")) return <PanelRight className="w-4 h-4 text-gray-500" />;
  if (layout.includes("Derecha")) return <PanelLeft className="w-4 h-4 text-gray-500" />;
  return <Columns2 className="w-4 h-4 text-gray-500" />;
}

interface Column {
  type: string;
}

interface Template {
  id?: string;
  _id?: string;
  name: string;
  code: string;
  layout: string;
  columns: Column[];
}

function getId(t: Template): string {
  return t.id || t._id || '';
}

interface TemplateModalProps {
  template: Template | null;
  onClose: () => void;
  onSave: () => void;
}

function TemplateModal({ template, onClose, onSave }: TemplateModalProps) {
  const [name, setName] = useState(template?.name || '');
  const [layout, setLayout] = useState(template?.layout || 'Full-width');
  const [columns, setColumns] = useState<Column[]>(
    template?.columns && template.columns.length > 0
      ? template.columns
      : [{ type: 'Noticia' }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const count = getColumnsForLayout(layout);
    setColumns(prev => {
      const updated: Column[] = [];
      for (let i = 0; i < count; i++) {
        updated.push(prev[i] || { type: 'Noticia' });
      }
      return updated;
    });
  }, [layout]);

  const handleSave = async () => {
    if (!name.trim()) { setError('El nombre es requerido'); return; }
    setSaving(true);
    setError('');
    const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    const body = { name: name.trim(), code, layout, columns };
    try {
      let res;
      if (template && getId(template)) {
        res = await fetch(API + '/block-template/' + getId(template), {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(API + '/block-templates', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(body),
        });
      }
      if (res.ok) {
        onSave();
        onClose();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.message || 'Error al guardar');
      }
    } catch {
      setError('Error de conexiÃÂÃÂÃÂÃÂ³n');
    }
    setSaving(false);
  };

  const setColType = (idx: number, type: string) => {
    setColumns(prev => prev.map((c, i) => i === idx ? { ...c, type } : c));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la plantilla"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Layout</label>
            <select
              value={layout}
              onChange={e => setLayout(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LAYOUTS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Columnas ({columns.length})
            </label>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(' + columns.length + ', 1fr)' }}>
              {columns.map((col, idx) => (
                <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-2 text-center">Col {idx + 1}</div>
                  <select
                    value={col.type}
                    onChange={e => setColType(idx, e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {COL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Plantilla'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BlocksPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(API + '/block-templates?limit=50', { headers: getHeaders() });
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      setTemplates([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('ÃÂÃÂÃÂÃÂ¿Eliminar esta plantilla?')) return;
    await fetch(API + '/block-template/' + id, { method: 'DELETE', headers: getHeaders() });
    fetchTemplates();
  };

  const handleEdit = (t: Template) => {
    setEditTemplate(t);
    setMenuOpen(null);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditTemplate(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LayoutGrid className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Plantillas</h1>
              <p className="text-sm text-gray-500">GestiÃÂÃÂÃÂÃÂ³n de plantillas de bloques</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchTemplates}
              className="p-2 border bg-white rounded-lg hover:bg-gray-100"
              title="Recargar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nueva Plantilla
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <LayoutGrid className="w-12 h-12 mb-4 text-gray-300" />
              <p className="font-medium">No hay plantillas</p>
              <p className="text-sm">Crea tu primera plantilla de bloque</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Icono</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CÃÂÃÂÃÂÃÂ³digo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Layout</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Columnas</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templates.map(t => {
                  const id = getId(t);
                  return (
                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                          {getLayoutIcon(t.layout, t.columns)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{t.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">{t.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{t.layout}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {t.columns && t.columns.map((c, i) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                              {c.type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setMenuOpen(menuOpen === id ? null : id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          {menuOpen === id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border rounded-xl shadow-lg z-10">
                              <button
                                onClick={() => handleEdit(t)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-t-xl"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => { setMenuOpen(null); handleDelete(id); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats */}
        {!loading && templates.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-right">
            {templates.length} plantilla{templates.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <TemplateModal
          template={editTemplate}
          onClose={() => setModalOpen(false)}
          onSave={fetchTemplates}
        />
      )}

      {/* Click outside to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}
