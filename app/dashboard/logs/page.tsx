'use client'
import { useState, useEffect } from 'react'
import { Search, Clock } from 'lucide-react'

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api2.diarioinfo.com'
    fetch(`${BASE}/logs?limit=50`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(r => { setLogs(r?.logs || r?.data || (Array.isArray(r) ? r : [])); setTotal(r?.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter(l => JSON.stringify(l).toLowerCase().includes(search.toLowerCase()))
  const formatDate = (d: string) => d ? new Date(d).toLocaleString('es-AR') : '-'

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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por acción (ej: login, article:create)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"/>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
          <span>Usuario</span><span>Acción</span><span>Detalles</span><span>Fecha</span>
        </div>
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        : filtered.length === 0 ? (
          <div className="p-8 text-center"><Clock className="w-12 h-12 text-gray-300 mx-auto mb-3"/><p className="text-gray-500">No hay logs</p></div>
        ) : filtered.map((l, i) => (
          <div key={l._id || i} className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-4 px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 items-center">
            <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{l.user?.name || l.userName || '-'}</span>
            <span className="text-sm font-mono text-rose-600 dark:text-rose-400 truncate">{l.action || l.type || '-'}</span>
            <span className="text-xs text-gray-500 truncate">{l.details || l.message || '-'}</span>
            <span className="text-xs text-gray-400">{formatDate(l.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
