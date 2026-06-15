import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <div>
              <p className="font-bold text-sm">diario info</p>
              <p className="text-xs text-gray-400">Información Inteligente</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">El diario digital de Santiago del Estero</p>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-300">Últimas Noticias</h3>
          <Link href="/" className="block text-sm text-gray-400 hover:text-white py-1 transition-colors">Inicio</Link>
          <Link href="/noticias" className="block text-sm text-gray-400 hover:text-white py-1 transition-colors">Todas las noticias</Link>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-300">Legal</h3>
          <Link href="/privacidad" className="block text-sm text-gray-400 hover:text-white py-1 transition-colors">Política de privacidad</Link>
          <Link href="/terminos" className="block text-sm text-gray-400 hover:text-white py-1 transition-colors">Términos de uso</Link>
          <h3 className="font-semibold mt-4 mb-3 text-sm uppercase tracking-wider text-gray-300">Redes Sociales</h3>
          <a href="https://twitter.com/diarioinfo" target="_blank" rel="noopener noreferrer"
            className="block text-sm text-gray-400 hover:text-white py-1 transition-colors">Twitter / X</a>
          <a href="https://facebook.com/diarioinfo" target="_blank" rel="noopener noreferrer"
            className="block text-sm text-gray-400 hover:text-white py-1 transition-colors">Facebook</a>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} DiarioInfo. Todos los derechos reservados.
      </div>
    </footer>
  )
}