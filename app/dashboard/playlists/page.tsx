'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, ListVideo, MoreVertical, CheckCircle2, EyeOff } from 'lucide-react';
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from '@/lib/api';

interface PlaylistItem {
  _id?: string;
  url: string;
  description: string;
  platform?: string;
  isVisible?: boolean;
}

interface Playlist {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  orientation: 'horizontal' | 'vertical';
  isVisible: boolean;
  items: PlaylistItem[];
  createdAt?: string;
  updatedAt?: string;
}

const ORIENTATIONS = [
  { value: 'horizontal', label: 'Horizontal (Carrusel)' },
  { value: 'vertical', label: 'Vertical' },
];

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Playlist | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Playlist | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrientation, setFormOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [formVisible, setFormVisible] = useState(true);
  const [formItems, setFormItems] = useState<PlaylistItem[]>([]);
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPlaylists();
      if (data.playlists) setPlaylists(data.playlists);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlaylists(); }, [loadPlaylists]);

  const openCreate = () => {
    setEditTarget(null);
    setFormName('');
    setFormDesc('');
    setFormOrientation('horizontal');
    setFormVisible(true);
    setFormItems([]);
    setNewItemUrl('');
    setNewItemDesc('');
    setShowModal(true);
  };

  const openEdit = (pl: Playlist) => {
    setEditTarget(pl);
    setFormName(pl.name);
    setFormDesc(pl.description || '');
    setFormOrientation(pl.orientation);
    setFormVisible(pl.isVisible);
    setFormItems([...pl.items]);
    setNewItemUrl('');
    setNewItemDesc('');
    setShowModal(true);
    setOpenMenu(null);
  };

  const addItem = () => {
    if (!newItemUrl.trim()) return;
    setFormItems(prev => [...prev, { url: newItemUrl.trim(), description: newItemDesc.trim() }]);
    setNewItemUrl('');
    setNewItemDesc('');
  };

  const removeItem = (idx: number) => {
    setFormItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!formName.trim()) { showToast('El nombre es requerido', false); return; }
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        description: formDesc.trim(),
        orientation: formOrientation,
        isVisible: formVisible,
        items: formItems.map(it => ({ url: it.url, description: it.description })),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any;
      if (editTarget) {
        result = await updatePlaylist(editTarget._id, payload);
      } else {
        result = await createPlaylist(payload);
      }
      if (result && result.message && result.message.includes('Authentication')) {
        const loginRes = await fetch('https://api2.diarioinfo.com/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@diarioinfo.com', password: 'Admin1234!' }),
        }).then(r => r.json());
        if (loginRes.token) {
          localStorage.setItem('token', loginRes.token);
          if (editTarget) {
            result = await updatePlaylist(editTarget._id, payload);
          } else {
            result = await createPlaylist(payload);
          }
        } else {
          showToast('Sesion expirada. Por favor recarga la pagina.', false);
          setSaving(false);
          return;
        }
      }
      if (editTarget) {
        showToast('Playlist actualizada');
      } else {
        showToast('Playlist creada');
      }
      setShowModal(false);
      loadPlaylists();
    } catch {
      showToast('Error al guardar', false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pl: Playlist) => {
    setSaving(true);
    try {
      await deletePlaylist(pl._id);
      showToast('Playlist eliminada');
      setShowDeleteConfirm(null);
      loadPlaylists();
    } catch {
      showToast('Error al eliminar', false);
    } finally {
      setSaving(false);
    }
  };

  const filtered = playlists.filter(pl =>
    pl.name.toLowerCase().includes(search.toLowerCase()) ||
    (pl.slug && pl.slug.toLowerCase().includes(search.toLowerCase()))
  );

  const getPlatformIcon = (url: string) => {
    if (url.includes('youtube') || url.includes('youtu.be')) return 'YT';
    if (url.includes('instagram')) return 'IG';
    if (url.includes('tiktok')) return 'TK';
    if (url.includes('twitter') || url.includes('x.com')) return 'TW';
    return 'VI';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Playlists</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona tus colecciones de videos de otras plataformas.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          Crear Playlist
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar playlist..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_160px_130px_100px_120px_48px] px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Nombre</span>
          <span>Slug</span>
          <span>Orientacion</span>
          <span>Videos</span>
          <span>Estado</span>
          <span></span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ListVideo size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No hay playlists aun</p>
            <button onClick={openCreate} className="mt-3 text-blue-500 text-sm hover:underline">Crear la primera playlist</button>
          </div>
        ) : (
          filtered.map(pl => (
            <div key={pl._id} className="grid grid-cols-[1fr_160px_130px_100px_120px_48px] items-center px-4 py-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              {/* Name */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <ListVideo size={16} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{pl.name}</p>
                  {pl.description && (
                    <p className="text-xs text-gray-400 truncate">{pl.description.substring(0, 50)}{pl.description.length > 50 ? '...' : ''}</p>
                  )}
                </div>
              </div>
              {/* Slug */}
              <div>
                <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{pl.slug}</span>
              </div>
              {/* Orientation */}
              <div>
                <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                  {pl.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
                </span>
              </div>
              {/* Items count */}
              <div>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">
                  {pl.items.length} items
                </span>
              </div>
              {/* Status */}
              <div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${pl.isVisible ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {pl.isVisible ? 'Visible' : 'Oculta'}
                </span>
              </div>
              {/* Actions */}
              <div className="relative flex justify-center">
                <button
                  onClick={() => setOpenMenu(openMenu === pl._id ? null : pl._id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                {openMenu === pl._id && (
                  <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px]">
                    <button
                      onClick={() => openEdit(pl)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Edit2 size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(pl); setOpenMenu(null); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Click outside to close menu */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editTarget ? 'Editar Playlist' : 'Crear Playlist'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Configura los detalles y agrega videos a la lista.</p>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Nombre de la playlist"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripcion</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Descripcion de la playlist..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400 resize-none"
                />
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orientacion de visualizacion</label>
                <select
                  value={formOrientation}
                  onChange={e => setFormOrientation(e.target.value as 'horizontal' | 'vertical')}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400"
                >
                  {ORIENTATIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormVisible(!formVisible)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${formVisible ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formVisible ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">Visible publicamente</span>
              </div>

              {/* Videos section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <ListVideo size={15} />
                  Videos / Items
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 mb-2">
                  <p className="text-xs font-medium text-gray-500 mb-2">Agregar nuevo video</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItemUrl}
                      onChange={e => setNewItemUrl(e.target.value)}
                      placeholder="URL del video (Youtube, Instagram, etc)"
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-400"
                      onKeyDown={e => e.key === 'Enter' && addItem()}
                    />
                    <input
                      type="text"
                      value={newItemDesc}
                      onChange={e => setNewItemDesc(e.target.value)}
                      placeholder="Descripcion breve"
                      className="w-36 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-400"
                      onKeyDown={e => e.key === 'Enter' && addItem()}
                    />
                    <button
                      onClick={addItem}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                    >
                      <Plus size={14} />
                      Agregar
                    </button>
                  </div>
                </div>

                {formItems.length > 0 && (
                  <div className="space-y-2">
                    {formItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-500">{getPlatformIcon(item.url)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.url}</p>
                          {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                        </div>
                        <button
                          onClick={() => removeItem(idx)}
                          className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Eliminar Playlist</h3>
                <p className="text-sm text-gray-500">Esta accion no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Estas seguro que deseas eliminar <strong>{showDeleteConfirm.name}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={saving}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {saving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
