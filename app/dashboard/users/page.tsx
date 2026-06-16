'use client'
import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api'
import { Plus, Search, MoreHorizontal, Trash2, Edit, Users } from 'lucide-react'

const ROLES = ['Admin', 'Director', 'Editor', 'Reader']
const ROLE_ICONS: Record<string, string> = { Admin: '👑', Director: '👁', Editor: '📋', Reader: '📖' }
const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Director: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Editor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Reader: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await getUsers()
      const data = r?.users || r?.data || (Array.isArray(r) ? r : [])
      setUsers(data.map((u: any) => ({ ...u, _id: u._id || u.id })))
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try { await deleteUser(id); setUsers(u => u.filter(x => x._id !== id)) } catch { alert('Error al eliminar') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona los usuarios, roles y permisos de acceso a la plataforma.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4"/> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"/>
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500">
            <option value="">Todos los Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[1fr_160px_120px_80px] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
          <span>Usuario</span><span>Rol</span><span>Estado</span><span>Acciones</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-gray-400">
            <Users className="w-10 h-10 opacity-30"/>
            <p className="text-sm">No hay usuarios</p>
          </div>
        ) : filtered.map(u => (
          <div key={u._id} className="grid grid-cols-[1fr_160px_120px_80px] gap-4 px-6 py-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {u.name ? u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name || 'Sin nombre'}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{ROLE_ICONS[u.role] || '👤'}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[u.role] || ROLE_COLORS.Reader}`}>{u.role || 'Reader'}</span>
            </div>
            <div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.disabledAt ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                {u.disabledAt ? 'Inactivo' : 'Activo'}
              </span>
            </div>
            <div className="relative">
              <button onClick={() => setOpenMenu(openMenu === u._id ? null : u._id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MoreHorizontal className="w-4 h-4"/>
              </button>
              {openMenu === u._id && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10">
                  <button onClick={() => { setEditing(u); setShowModal(true); setOpenMenu(null) }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Edit className="w-3.5 h-3.5"/> Editar
                  </button>
                  <button onClick={() => { handleDelete(u._id); setOpenMenu(null) }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-3.5 h-3.5"/> Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <UserModal
          user={editing}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}

function UserModal({ user, onClose, onSave }: any) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', role: user?.role || 'Reader', password: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { alert('Nombre y email son requeridos'); return }
    setSaving(true)
    try {
      const payload: any = { name: form.name, email: form.email, role: form.role }
      if (form.password) payload.password = form.password
      if (user) await updateUser(user._id, payload)
      else await createUser({ ...payload, password: form.password || 'Temp1234!' })
      onSave()
    } catch (e: any) { alert(e.message || 'Error al guardar') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          {[['name', 'Nombre Completo', 'text'], ['email', 'Email', 'email'], ['password', user ? 'Nueva Contraseña (opcional)' : 'Contraseña', 'password']].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
            <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500">
              {ROLES.map(r => <option key={r} value={r}>{ROLE_ICONS[r]} {r}</option>)}
            </select>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
