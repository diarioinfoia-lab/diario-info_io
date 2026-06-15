'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getArticles, deleteArticle } from '@/lib/api';

interface Article { _id: string; title: string; status: string; categoryId?: { name: string }; createdAt: string; }

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  published: { label: 'Publicado', cls: 'bg-green-100 text-green-800' },
  draft: { label: 'Borrador', cls: 'bg-yellow-100 text-yellow-800' },
  archived: { label: 'Archivado', cls: 'bg-gray-100 text-gray-800' },
};

export default function NoticiasPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [msg, setMsg] = useState('');
  const LIMIT = 20;

  useEffect(() => { loadArticles(); }, [page, search]);

  async function loadArticles() {
    setLoading(true);
    try {
      const data = await getArticles({ page, limit: LIMIT, search });
      setArticles(data.articles || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e: any) { setMsg('Error: ' + e.message); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm('Eliminar: ' + title + '?')) return;
    try { await deleteArticle(id); loadArticles(); } catch (e: any) { setMsg('Error: ' + e.message); }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Noticias</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} articulos</p>
        </div>
        <button onClick={() => router.push('/dashboard/noticias/nueva')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
          + Nueva noticia
        </button>
      </div>

      {msg && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{msg}</div>}

      <div className="mb-4">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar noticias..." className="w-full md:w-80 border rounded-lg px-4 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
          <p className="text-4xl mb-3">📰</p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{search ? 'Sin resultados' : 'No hay noticias'}</p>
          {!search && <button onClick={() => router.push('/dashboard/noticias/nueva')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Crear primera noticia</button>}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Titulo</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Categoria</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {articles.map(a => {
                  const s = STATUS_LABELS[a.status] || STATUS_LABELS.draft;
                  return (
                    <tr key={a._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4"><p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{a.title}</p></td>
                      <td className="px-6 py-4 text-gray-500 text-sm hidden md:table-cell">{a.categoryId?.name || '—'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm hidden lg:table-cell">{formatDate(a.createdAt)}</td>
                      <td className="px-6 py-4"><span className={'px-2 py-1 rounded-full text-xs font-medium ' + s.cls}>{s.label}</span></td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => router.push('/dashboard/noticias/' + a._id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                        <button onClick={() => handleDelete(a._id, a.title)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:text-white">Anterior</button>
              <span className="text-sm text-gray-500">Pagina {page} de {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:text-white">Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}