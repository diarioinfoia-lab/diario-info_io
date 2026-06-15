import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header/>
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center mb-6">
          <span className="text-white font-bold text-2xl">D</span>
        </div>
        <h1 className="text-8xl font-black text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">¡Ups! Esta página se tomó el día libre.</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-2">En el mundo digital, un 404 es como un callejón sin salida.</p>
        <blockquote className="border-l-4 border-rose-500 pl-4 text-left italic text-gray-600 dark:text-gray-300 my-6 max-w-sm">
          <p>El mejor momento para plantar un árbol fue hace 20 años.</p>
          <p>El segundo mejor momento es ahora.</p>
        </blockquote>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors">
          🏠 Ir al Inicio
        </Link>
      </div>
      <Footer/>
    </main>
  )
}