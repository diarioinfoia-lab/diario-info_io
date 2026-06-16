'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Trash2, MoreVertical, FileText, Bold, Italic, Underline, List, ListOrdered, Link2, Image, Video, Sparkles, Upload, X, ChevronDown, Calendar } from 'lucide-react';
import { getArticles, createArticle, updateArticle, deleteArticle, getCategories } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  color?: string;
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
  commentsDisabled?: boolean;
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


// Simple Rich Text Editor
function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);

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

  const insertLink = () => {
    const url = prompt('URL del enlace:');
    if (url) execCmd('createLink', url);
  };

  const insertImage = () => {
    const url = prompt('URL de la imagen:');
    if (url) execCmd('insertImage', url);
  };

  const insertVideo = () => {
    const url = prompt('URL del video (Youtube embed):');
    if (url) {
      const iframe = `<div class="video-wrapper"><iframe src="${url}" frameborder="0" allowfullscreen style="width:100%;max-width:560px;height:315px;"></iframe></div>`;
      document.execCommand('insertHTML', false, iframe);
      editorRef.current?.focus();
      onChange(editorRef.current?.innerHTML || '');
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-wrap">
        <button type="button" onClick={() => execCmd('bold')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Negrita"><Bold size={15} /></button>
        <button type="button" onClick={() => execCmd('italic')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Italica"><Italic size={15} /></button>
        <button type="button" onClick={() => execCmd('underline')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Subrayado"><Underline size={15} /></button>
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Lista"><List size={15} /></button>
        <button type="button" onClick={() => execCmd('insertOrderedList')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Lista numerada"><ListOrdered size={15} /></button>
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button type="button" onClick={insertLink} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Insertar enlace"><Link2 size={15} /></button>
        <button type="button" onClick={insertImage} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Insertar imagen"><Image size={15} /></button>
        <button type="button" onClick={insertVideo} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Insertar video"><Video size={15} /></button>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        className="min-h-[200px] p-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 outline-none focus:ring-0 prose prose-sm max-w-none"
        style={{minHeight: '200px'}}
      />
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
  const [editTarget, setEditTarget] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Form state
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
        getArticles({ limit: 100 }),
        getCategories({ limit: 100 }),
      ]);
      if (artData.articles) setArticles(artData.articles);
      if (catData.categories) setCategories(catData.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
      if (editTarget) {
        await updateArticle(editTarget.id, payload);
        showToast(status === 'published' ? 'Articulo publicado' : 'Borrador guardado');
      } else {
        await createArticle(payload);
        showToast(status === 'published' ? 'Articulo publicado' : 'Borrador guardado');
      }
      setShowModal(false);
      loadData();
    } catch {
      showToast('Error al guardar', false);
    } finally {
      setSaving(false);
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
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Noticias</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Edita, crea y gestiona todos los articulos del diario.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Upload size={15} />
            Importar Noticia
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Plus size={15} />
            Nueva Noticia
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por titulo, categoria o autor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-blue-400"
          />
        </div>
        {/* Status filter */}
        <div className="relative">
          <button
            onClick={() => { setShowStatusMenu(!showStatusMenu); setShowCategoryMenu(false); }}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
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
        {/* Category filter */}
        <div className="relative">
          <button
            onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowStatusMenu(false); }}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Categorias {filterCategory && <span className="text-blue-500">•</span>}
          </button>
          {showCategoryMenu && (
            <div className="absolute right-0 top-10 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]">
              <button onClick={() => { setFilterCategory(''); setShowCategoryMenu(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Todas</button>
              {categories.map(c => (
                <button key={c.id} onClick={() => { setFilterCategory(c.id); setShowCategoryMenu(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: c.color || '#6b7280'}} />
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
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
            <div key={art.id} className="grid grid-cols-[1fr_160px_120px_100px_120px_80px] items-center px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  {art.isHighlighted && <span className="text-yellow-500 text-xs font-bold">DEST</span>}
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{art.title}</p>
                </div>
                {art.description && <p className="text-xs text-gray-400 truncate mt-0.5">{art.description}</p>}
              </div>
              <div>
                <span className="text-xs px-2 py-1 rounded-full font-medium text-white" style={{backgroundColor: getCatColor(art.category)}}>
                  {getCatName(art.category)}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {typeof art.createdBy === 'object' ? art.createdBy?.name : '-'}
              </div>
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${art.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                  {art.status === 'published' ? 'Publicado' : 'Borrador'}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {art.createdAt ? new Date(art.createdAt).toLocaleDateString('es-AR') : '-'}
              </div>
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


      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Modal header */}
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

            {/* Modal body - scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
              
              {/* Section 1: Contenido Principal */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Contenido Principal</h3>
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Titulo del articulo</label>
                  <input
                    type="text"
                    value={fTitle}
                    onChange={e => { setFTitle(e.target.value); if (!editTarget) setFSlug(slugify(e.target.value)); }}
                    placeholder="El titular principal"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug (URL amigable)</label>
                  <input
                    type="text"
                    value={fSlug}
                    onChange={e => setFSlug(e.target.value)}
                    placeholder="titulo-de-la-noticia"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Descripcion corta</label>
                  <textarea
                    value={fDesc}
                    onChange={e => setFDesc(e.target.value)}
                    placeholder="Un resumen atractivo para listados y SEO"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Imagen Principal</label>
                  {fFeaturedImage ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={fFeaturedImage} alt="featured" className="w-full h-40 object-cover" />
                      <button
                        onClick={() => setFFeaturedImage('')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                      <p className="text-sm text-gray-500 text-center mb-2">Anade una imagen al cuerpo</p>
                      <p className="text-xs text-gray-400 text-center mb-3">La primera imagen que agregues se mostrara aqui como la principal.</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={fFeaturedImage}
                          onChange={e => setFFeaturedImage(e.target.value)}
                          placeholder="URL de la imagen..."
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400"
                        />
                        <button
                          onClick={() => {}}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                          Seleccionar Manualmente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Cuerpo de la Noticia */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Cuerpo de la Noticia</h3>
                <RichTextEditor value={fContent} onChange={setFContent} />
              </div>

              {/* Section 3: Detalles de Publicacion */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Detalles de Publicacion</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Categoria</label>
                    <select
                      value={fCategory}
                      onChange={e => setFCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400"
                    >
                      <option value="">Seleccionar categoria</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {/* Date */}
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

              {/* Section 4: Jerarquia y SEO */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Jerarquia y SEO</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Prioridad</label>
                    <select
                      value={fPriority}
                      onChange={e => setFPriority(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400"
                    >
                      {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  {/* Destination */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Destino</label>
                    <select
                      value={fDestination}
                      onChange={e => setFDestination(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400"
                    >
                      {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Etiquetas (Tags)</label>
                    <button className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600">
                      <Sparkles size={12} />
                      Sugerir con IA
                    </button>
                  </div>
                  {fTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {fTags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={fTagInput}
                      onChange={e => setFTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Anadir etiqueta y presionar Enter"
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                    >
                      Anadir
                    </button>
                  </div>
                </div>

                {/* Highlighted toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFIsHighlighted(!fIsHighlighted)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${fIsHighlighted ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${fIsHighlighted ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Articulo destacado</span>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button onClick={() => setShowModal(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Cancelar
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FileText size={14} />
                  {saving ? 'Guardando...' : 'Guardar Borrador'}
                </button>
                <button
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
