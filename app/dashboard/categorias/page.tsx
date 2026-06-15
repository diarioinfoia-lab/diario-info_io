'use client';
import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';

interface Category { _id: string; name: string; slug: string; color?: string; order?: number; }

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', color: '#3b82f6' });
  const [msg, setMsg] = useState('');

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openNew() { setEditing(null); setForm({ name: '', slug: '', color: '#3b82f6' }); setShowForm(true); }
  function openEdit(c: Category) { setEditing(c); setForm({ name: c.name, slug: c.slug, color: c.color || '#3b82f6' }); setShowForm(true); }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    setForm(f => ({ ...f, name, slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) { await updateCategory(editing._id, form); setMsg('Categoría actualizada'); }
      else { await createCategory(form); setMsg('Categoría creada'); }
      setShowForm(false); loadCategories();
    } catch (err: any) { setMsg('Error: ' + err.message); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar categoría "${name}"?`)) return;
    try { await deleteCategory(id); loadCategories(); } catch (e: any) { setMsg('Error: ' + e.message); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorías</h1>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Nueva categoría</button>
      </div>
      {msg && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">{msg}</div>}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 dark:text-white">{editing ? 'Editar' : 'Nueva'} categoría</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input value={form.name} onChange={handleNameChange} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))} className="w-12 h-10 rounded border" />
                  <input value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))} className="flex-1 border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">No hay categorías. ¡Creá la primera!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Color</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Slug</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {categories.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <span className="w-6 h-6 rounded-full inline-block" style={{ backgroundColor: c.color || '#3b82f6' }} />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-sm">{c.slug}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800 mr-4 text-sm font-medium">Editar</button>
                    <button onClick={() => handleDelete(c._id, c.name)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}