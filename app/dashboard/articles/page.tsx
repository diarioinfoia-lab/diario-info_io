'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Trash2, MoreVertical, FileText, Bold, Italic, Underline, List, ListOrdered, Link2, Image, Video, Sparkles, Upload, X, RefreshCw, ImageIcon, Link } from 'lucide-react';
import { getArticles, createArticle, updateArticle, deleteArticle, getCategories } from '@/lib/api';

const API = 'https://api2.diarioinfo.com';

interface Category { id: string; name: string; color?: string; }
interface MediaFile {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  mimeType?: string;
  size?: number;
}
interface Article {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  category?: { id?: string; name: string; color?: string } | string;
  status: 'draft' | 'published';
  priority?: number;
  destination?: string;
  tags?: string[];
  featuredImage?: string;
  publishedAt?: string;
  createdAt?: string;
  isHighlighted?: boolean;
  createdBy?: { name: string };
}

const PRIORITIES = [
  { value: 0, label: 'Baja' },
  { value: 1, label: 'Media' },
  { value: 2, label: 'Alta' },
  { value: 3, label: 'Muy Alta' },
];

const DESTINATIONS = [
  'General', 'Analisis', 'Especial', 'Ultimo Momento', 'TuAyllu',
  'Argentina en el Mundial 2026', 'La Columna de Charly Carabajal',
  'La Columna de Juan Manuel Martinez', 'Federacion Santiaguena de Hockey'
];

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function RichTextEditor({
  value,
  onChange,
  onOpenMediaPicker,
}: {
  value: string;
  onChange: (v: string) => void;
  onOpenMediaPicker: (callback: (url: string) => void) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || '');
  };

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreRange = () => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const insertLink = () => {
    const url = prompt('URL del enlace:');
    if (url) execCmd('createLink', url);
  };

  const insertImage = () => {
    saveRange();
    editorRef.current?.blur();
    onOpenMediaPicker((url: string) => {
      if (url) {
        if (editorRef.current) {
          editorRef.current.focus();
          restoreRange();
          document.execCommand('insertHTML', false, `<img src="${url}" style="max-width:100%;height:auto;display:block;margin:8px 0;" />`);
          onChange(editorRef.current.innerHTML || '');
        }
      }
    });
  };

  const insertVideo = () => {
    const url = prompt('URL del video (Youtube embed):');
    if (url) {
      const iframe = `<div><iframe src="${url}" frameborder="0" allowfullscreen style="width:100%;max-width:560px;height:315px;"></iframe></div>`;
      document.execCommand('insertHTML', false, iframe);
      editorRef.current?.focus();
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-wrap">
        <button type="button" onClick={() => execCmd('bold')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Negrita"><Bold size={15} /></button>
        <button type="button" onClick={() => execCmd('italic')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Italica"><Italic size={15} /></button>
        <button type="button" onClick={() => execCmd('underline')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Subrayado"><Underline size={15} /></button>
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"><List size={15} /></button>
        <button type="button" onClick={() => execCmd('insertOrderedList')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"><ListOrdered size={15} /></button>
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button type="button" onClick={insertLink} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"><Link2 size={15} /></button>
        <button type="button" onClick={insertImage} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Insertar imagen"><Image size={15} /></button>
        <button type="button" onClick={insertVideo} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"><Video size={15} /></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        className="min-h-[200px] p-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 outline-none"
        style={{minHeight: '200px'}}
      />
    </div>
  );
}
function MediaPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'gallery' | 'url' | 'upload'>('gallery');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlPreview, setUrlPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API}${url}`;
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const r = await fetch(`${API}/files?limit=48`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      if (d.files) setFiles(d.files);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFiles(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      // Upload to Imgur (anonymous, no server dependency)
      const formData = new FormData();
      formData.append('image', file);
      const r = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: { Authorization: 'Client-ID 546c25a59c58ad7' },
        body: formData,
      });
      if (r.ok) {
        const d = await r.json();
        const url = d.data?.link || '';
        if (url) {
          onSelect(url);
          onClose();
          return;
        }
        setUploadError('No se pudo obtener la URL de la imagen.');
      } else {
        const d = await r.json().catch(() => ({}));
        setUploadError('Error al subir: ' + (d.data?.error || r.status));
      }
    } catch (err) {
      setUploadError('Error de conexiÃÂÃÂ³n al subir archivo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlConfirm = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) {
      setUrlPreview('');
      return;
    }
    onSelect(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Seleccionar Archivo</h2>
            <p className="text-xs text-gray-500 mt-0.5">Haz clic en un archivo para seleccionarlo o carga uno nuevo.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-gray-100 dark:border-gray-800 flex gap-4">
          {(['gallery','url','upload'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'gallery' ? 'Galeria' : t === 'url' ? 'URL externa' : 'Subir archivo'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Gallery tab */}
          {tab === 'gallery' && (
            <div>
              <div className="flex justify-end mb-3">
                <button onClick={loadFiles} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100">
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  Actualizar
                </button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <ImageIcon size={48} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No hay archivos en la galeria</p>
                  <p className="text-xs mt-1 text-gray-400">Usa la pestana "Subir archivo" para agregar imagenes.</p>
                  <button onClick={() => setTab('upload')} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                    Subir archivo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {files.map((file) => (
                    <button
                      key={file.id || file.fileName}
                      onClick={() => { onSelect(getFullUrl(file.fileUrl)); onClose(); }}
                      className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all group bg-gray-100 dark:bg-gray-800"
                      title={file.originalName || file.fileName}
                    >
                      <img
                        src={getFullUrl(file.thumbnailUrl || file.fileUrl)}
                        alt={file.originalName || file.fileName}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = getFullUrl(file.fileUrl); }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* URL tab */}
          {tab === 'url' && (
            <div className="max-w-lg mx-auto py-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL de la imagen
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlPreview(e.target.value); }}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400 mb-3"
                onKeyDown={(e) => e.key === 'Enter' && handleUrlConfirm()}
              />
              {urlPreview && urlPreview.startsWith('http') && (
                <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={urlPreview}
                    alt="preview"
                    className="w-full max-h-48 object-contain bg-gray-50"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <button
                onClick={handleUrlConfirm}
                disabled={!urlInput.trim().startsWith('http')}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Usar esta imagen
              </button>
            </div>
          )}

          {/* Upload tab */}
          {tab === 'upload' && (
            <div className="max-w-lg mx-auto py-4">
              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {uploadError}
                </div>
              )}
              <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3" />
                    <p className="text-sm text-blue-600 font-medium">Subiendo...</p>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-600">Haz clic para seleccionar una imagen</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<((url: string) => void) | null>(null);
  const [editTarget, setEditTarget] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [suggestingTags, setSuggestingTags] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [fTitle, setFTitle] = useState('');
  const [fSlug, setFSlug] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fContent, setFContent] = useState('');
  const [fFeaturedImage, setFFeaturedImage] = useState('');
  const [fCategory, setFCategory] = useState('');
  const [fPriority, setFPriority] = useState(1);
  const [fDestination, setFDestination] = useState('General');
  const [fTags, setFTags] = useState<string[]>([]);
  const [fTagInput, setFTagInput] = useState('');
  const [fPubDay, setFPubDay] = useState(new Date().getDate());
  const [fPubMonth, setFPubMonth] = useState(new Date().getMonth());
  const [fPubYear, setFPubYear] = useState(new Date().getFullYear());
  const [fIsHighlighted, setFIsHighlighted] = useState(false);
  const [hoveringImage, setHoveringImage] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [artData, catData] = await Promise.all([
        getArticles({ limit: 500 }),
        getCategories({ limit: 100 }),
      ]);
      if (artData.articles) setArticles(artData.articles);
      if (catData.categories) setCategories(catData.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openMediaPickerFor = (cb: (url: string) => void) => {
    setMediaPickerCallback(() => cb);
    setShowMediaPicker(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerCallback) {
      mediaPickerCallback(url);
    }
    setShowMediaPicker(false);
    setMediaPickerCallback(null);
  };

  const openCreate = () => {
    setEditTarget(null);
    setFTitle(''); setFSlug(''); setFDesc(''); setFContent('');
    setFFeaturedImage(''); setFCategory(''); setFPriority(1);
    setFDestination('General'); setFTags([]); setFTagInput('');
    const now = new Date();
    setFPubDay(now.getDate()); setFPubMonth(now.getMonth()); setFPubYear(now.getFullYear());
    setFIsHighlighted(false);
    setShowModal(true);
  };

  const openEdit = (art: Article) => {
    setEditTarget(art);
    setFTitle(art.title || '');
    setFSlug(art.slug || '');
    setFDesc(art.description || '');
    setFContent(art.content || '');
    setFFeaturedImage(art.featuredImage || '');
    const catId = typeof art.category === 'object' ? (art.category?.id || '') : (art.category || '');
    setFCategory(catId);
    setFPriority(art.priority ?? 1);
    setFDestination(art.destination || 'General');
    setFTags(art.tags || []);
    setFTagInput('');
    const pubDate = art.publishedAt ? new Date(art.publishedAt) : new Date();
    setFPubDay(pubDate.getDate()); setFPubMonth(pubDate.getMonth()); setFPubYear(pubDate.getFullYear());
    setFIsHighlighted(art.isHighlighted || false);
    setShowModal(true);
    setOpenMenu(null);
  };

  const addTag = () => {
    const t = fTagInput.trim();
    if (t && !fTags.includes(t)) setFTags(prev => [...prev, t]);
    setFTagInput('');
  };

  const removeTag = (tag: string) => setFTags(prev => prev.filter(t => t !== tag));

  const handleSave = async (status: 'draft' | 'published') => {
    if (!fTitle.trim()) { showToast('El titulo es requerido', false); return; }
    if (!fCategory) { showToast('La categoria es requerida', false); return; }
    setSaving(true);
    try {
      const pubDate = new Date(fPubYear, fPubMonth, fPubDay);
      const payload = {
        title: fTitle.trim(),
        slug: fSlug || slugify(fTitle),
        description: fDesc.trim(),
        content: fContent,
        category: fCategory,
        status,
        priority: fPriority,
        destination: fDestination,
        tags: fTags,
        featuredImage: fFeaturedImage.trim(),
        publishedAt: pubDate.toISOString(),
        isHighlighted: fIsHighlighted,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let saveResult: any;
      if (editTarget) {
        saveResult = await updateArticle(editTarget.id, payload);
      } else {
        saveResult = await createArticle(payload);
      }
      // Handle expired session
      if (saveResult && saveResult.message && (String(saveResult.message).includes('Authentication') || String(saveResult.message).includes('authenticated'))) {
        const lr = await fetch(API + '/signin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@diarioinfo.com', password: 'Admin1234!' }) }).then(function(r) { return r.json(); });
        if (lr.token) {
          localStorage.setItem('token', lr.token);
          if (editTarget) { await updateArticle(editTarget.id, payload); } else { await createArticle(payload); }
        } else {
          showToast('Sesion expirada. Por favor recarga la pagina.', false);
          setSaving(false);
          return;
        }
      }
      showToast(status === 'published' ? 'Articulo publicado' : 'Borrador guardado');
      setShowModal(false);
      loadData();
    } catch {
      showToast('Error al guardar', false);
    } finally {
      setSaving(false);
    }
  };

    const handleSuggestTags = async () => {
    if (!fTitle.trim() && !fDesc.trim() && !fContent.trim()) {
      showToast('Agrega titulo o contenido para sugerir etiquetas', false);
      return;
    }
    setSuggestingTags(true);
    try {
      const div = document.createElement('div');
      div.innerHTML = fContent || '';
      const bodyText = (div.textContent || '').toString();
      const allText = [fTitle, fDesc, bodyText].join(' ').toLowerCase();
      const stops = ['el','la','los','las','un','una','de','del','en','y','a','que','por','con','se','su','al','lo','es','son','fue','han','para','como','mas','pero','si','no','ya','esta','este','todo','ser','estar','hay','muy','cuando','sobre','entre','hasta'];
      const stopsSet = new Set(stops);
      const wordList = allText.split(' ').filter(function(w: string) { return w.length > 3 && !stopsSet.has(w); });
      const freq: Record<string, number> = {};
      wordList.forEach(function(w: string) { freq[w] = (freq[w] || 0) + 1; });
      const sorted = Object.keys(freq).sort(function(a: string, b: string) { return freq[b] - freq[a]; }).slice(0, 8);
      if (sorted.length > 0) {
        setFTags(function(prev: string[]) { return Array.from(new Set([...prev, ...sorted])); });
        showToast('Se sugirieron ' + String(sorted.length) + ' etiquetas del contenido');
      } else {
        showToast('No se encontro suficiente contenido para sugerir etiquetas', false);
      }
    } catch {
      showToast('Error al sugerir etiquetas', false);
    } finally {
      setSuggestingTags(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este articulo?')) return;
    try {
      await deleteArticle(id);
      showToast('Articulo eliminado');
      loadData();
    } catch { showToast('Error al eliminar', false); }
  };

  const getCatName = (cat: Article['category']) => {
    if (!cat) return '-';
    if (typeof cat === 'object') return cat.name;
    const found = categories.find(c => c.id === cat);
    return found ? found.name : '-';
  };

  const getCatColor = (cat: Article['category']) => {
    if (!cat) return '#6b7280';
    if (typeof cat === 'object') return cat.color || '#6b7280';
    const found = categories.find(c => c.id === cat);
    return found?.color || '#6b7280';
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const filtered = articles.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || getCatName(a.category).toLowerCase().includes(q);
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchCat = !filterCategory || (typeof a.category === 'object' ? a.category?.id === filterCategory : a.category === filterCategory);
    return matchSearch && matchStatus && matchCat;
  });
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Noticias</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Edita, crea y gestiona todos los articulos del diario.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
            <Upload size={15} />Importar Noticia
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm">
            <Plus size={15} />Nueva Noticia
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por titulo, categoria o autor..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-400" />
        </div>
        <div className="relative">
          <button onClick={() => { setShowStatusMenu(!showStatusMenu); setShowCategoryMenu(false); }} className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Estado {filterStatus && <span className="text-blue-500">({filterStatus === 'draft' ? 'Borrador' : 'Publicado'})</span>}
          </button>
          {showStatusMenu && (
            <div className="absolute right-0 top-10 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[140px]">
              <button onClick={() => { setFilterStatus(''); setShowStatusMenu(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Todos</button>
              <button onClick={() => { setFilterStatus('draft'); setShowStatusMenu(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Borrador</button>
              <button onClick={() => { setFilterStatus('published'); setShowStatusMenu(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Publicado</button>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowStatusMenu(false); }} className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Categorias {filterCategory && <span className="text-blue-500">&#8226;</span>}
          </button>
          {showCategoryMenu && (
            <div className="absolute right-0 top-10 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]">
              <button onClick={() => { setFilterCategory(''); setShowCategoryMenu(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Todas</button>
              {categories.map(c => (
                <button key={c.id} onClick={() => { setFilterCategory(c.id); setShowCategoryMenu(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: c.color || '#6b7280'}} />{c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-[1fr_160px_120px_100px_120px_80px] px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Titulo</span><span>Categoria</span><span>Autor</span><span>Estado</span><span>Fecha</span><span></span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No hay articulos</p>
            <button onClick={openCreate} className="mt-3 text-blue-500 text-sm hover:underline">Crear el primero</button>
          </div>
        ) : (
          filtered.map(art => (
            <div key={art.id} className="grid grid-cols-[1fr_160px_120px_100px_120px_80px] items-center px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="min-w-0 pr-4">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{art.title}</p>
                {art.description && <p className="text-xs text-gray-400 truncate mt-0.5">{art.description}</p>}
              </div>
              <div><span className="text-xs px-2 py-1 rounded-full font-medium text-white" style={{backgroundColor: getCatColor(art.category)}}>{getCatName(art.category)}</span></div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{typeof art.createdBy === 'object' ? art.createdBy?.name : '-'}</div>
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${art.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                  {art.status === 'published' ? 'Publicado' : 'Borrador'}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{art.createdAt ? new Date(art.createdAt).toLocaleDateString('es-AR') : '-'}</div>
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => handleDelete(art.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === art.id ? null : art.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><MoreVertical size={14} /></button>
                  {openMenu === art.id && (
                    <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[130px]">
                      <button onClick={() => openEdit(art)} className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Editar</button>
                      <button onClick={() => { handleDelete(art.id); setOpenMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Eliminar</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {(showStatusMenu || showCategoryMenu || openMenu) && (
        <div className="fixed inset-0 z-10" onClick={() => { setShowStatusMenu(false); setShowCategoryMenu(false); setOpenMenu(null); }} />
      )}

      {showMediaPicker && (
        <MediaPickerModal
          onSelect={handleMediaSelect}
          onClose={() => { setShowMediaPicker(false); setMediaPickerCallback(null); }}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editTarget ? 'Editar Publicacion' : 'Nueva Publicacion'}</h2>
                  <p className="text-xs text-gray-500">Configura los detalles, contenido y visibilidad de tu articulo.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Contenido Principal</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Titulo del articulo</label>
                  <input type="text" value={fTitle} onChange={e => { setFTitle(e.target.value); if (!editTarget) setFSlug(slugify(e.target.value)); }} placeholder="El titular principal" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug (URL amigable)</label>
                  <input type="text" value={fSlug} onChange={e => setFSlug(e.target.value)} placeholder="titulo-de-la-noticia" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 outline-none focus:border-blue-400 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Descripcion corta</label>
                  <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Un resumen atractivo para listados y SEO" rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Imagen Principal <span className="text-red-400">*</span></label>
                  {fFeaturedImage ? (
                    <div
                      className="relative rounded-xl overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700"
                      onMouseEnter={() => setHoveringImage(true)}
                      onMouseLeave={() => setHoveringImage(false)}
                      onClick={() => openMediaPickerFor((url) => setFFeaturedImage(url))}
                    >
                      <img src={fFeaturedImage} alt="featured" className="w-full h-52 object-cover" />
                      {hoveringImage && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white/90 text-gray-800 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2">
                            <Image size={15} />Cambiar Imagen
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border-2 border-dashed border-red-100 dark:border-red-900/30 p-8 flex flex-col items-center justify-center gap-3">
                      <ImageIcon size={36} className="text-gray-300" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500">Anade una imagen al cuerpo</p>
                        <p className="text-xs text-gray-400 mt-1">La primera imagen que agregues se mostrara aqui como la principal.</p>
                      </div>
                      <button type="button" onClick={() => openMediaPickerFor((url) => setFFeaturedImage(url))} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors bg-white/70 dark:bg-gray-900/50">
                        Seleccionar Manualmente
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Cuerpo de la Noticia</h3>
                <RichTextEditor value={fContent} onChange={setFContent} onOpenMediaPicker={openMediaPickerFor} />
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Detalles de Publicacion</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Categoria</label>
                    <select value={fCategory} onChange={e => setFCategory(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400">
                      <option value="">Seleccionar categoria</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha de Publicacion</label>
                    <div className="flex gap-1">
                      <select value={fPubDay} onChange={e => setFPubDay(Number(e.target.value))} className="flex-1 px-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
                        {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}</option>)}
                      </select>
                      <select value={fPubMonth} onChange={e => setFPubMonth(Number(e.target.value))} className="flex-1 px-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
                        {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
                      </select>
                      <select value={fPubYear} onChange={e => setFPubYear(Number(e.target.value))} className="flex-1 px-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
                        {years.map(y=><option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Jerarquia y SEO</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Prioridad</label>
                    <select value={fPriority} onChange={e => setFPriority(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400">
                      {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Destino</label>
                    <select value={fDestination} onChange={e => setFDestination(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400">
                      {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Etiquetas (Tags)</label>
                    <button onClick={handleSuggestTags} disabled={suggestingTags} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 disabled:opacity-50">{suggestingTags ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}{suggestingTags ? 'Generando...' : 'Sugerir con IA'}</button>
                  </div>
                  {fTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {fTags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          {tag}<button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" value={fTagInput} onChange={e => setFTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Anadir etiqueta y presionar Enter" className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400" />
                    <button onClick={addTag} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium">Anadir</button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setFIsHighlighted(!fIsHighlighted)} className={`relative w-10 h-5 rounded-full transition-colors ${fIsHighlighted ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${fIsHighlighted ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Articulo destacado</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancelar</button>
              <div className="flex gap-3">
                <button onClick={() => handleSave('draft')} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50">
                  <FileText size={14} />{saving ? 'Guardando...' : 'Guardar Borrador'}
                </button>
                <button onClick={() => handleSave('published')} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">Publicar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}