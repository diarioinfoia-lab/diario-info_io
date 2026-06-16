'use client'
import { useState, useEffect } from 'react'
import { getMe, updateProfile, updatePassword } from '@/lib/api'
import { User, Lock, Save } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgPass, setMsgPass] = useState('')

  useEffect(() => {
    getMe().then(r => {
      const u = r?.user || r
      setProfile(u)
      setProfileForm({ name: u?.name || '', email: u?.email || '' })
    }).catch(() => {})
  }, [])

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    try {
      await updateProfile(profileForm)
      setMsg('Perfil actualizado correctamente')
      const stored = localStorage.getItem('user')
      if (stored) {
        try { localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...profileForm })) } catch {}
      }
    } catch (err: any) { setMsg('Error: ' + (err?.message || 'desconocido')) }
    setSaving(false)
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) { setMsgPass('Las contraseñas no coinciden'); return }
    setSavingPass(true); setMsgPass('')
    try {
      await updatePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      setMsgPass('Contraseña actualizada correctamente')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) { setMsgPass('Error: ' + (err?.message || 'desconocido')) }
    setSavingPass(false)
  }

  const initials = profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'A'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona tu información personal y de seguridad.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
            {initials}
          </div>
          <p className="font-bold text-gray-900 dark:text-white">{profile?.name || 'Usuario'}</p>
          <p className="text-sm text-gray-500">{profile?.email}</p>
          <span className="mt-2 text-xs px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full font-medium">{profile?.role || 'Admin'}</span>
        </div>

        {/* Info personal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-rose-600"/>
              <h3 className="font-semibold text-gray-900 dark:text-white">Información Personal</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Actualiza tu nombre y correo electrónico.</p>
            <form onSubmit={handleProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                <input value={profileForm.name} onChange={e => setProfileForm(f => ({...f, name: e.target.value}))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                <input type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({...f, email: e.target.value}))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
              </div>
              {msg && <p className={`text-sm ${msg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                <Save className="w-4 h-4"/> {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-rose-600"/>
              <h3 className="font-semibold text-gray-900 dark:text-white">Seguridad</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Gestiona tu contraseña y la seguridad de tu cuenta.</p>
            <form onSubmit={handlePassword} className="space-y-4">
              {[['currentPassword', 'Contraseña Actual', 'password'], ['newPassword', 'Nueva Contraseña', 'password'], ['confirmPassword', 'Confirmar Contraseña', 'password']].map(([key, label, type]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input type={type} value={(passForm as any)[key]} onChange={e => setPassForm(f => ({...f, [key]: e.target.value}))}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
                </div>
              ))}
              {msgPass && <p className={`text-sm ${msgPass.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{msgPass}</p>}
              <button type="submit" disabled={savingPass}
                className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                <Save className="w-4 h-4"/> {savingPass ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
