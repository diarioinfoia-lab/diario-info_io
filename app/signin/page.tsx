'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const r = await api.post('/signin', { email, password })
      const token = r.data?.token || r.data?.session?.token
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(r.data?.user || r.data))
        router.push('/dashboard')
      } else { setError('Credenciales incorrectas') }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al iniciar sesión')
    } finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Iniciar sesión</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">DiarioInfo Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 space-y-4">
          {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          <Link href="/" className="hover:text-rose-600 transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </main>
  )
}