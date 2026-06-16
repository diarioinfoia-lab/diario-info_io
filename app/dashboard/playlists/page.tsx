'use client'
import { ListMusic } from 'lucide-react'
export default function PlaylistsPage() {
  return (<div><div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Playlists</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona las playlists de contenido del sitio.</p></div><div className="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-800 text-center"><ListMusic className="w-16 h-16 text-gray-300 mx-auto mb-4"/><p className="text-gray-500 font-semibold text-lg">Playlists</p><p className="text-sm text-gray-400 mt-2">Funcionalidad en desarrollo.</p></div></div>)
}