'use client';
import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '@/lib/api';

interface User { _id: string; name: string; email: string; role: string; createdAt: string; }

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [msg, setMsg] = useState('');

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUser(form);
      setMsg('Usuario creado exitosamente');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'editor' });
      loadUsers();
    } catch (err: any) { setMsg('Error: ' + err.message); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar usuario "${name}"?`)) return;
    try { await deleteUser(id); loadUsers(); } catch (e: any) { setMsg('Error: ' + e.message); }
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    editor: 'bg-blue-100 text-blue-800',
    viewer: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Nuevo usuario</button>
      </div>
      {msg && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">{msg}</div>}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 dark:text-white">Nuevo usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Crear usuario</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50 dark:text-white">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rol</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-800'}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(u._id, u.name)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
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