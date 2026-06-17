'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Plus, MoreVertical, X, GripVertical, Edit2, Trash2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';

const API = 'https://api2.diarioinfo.com';

const PRESET_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e','#14b8a6',
  '#3b82f6','#6366f1','#8b5cf6','#ec4899','#06b6d4',
  '#84cc16','#f43f5e','#0ea5e9','#a855f7','#10b981',
];

interface Category {
  id?: string;
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  order?: number;
}

function getId(cat: Category) {
  return (cat.id || cat._id || '') as string;
}

function CategoryModal({
  cat,
  onClose,
  onSaved,
}: {
  cat: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(cat?.name || '');
  const [slug, setSlug] = useState(cat?.slug || '');
  const [description, setDescription] = useState(cat?.description || '');
  const [color, setColor] = useState(cat?.color || '#3b82f6');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const handleSave = async () => {
    if (!name.trim()) { setError('El nombre es requerido'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { name: name.trim(), slug: slug || slugify(name), description, color };
      if (cat) {
        await updateCategory(getId(cat), payload);
      } else {
        await createCategory(payload);
      }
      onSaved();
      onClose();
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {cat ? 'Editar Categoria' : 'Nueva Categoria'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {cat ? 'Modifica los detalles de la categoria.' : 'Configura la nueva categoria.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); if (!cat) setSlug(slugify(e.target.value)); }} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-500 outline-none focus:border-blue-400 font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripcion</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full border-2 border-white shadow-md flex-shrink-0" style={{backgroundColor: color}} />
              <input type="text" value={color} onChange={e => setColor(e.target.value)} className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none font-mono" />
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-110'}`} style={{backgroundColor: c}} />
              ))}
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string; ok: boolean} | null>(null);
  // Drag state
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragItemRef = useRef<Category | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({msg, ok});
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await getCategories({ limit: 100 });
      const cats: Category[] = r?.categories || r?.data || (Array.isArray(r) ? r : []);
      cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setShowModal(true); setOpenMenu(null); };

  const handleDelete = async (cat: Category) => {
    if (!confirm('Eliminar la categoria "' + cat.name + '"?')) return;
    try {
      await deleteCategory(getId(cat));
      showToast('Categoria eliminada');
      load();
    } catch { showToast('Error al eliminar', false); }
    setOpenMenu(null);
  };

  // Drag & drop reorder
  const handleDragStart = (cat: Category) => {
    dragItemRef.current = cat;
    setDragging(getId(cat));
  };

  const handleDragOver = (e: React.DragEvent, cat: Category) => {
    e.preventDefault();
    setDragOver(getId(cat));
  };

  const handleDrop = async (targetCat: Category) => {
    const dragCat = dragItemRef.current;
    if (!dragCat || getId(dragCat) === getId(targetCat)) {
      setDragging(null); setDragOver(null); return;
    }
    // Reorder locally
    const newOrder = [...categories];
    const fromIdx = newOrder.findIndex(c => getId(c) === getId(dragCat));
    const toIdx = newOrder.findIndex(c => getId(c) === getId(targetCat));
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragCat);
    // Update order numbers
    const updated = newOrder.map((c, i) => ({ ...c, order: i + 1 }));
    setCategories(updated);
    setDragging(null); setDragOver(null);
    // Save to API - update each category's order
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    try {
      await Promise.all(updated.map(c =>
        fetch(`${API}/category/${getId(c)}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: c.order })
        })
      ));
      showToast('Orden actualizado');
    } catch {
      showToast('Error al reordenar', false);
    }
  };

  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const filtered = categories.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorias</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administra las categorias de noticias del sitio.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium text-sm">
          <Plus size={16} />Nueva Categoria
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre o descripcion..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-400" />
          </div>
        </div>

        <div className="grid grid-cols-[32px_56px_80px_1fr_140px_1fr_80px] px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span></span><span>Color</span><span>Posicion</span><span>Nombre</span><span>Slug</span><span>Descripcion</span><span></span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">No hay categorias</p>
            <button onClick={openCreate} className="mt-3 text-blue-500 text-sm hover:underline">Crear la primera</button>
          </div>
        ) : (
          filtered.map((cat, idx) => (
            <div
              key={getId(cat)}
              draggable
              onDragStart={() => handleDragStart(cat)}
              onDragOver={e => handleDragOver(e, cat)}
              onDrop={() => handleDrop(cat)}
              onDragEnd={handleDragEnd}
              className={`grid grid-cols-[32px_56px_80px_1fr_140px_1fr_80px] items-center px-4 py-3 border-b border-gray-50 dark:border-gray-800 transition-colors ${dragging === getId(cat) ? 'opacity-50' : ''} ${dragOver === getId(cat) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
            >
              <div className="cursor-grab text-gray-300 hover:text-gray-500">
                <GripVertical size={16} />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{backgroundColor: cat.color || '#6b7280'}} />
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{(cat.order ?? idx + 1)} º</div>
              <div className="font-medium text-gray-900 dark:text-white text-sm pr-2">{cat.name}</div>
              <div>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded font-mono">{cat.slug}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate pr-2">{cat.description || '-'}</div>
              <div className="flex items-center justify-end">
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === getId(cat) ? null : getId(cat))} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                    <MoreVertical size={15} />
                  </button>
                  {openMenu === getId(cat) && (
                    <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[130px]">
                      <button onClick={() => openEdit(cat)} className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                        <Edit2 size={13} />Editar
                      </button>
                      <button onClick={() => handleDelete(cat)} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
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
        <CategoryModal
          cat={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { showToast(editing ? 'Categoria actualizada' : 'Categoria creada'); load(); }}
        />
      )}
    </div>
  );
}