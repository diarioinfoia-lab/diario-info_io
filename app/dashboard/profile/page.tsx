'use client'
import { useState, useEffect } from 'react'
import { getMe, updateMe } from '@/lib/api'
import { Edit, Key, Save } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getMe().then(r => {
      const u = r?.user || r
      setUser(u)
      setForm({ name: u?.name || '', email: u?.email || '' })
    }).catch(() => {})
  }, [])

  const initials = user?.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0,2) || 'U'

  const saveProfile = async () => {
    setSaving(true)
    try {
      await updateMe({ name: form.name })
      setUser((u: any) => ({ ...u, name: form.name }))
      setEditing(false)
      setMsg('Perfil actualizado correctamente')
      setTimeout(() => setMsg(''), 3000)
    } catch (e: any) { setMsg(e.message || 'Error') }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona tu información personal y de seguridad.</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Edit className="w-4 h-4"/> Editar
          </button>
        )}
      </div>

      {msg && <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm">{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            {initials}
          </div>
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full text-xs font-semibold">{user?.role}</span>
        </div>

        {/* Info card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Información Personal</h3>
            <p className="text-xs text-gray-400 mb-4">Actualiza tu nombre y correo electrónico.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editing}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                <input value={form.email} disabled className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"/>
              </div>
              {editing && (
                <div className="flex gap-3">
                  <button onClick={() => setEditing(false)} className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300">Cancelar</button>
                  <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                    <Save className="w-4 h-4"/> {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-gray-500"/>
              <h3 className="font-semibold text-gray-900 dark:text-white">Seguridad</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Gestiona tu contraseña y la seguridad de tu cuenta.</p>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Cambiar Contraseña</h4>
              {[['current', 'Contraseña Actual'], ['newPw', 'Nueva Contraseña'], ['confirm', 'Confirmar Contraseña']].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input type="password" value={(pwForm as any)[k]} onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
                </div>
              ))}
              <button className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Actualizar Contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
