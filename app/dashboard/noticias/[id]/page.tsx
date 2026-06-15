'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getArticle, createArticle, updateArticle, getCategories } from '@/lib/api';

interface Category { _id: string; name: string; }
interface Props { params: { id: string }; }

export default function NoticiaEditorPage({ params }: Props) {
  const router = useRouter();
  const { id } = params;
  const isNew = id === 'nueva';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', subtitle: '', content: '', categoryId: '', imageUrl: '', status: 'draft', tags: '' });

  useEffect(() => {
    getCategories().then(d => setCategories(d.categories || [])).catch(() => {});
    if (!isNew) {
      getArticle(id).then(data => {
        const a = data.article || data;
        setForm({ title: a.title||'', subtitle: a.subtitle||'', content: a.content||'', categoryId: a.categoryId?._id||a.categoryId||'', imageUrl: a.imageUrl||'', status: a.status||'draft', tags: (a.tags||[]).join(', ') });
      }).catch(e => setError(e.message)).finally(() => setLoading(false));
    }
  }, [id, isNew]);

  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); }

  async function save(publishStatus?: string) {
    setSaving(true); setError('');
    try {
      const payload = { ...form, status: publishStatus||form.status, tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [] };
      if (isNew) await createArticle(payload); else await updateArticle(id, payload);
      router.push('/dashboard/noticias');
    } catch (e: any) { setError(e.message); setSaving(false); }
  }

  if (loading) return <div className="py-12 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isNew ? 'Nueva noticia' : 'Editar noticia'}</h1>
        <button onClick={() => router.back()} className="text-gray-500 text-sm">Volver</button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titulo *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitulo</label>
          <input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenido *</label>
          <textarea value={form.content} onChange={e => set('content', e.target.value)} required rows={14} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" /></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL imagen</label>
          <input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
            <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Sin categoria</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option>
            </select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
          <input value={form.tags} onChange={e => set('tags', e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="politica, local..." /></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => save()} disabled={saving} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
          <button onClick={() => save('published')} disabled={saving} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50">{saving ? 'Publicando...' : 'Publicar'}</button>
          <button onClick={() => router.back()} className="px-6 border py-3 rounded-lg dark:text-white">Cancelar</button>
        </div>
      </div>
    </div>
  );
}