'use client'
import { useState, useEffect } from 'react'
import { DollarSign, Search, Trophy, Calendar, Flame, Star, CloudSun, Ticket, X, Send, Bot, ExternalLink } from 'lucide-react'

interface DollarData {
  blue: number | null
  oficial: number | null
}

interface WeatherData {
  temp: number | null
  desc: string
  city: string
}

export default function SidebarTabs() {
  const [openLeft, setOpenLeft] = useState<number | null>(null)
  const [openRight, setOpenRight] = useState<number | null>(null)
  const [dollar, setDollar] = useState<DollarData>({ blue: null, oficial: null })
  const [weather, setWeather] = useState<WeatherData>({ temp: null, desc: '', city: 'Santiago del Estero' })

  useEffect(() => {
    // Fetch dolar rates from dolarapi
    fetch('https://dolarapi.com/v1/dolares/blue')
      .then(r => r.json())
      .then(d => setDollar(prev => ({ ...prev, blue: d.venta })))
      .catch(() => {})
    fetch('https://dolarapi.com/v1/dolares/oficial')
      .then(r => r.json())
      .then(d => setDollar(prev => ({ ...prev, oficial: d.venta })))
      .catch(() => {})
    // Open Graph weather - wttr.in for Santiago del Estero
    fetch('https://wttr.in/Santiago+del+Estero?format=j1')
      .then(r => r.json())
      .then(d => {
        const cur = d.current_condition?.[0]
        if (cur) {
          setWeather({
            temp: parseInt(cur.temp_C),
            desc: cur.weatherDesc?.[0]?.value || '',
            city: 'Santiago del Estero'
          })
        }
      })
      .catch(() => {})
  }, [])

  const toggleLeft = (i: number) => {
    setOpenLeft(prev => prev === i ? null : i)
    setOpenRight(null)
  }
  const toggleRight = (i: number) => {
    setOpenRight(prev => prev === i ? null : i)
    setOpenLeft(null)
  }

  return (
    <>
      {/* LEFT SIDEBAR TABS */}
      {/* Tab 1: Dollar */}
      <div className="fixed transition-all duration-500 ease-out top-24 left-0 z-30">
        <div className="relative group">
          {openLeft === 0 && (
            <div className="absolute top-0 left-0 z-10">
              <div className="rounded-r-3xl border shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-emerald-500/90 border-l-0 border-y border-r w-[210px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenLeft(null)} className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400"/>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Cotización Dólar</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dólar Blue</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {dollar.blue ? ('$' + dollar.blue.toLocaleString('es-AR')) : '...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dólar Oficial</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {dollar.oficial ? ('$' + dollar.oficial.toLocaleString('es-AR')) : '...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-0 left-0 z-10">
            <div className="relative">
              <span className="absolute inset-0 opacity-30 animate-ping rounded-r-full bg-emerald-400 pointer-events-none"></span>
              <button onClick={() => toggleLeft(0)} className="relative h-12 w-12 shadow-xl border-2 border-white transition-all hover:scale-110 rounded-l-none rounded-r-full border-l-0 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center">
                <DollarSign className="h-6 w-6"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 2: Search */}
      <div className="fixed transition-all duration-500 ease-out top-40 left-0 z-30">
        <div className="relative group">
          {openLeft === 1 && (
            <div className="absolute top-0 left-0 z-10">
              <div className="rounded-r-3xl border shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-fuchsia-500/60 border-l-0 border-y border-r w-[240px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenLeft(null)} className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-fuchsia-100 dark:bg-fuchsia-900/40 rounded-full">
                      <Search className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400"/>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Buscar</span>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); const el = (e.target as HTMLFormElement).querySelector('input'); if (el?.value.trim()) window.location.href = '/buscar?q=' + encodeURIComponent(el.value.trim()) }}>
                    <input autoFocus placeholder="Buscar noticias..." className="w-full border border-fuchsia-200 dark:border-fuchsia-800 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400"/>
                    <button type="submit" className="mt-2 w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white text-xs font-bold py-1.5 rounded-lg transition-colors">
                      Buscar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-0 left-0 z-10">
            <div className="relative">
              <span className="absolute inset-0 opacity-30 rounded-r-full bg-fuchsia-400 pointer-events-none"></span>
              <button onClick={() => toggleLeft(1)} className="relative h-12 w-12 shadow-xl border-2 border-white transition-all hover:scale-110 rounded-l-none rounded-r-full border-l-0 bg-fuchsia-500 text-white hover:bg-fuchsia-600 flex items-center justify-center">
                <Search className="h-6 w-6"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 3: Trophy / Most Read */}
      <div className="fixed transition-all duration-500 ease-out top-56 left-0 z-30">
        <div className="relative group">
          {openLeft === 2 && (
            <div className="absolute top-0 left-0 z-10">
              <div className="rounded-r-3xl border shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-sky-500/60 border-l-0 border-y border-r w-[240px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenLeft(null)} className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-sky-100 dark:bg-sky-900/40 rounded-full">
                      <Trophy className="h-4 w-4 text-sky-600 dark:text-sky-400"/>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Lo más leído</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Visitá la home para ver las noticias más leídas del día.</p>
                  <a href="/" className="mt-2 flex items-center gap-1 text-xs text-sky-500 hover:text-sky-600 font-medium">
                    <ExternalLink className="h-3 w-3"/> Ver portada
                  </a>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-0 left-0 z-10">
            <div className="relative">
              <span className="absolute inset-0 opacity-30 rounded-r-full bg-sky-400 pointer-events-none"></span>
              <button onClick={() => toggleLeft(2)} className="relative h-12 w-12 shadow-xl border-2 border-white transition-all hover:scale-110 rounded-l-none rounded-r-full border-l-0 bg-sky-500 text-white hover:bg-sky-600 flex items-center justify-center">
                <Trophy className="h-6 w-6 fill-white/20"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 4: Calendar / Agenda */}
      <div className="fixed transition-all duration-500 ease-out top-72 left-0 z-30">
        <div className="relative group">
          {openLeft === 3 && (
            <div className="absolute top-0 left-0 z-10">
              <div className="rounded-r-3xl border shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-orange-400/80 border-l-0 border-y border-r w-[280px]">
                <div className="px-4 pt-3 pb-2 border-b border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 rounded-tr-3xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-full">
                      <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400"/>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Agenda</span>
                  </div>
                  <button onClick={() => setOpenLeft(null)} className="h-7 w-7 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/40 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                </div>
                <div className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">{new Date().getDate()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{new Date().toLocaleDateString('es-AR', {month:'long', year:'numeric'})}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date().toLocaleDateString('es-AR', {weekday:'long'})}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-0 left-0 z-10">
            <div className="relative">
              <span className="absolute inset-0 opacity-30 rounded-r-full bg-orange-400 pointer-events-none"></span>
              <button onClick={() => toggleLeft(3)} className="relative h-12 w-12 shadow-xl border-2 border-white transition-all hover:scale-110 rounded-l-none rounded-r-full border-l-0 bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center">
                <Calendar className="h-6 w-6"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR TABS */}
      {/* Tab 5: Trending */}
      <div className="fixed transition-all duration-500 ease-out top-24 right-0 z-30">
        <div className="relative flex flex-col items-end group">
          {openRight === 0 && (
            <div className="absolute top-0 right-0 z-10">
              <div className="rounded-l-3xl border shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-red-500/60 border-r-0 border-y border-l w-[220px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenRight(null)} className="absolute top-2 left-2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3 pl-8">
                    <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-full">
                      <Flame className="h-4 w-4 text-red-600 dark:text-red-400"/>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Tendencias</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">Las noticias más populares en este momento.</p>
                  <a href="/" className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium pl-2">
                    <Flame className="h-3 w-3"/> Ver noticias
                  </a>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-0 right-0 z-10">
            <div className="relative">
              <span className="absolute inset-0 opacity-30 rounded-l-full bg-red-400 pointer-events-none"></span>
              <button onClick={() => toggleRight(0)} className="relative h-12 w-12 shadow-xl border-2 border-white transition-all hover:scale-110 rounded-r-none rounded-l-full border-r-0 bg-red-600 text-white hover:bg-red-700 flex items-center justify-center">
                <Flame className="h-6 w-6"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 6: Saved / Favorites */}
      <div className="fixed transition-all duration-500 ease-out top-40 right-0 z-30">
        <div className="relative flex flex-col items-end group">
          {openRight === 1 && (
            <div className="absolute top-0 right-0 z-10">
              <div className="rounded-l-3xl border shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-violet-500/60 border-r-0 border-y border-l w-[240px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenRight(null)} className="absolute top-2 left-2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3 pl-8">
                    <div className="p-1.5 bg-violet-100 dark:bg-violet-900/40 rounded-full">
                      <Star className="h-4 w-4 text-violet-600 dark:text-violet-400"/>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Guardados</span>
                  </div>
                  <div className="flex items-center justify-between pl-8 pr-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Artículos guardados</span>
                    <button className="text-xs text-violet-500 hover:text-violet-600 font-medium">Ver todos</button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 pl-2 text-center">Inicia sesión para guardar artículos.</p>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-0 right-0 z-10">
            <div className="relative">
              <span className="absolute inset-0 opacity-30 rounded-l-full bg-violet-400 pointer-events-none"></span>
              <button onClick={() => toggleRight(1)} className="relative h-12 w-12 shadow-xl border-2 border-white transition-all hover:scale-110 rounded-r-none rounded-l-full border-r-0 bg-violet-600 text-white hover:bg-violet-700 flex items-center justify-center">
                <Star className="h-6 w-6"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 7: Weather */}
      <div className="fixed transition-all duration-500 ease-out top-56 right-0 z-30">
        <div className="relative flex flex-col items-end group">
          {openRight === 2 && (
            <div className="absolute top-0 right-0 z-10">
              <div className="rounded-l-3xl border shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-amber-400/90 border-r-0 border-y border-l w-[240px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenRight(null)} className="absolute top-2 left-2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3 pl-8">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                      <CloudSun className="h-4 w-4 text-amber-600 dark:text-amber-400"/>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Clima</span>
                  </div>
                  <div className="text-center py-2">
                    <div className="text-4xl font-bold text-amber-500">
                      {weather.temp !== null ? weather.temp + '°C' : '...'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{weather.desc || 'Cargando...'}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{weather.city}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-0 right-0 z-10">
            <div className="relative">
              <span className="absolute inset-0 opacity-30 rounded-l-full bg-amber-400 pointer-events-none"></span>
              <button onClick={() => toggleRight(2)} className="relative h-12 w-12 shadow-xl border-2 border-white transition-all hover:scale-110 rounded-r-none rounded-l-full border-r-0 bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center">
                <CloudSun className="h-6 w-6"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 8: Events / Tickets */}
      <div className="fixed transition-all duration-500 ease-out top-72 right-0 z-30">
        <div className="relative flex flex-col items-end group">
          {openRight === 3 && (
            <div className="absolute top-0 right-0 z-10">
              <div className="rounded-l-3xl border shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-lime-500/60 border-r-0 border-y border-l w-[240px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenRight(null)} className="absolute top-2 left-2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3 pl-8">
                    <div className="p-1.5 bg-lime-100 dark:bg-lime-900/40 rounded-full">
                      <Ticket className="h-4 w-4 text-lime-600 dark:text-lime-400"/>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Eventos</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">Próximos eventos y entradas disponibles.</p>
                  <a href="/categoria/deportes" className="mt-2 flex items-center gap-1 text-xs text-lime-600 hover:text-lime-700 font-medium pl-2">
                    <Ticket className="h-3 w-3"/> Ver deportes
                  </a>
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-0 right-0 z-10">
            <div className="relative">
              <span className="absolute inset-0 opacity-30 rounded-l-full bg-lime-400 pointer-events-none"></span>
              <button onClick={() => toggleRight(3)} className="relative h-12 w-12 shadow-xl border-2 border-white transition-all hover:scale-110 rounded-r-none rounded-l-full border-r-0 bg-lime-600 text-white hover:bg-lime-700 flex items-center justify-center">
                <Ticket className="h-6 w-6"/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom floating buttons */}
      <div className="fixed bottom-6 left-6 h-16 w-16 z-40 group">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity blur-sm"></div>
        <a href="/dashboard" className="relative w-full h-full rounded-full bg-indigo-900 dark:bg-indigo-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-2 border-white/20">
          <Send className="h-7 w-7 text-white"/>
        </a>
      </div>

      <div className="fixed bottom-6 right-6 h-16 w-16 z-40 group">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity blur-sm"></div>
        <button className="relative w-full h-full rounded-full bg-indigo-900 dark:bg-indigo-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-2 border-white/20">
          <Bot className="h-7 w-7 text-white"/>
        </button>
      </div>
    </>
  )
}
