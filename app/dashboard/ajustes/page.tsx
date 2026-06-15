'use client';
import { useState, useEffect } from 'react';
import { getMe } from '@/lib/api';

export default function AjustesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then(d => setUser(d.user || d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ajustes</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow space-y-4 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white text-lg border-b dark:border-gray-700 pb-3">Mi perfil</h2>
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-lg">{user.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{user.role}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No se pudo cargar el perfil.</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow space-y-4 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white text-lg border-b dark:border-gray-700 pb-3">Información del sitio</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Frontend</span>
            <span className="font-medium dark:text-white">ia2.diarioinfo.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">API</span>
            <span className="font-medium dark:text-white">api2.diarioinfo.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Repositorio</span>
            <a href="https://github.com/diarioinfoia-lab/diario-info_io" target="_blank" className="text-blue-600 hover:underline">diarioinfoia-lab/diario-info_io</a>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Plataforma</span>
            <span className="font-medium dark:text-white">Vercel (Next.js 14)</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
        <h2 className="font-semibold text-gray-900 dark:text-white text-lg border-b dark:border-gray-700 pb-3">API Status</h2>
        <APIStatus />
      </div>
    </div>
  );
}

function APIStatus() {
  const [status, setStatus] = useState<any>(null);
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + '/health')
      .then(r => r.json()).then(setStatus).catch(() => setStatus({ status: 'error' }));
  }, []);
  if (!status) return <p className="text-gray-500 text-sm">Verificando...</p>;
  return (
    <div className="flex items-center gap-3">
      <span className={`w-3 h-3 rounded-full ${status.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm dark:text-white">
        API: <strong>{status.status}</strong> | MongoDB: <strong>{status.mongo}</strong>
      </span>
    </div>
  );
}