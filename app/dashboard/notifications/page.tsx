'use client'
import { useState, useEffect } from 'react'
import { getNotifications } from '@/lib/api'
import { Bell, Mail, Trash2, Info } from 'lucide-react'
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getNotifications().then(r => setNotifications(Array.isArray(r) ? r : r?.notifications || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])
  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificaciones</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manténte al día con las últimas novedades y alertas de tu cuenta.</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        : notifications.length === 0 ? (<div className="p-12 text-center"><Bell className="w-12 h-12 text-gray-300 mx-auto mb-3"/><p className="text-gray-500">No tienes notificaciones</p></div>)
        : notifications.map((n, i) => (
          <div key={n._id || i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 group">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Info className="w-4 h-4 text-blue-500"/></div>
            <div className="flex-1"><p className="text-sm font-medium text-gray-800 dark:text-gray-200">{n.message || n.title || 'Notificación'}</p><p className="text-xs text-gray-400">{fmt(n.createdAt)}</p></div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg"><Mail className="w-3.5 h-3.5"/></button>
              <button className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}