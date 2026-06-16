'use client'
import { FileText } from 'lucide-react'

export default function BlocksPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plantillas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administra las plantillas de bloques del sitio.</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
        <p className="text-gray-500 dark:text-gray-400 font-semibold text-lg">Plantillas de Bloques</p>
        <p className="text-sm text-gray-400 mt-2">Funcionalidad en desarrollo.</p>
      </div>
    </div>
  )
}
