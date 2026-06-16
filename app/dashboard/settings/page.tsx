'use client'
import { useState } from 'react'
import { Save, Globe, Palette, Share2, Shield } from 'lucide-react'

const tabs = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'avanzado', label: 'Avanzado', icon: Shield },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [form, setForm] = useState({ siteName: 'diario info', slogan: 'Información Inteligente', email: 'diarionews.io@gmail.com', phone: '+54 9 3854 10-3821' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSave = async () => {
    setSaving(true); setMsg('')
    await new Promise(r => setTimeout(r, 800))
    setMsg('Configuración guardada correctamente')
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ajustes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configura la apariencia y el comportamiento del sitio.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white dark:bg-gray-900 text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <tab.icon className="w-4 h-4"/>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 max-w-2xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Información del Sitio</h3>
          <div className="space-y-4">
            {[['siteName', 'Nombre del Sitio'], ['slogan', 'Slogan'], ['email', 'Email de Contacto'], ['phone', 'Teléfono']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
              </div>
            ))}
          </div>
          {msg && <p className="text-sm text-green-600 mt-3">{msg}</p>}
          <button onClick={handleSave} disabled={saving}
            className="mt-4 flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
            <Save className="w-4 h-4"/> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}

      {activeTab === 'apariencia' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 max-w-2xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Apariencia</h3>
          <p className="text-sm text-gray-500">Opciones de tema y apariencia del panel disponibles próximamente.</p>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 max-w-2xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Redes Sociales</h3>
          <div className="space-y-4">
            {[['twitter', 'Twitter / X'], ['facebook', 'Facebook'], ['instagram', 'Instagram']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <input placeholder={`URL de ${label}`}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'avanzado' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 max-w-2xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Avanzado</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Modo Mantenimiento</p>
                <p className="text-xs text-gray-500">Desactiva el acceso público temporalmente</p>
              </div>
              <div className="w-10 h-5 bg-gray-300 rounded-full cursor-pointer"/>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Caché del Sistema</p>
                <p className="text-xs text-gray-500">Limpiar caché y regenerar páginas</p>
              </div>
              <button className="text-xs px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">Limpiar</button>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Desarrollo Bajo Demanda</p>
                <p className="text-sm text-gray-500">Para personalizaciones avanzadas, contacta al equipo de desarrollo.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
