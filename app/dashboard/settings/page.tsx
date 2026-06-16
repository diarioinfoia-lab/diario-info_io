'use client'
import { useState } from 'react'
import { Save, Construction } from 'lucide-react'
const TABS = ['General', 'Apariencia', 'Social', 'Avanzado']
export default function SettingsPage() {
  const [tab, setTab] = useState('General')
  const [form, setForm] = useState({ siteName: 'diario info', slogan: 'Información Inteligente' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 800)); setSaved(true); setSaving(false); setTimeout(() => setSaved(false), 3000) }
  return (
    <div>
      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-800/50 rounded-xl flex items-center justify-center shrink-0"><Construction className="w-6 h-6 text-rose-600 dark:text-rose-400"/></div>
        <div><p className="font-semibold text-gray-900 dark:text-white">Desarrollo Bajo Demanda</p><p className="text-sm text-gray-500 dark:text-gray-400">Esta funcionalidad se desarrollará e implementará según los requerimientos específicos del cliente.</p></div>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ajustes Generales</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personaliza y configura la plataforma de diario info.</p></div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60"><Save className="w-4 h-4"/> {saved ? 'Guardado ✓' : saving ? 'Guardando...' : 'Guardar Cambios'}</button>
      </div>
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>{t}</button>)}
      </div>
      {tab === 'General' ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Información del Sitio</h3>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Sitio</label><input value={form.siteName} onChange={e => setForm(f => ({...f, siteName: e.target.value}))} className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eslogan</label><input value={form.slogan} onChange={e => setForm(f => ({...f, slogan: e.target.value}))} className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-800 text-center"><Construction className="w-12 h-12 text-gray-300 mx-auto mb-3"/><p className="text-gray-500">Sección en desarrollo</p></div>
      )}
    </div>
  )
}