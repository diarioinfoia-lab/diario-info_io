'use client'
import { useState, useEffect } from 'react'
import { getNotifications } from '@/lib/api'
import { Bell, Check } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications().then(r => {
      setNotifications(r?.notifications || r?.data || (Array.isArray(r) ? r : []))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificaciones</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manténte al día con las últimas novedades y alertas del sistema.</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center gap-3 text-gray-400">
            <Bell className="w-12 h-12 opacity-30"/>
            <p className="text-sm font-medium">No hay notificaciones</p>
            <p className="text-xs text-gray-400">Cuando haya actividad, aparecerá aquí</p>
          </div>
        ) : notifications.map((n, i) => (
          <div key={i} className="flex items-start gap-4 p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
              {n.read ? <Check className="w-4 h-4 text-gray-400"/> : <Bell className="w-4 h-4 text-rose-500"/>}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{n.message || n.title || 'Notificación'}</p>
              {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
              <p className="text-xs text-gray-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString('es-AR') : ''}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-2"/>}
          </div>
        ))}
      </div>
    </div>
  )
}
