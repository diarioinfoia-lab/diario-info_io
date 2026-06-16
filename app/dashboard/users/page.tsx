'use client'
import { useState, useEffect } from 'react'
import { getUsers, createUser, deleteUser } from '@/lib/api'
import { Plus, Search, MoreHorizontal, Edit, Trash2, UserCircle } from 'lucide-react'

const ROLES = ['Admin', 'Director', 'Editor', 'Reader']
const ROLE_ICONS: Record<string, string> = { Admin: '👑', Director: '👁', Editor: '🖊', Reader: '📖' }
const ROLE_COLORS: Record<string, string> = {
  Admin: 'text-purple-600 dark:text-purple-400',
  Director: 'text-rose-600 dark:text-rose-400',
  Editor: 'text-orange-600 dark:text-orange-400',
  Reader: 'text-blue-600 dark:text-blue-400'
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await getUsers({ limit: 50 })
      setUsers(r?.users || r?.data || (Array.isArray(r) ? r : []))
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u =>
    (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter)
  )

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try { await deleteUser(id); setUsers(u => u.filter(x => x._id !== id)) } catch { alert('Error') }
    setOpenMenu(null)
  }

  const initials = (name: string) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona los usuarios, roles y permisos de acceso a la plataforma.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4"/> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 flex gap-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"/>
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500">
            <option value="">Todos los Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr_80px] gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
          <span>Usuario</span><span>Rol</span><span>Estado</span><span>Acciones</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No hay usuarios</div>
        ) : (
          filtered.map(u => (
            <div key={u._id} className="grid grid-cols-[2fr_1fr_1fr_80px] gap-4 px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {initials(u.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-sm font-medium ${ROLE_COLORS[u.role] || 'text-gray-600'}`}>
                <span>{ROLE_ICONS[u.role] || '👤'}</span>
                <span>{u.role}</span>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.status === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {u.status === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="relative">
                <button onClick={() => setOpenMenu(openMenu === u._id ? null : u._id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-500"/>
                </button>
                {openMenu === u._id && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 min-w-[140px]">
                    <button onClick={() => setOpenMenu(null)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Edit className="w-3.5 h-3.5"/> Editar
                    </button>
                    <button onClick={() => handleDelete(u._id)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-3.5 h-3.5"/> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showNew && <UserModal onClose={() => setShowNew(false)} onSave={() => { setShowNew(false); load() }}/>}
    </div>
  )
}

function UserModal({ onClose, onSave }: any) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Reader' })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) { alert('Todos los campos son requeridos'); return }
    setSaving(true)
    try { await createUser(form); onSave() }
    catch (e: any) { alert(e.message || 'Error') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">Nuevo Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {[['name', 'Nombre Completo', 'text'], ['email', 'Email', 'email'], ['password', 'Contraseña', 'password']].map(([k, label, type]) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input type={type} value={(form as any)[k]} onChange={e => set(k, e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-between p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
            {saving ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </div>
    </div>
  )
}
