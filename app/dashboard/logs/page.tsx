'use client'
import { useState, useEffect } from 'react'
import { getLogs } from '@/lib/api'
import { Search, Clock } from 'lucide-react'

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getLogs().then(r => {
      const data = r?.logs || r?.data || (Array.isArray(r) ? r : [])
      setLogs(data)
      setTotal(r?.total || data.length)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase()) ||
    l.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const actionColor = (a: string) => {
    if (!a) return 'text-gray-500'
    if (a.includes('LOGIN')) return 'text-blue-600 dark:text-blue-400'
    if (a.includes('CREATE') || a.includes('CREAT')) return 'text-green-600 dark:text-green-400'
    if (a.includes('DELETE')) return 'text-red-600 dark:text-red-400'
    if (a.includes('UPDATE') || a.includes('UPDAT')) return 'text-orange-600 dark:text-orange-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logs del Sistema</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Consulta el registro de actividad y eventos importantes del sistema. Total: {total} registros.</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por acción (ej: login, article:create)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"/>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_150px_1fr_140px] gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
          <span>Usuario</span><span>Acción</span><span>Detalles</span><span>Fecha</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
            <Clock className="w-8 h-8 opacity-30"/>
            <p>No hay registros</p>
          </div>
        ) : filtered.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_150px_1fr_140px] gap-4 px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 items-center">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{l.user?.name || l.userId || 'Sistema'}</span>
            <span className={`text-xs font-semibold font-mono ${actionColor(l.action)}`}>{l.action}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{l.details || l.description || '-'}</span>
            <span className="text-xs text-gray-400">{l.createdAt ? new Date(l.createdAt).toLocaleString('es-AR') : '-'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
