'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getArticle, createArticle, updateArticle, getCategories } from '@/lib/api';

interface Category { _id: string; name: string; }

export default function NoticiaEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = !id || id === 'nueva';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    title: '', subtitle: '', content: '', categoryId: '',
    imageUrl: '', status: 'draft', tags: '',
  });

  useEffect(() => {
    loadCategories();
    if (!isNew) loadArticle();
  }, [id]);

  async function loadCategories() {
    try { const d = await getCategories(); setCategories(d.categories || []); } catch {}
  }

  async function loadArticle() {
    try {
      const data = await getArticle(id);
      const a = data.article || data;
      setForm({
        title: a.title || '', subtitle: a.subtitle || '',
        content: a.content || '', categoryId: a.categoryId?._id || a.categoryId || '',
        imageUrl: a.imageUrl || '', status: a.status || 'draft',
        tags: (a.tags || []).join(', '),
      });
    } catch (e: any) { setMsg('Error cargando artículo: ' + e.message); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent, status?: string) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        status: status || form.status,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (isNew) await createArticle(payload);
      else await updateArticle(id, payload);
      router.push('/dashboard/noticias');
    } catch (err: any) { setMsg('Error: ' + err.message); setSaving(false); }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isNew ? 'Nueva noticia' : 'Editar noticia'}</h1>
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">← Volver</button>
      </div>
      {msg && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">{msg}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4 shadow">
          <h2 className="font-semibold text-gray-900 dark:text-white text-lg border-b dark:border-gray-700 pb-3">Contenido</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required
              className="w-full border rounded-lg px-3 py-2 text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Título de la noticia..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo / Copete</label>
            <input value={form.subtitle} onChange={e => setForm(f => ({...f, subtitle: e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Copete o bajada..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenido *</label>
            <textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} required rows={15}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              placeholder="Escribí el contenido de la noticia..." />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4 shadow">
          <h2 className="font-semibold text-gray-900 dark:text-white text-lg border-b dark:border-gray-700 pb-3">Imagen y metadatos</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL de imagen</label>
            <input value={form.imageUrl} onChange={e => setForm(f => ({...f, imageUrl: e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://..." />
            {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 rounded-lg h-40 w-full object-cover" onError={e => (e.currentTarget.style.display='none')} />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({...f, categoryId: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">Sin categoría</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (separados por coma)</label>
            <input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="política, economía, local..." />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" disabled={saving} onClick={e => handleSubmit(e as any, 'published')}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50">
            {saving ? 'Publicando...' : '✓ Publicar'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 border py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}