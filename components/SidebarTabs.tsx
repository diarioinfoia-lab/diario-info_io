'use client'
import { useState, useEffect } from 'react'
import { DollarSign, Search, Trophy, Calendar, Flame, Star, CloudSun, Ticket, X, Send, Bot, ExternalLink, ArrowRightLeft, BarChart3 } from 'lucide-react'
import PollWidget from '@/components/PollWidget'

const API = 'https://api2.diarioinfo.com'

interface DollarData {
  blue: number | null
  oficial: number | null
}

interface WeatherData {
  temp: number | null
  desc: string
  city: string
}

interface ActivePollData {
  slug: string
  title: string
}

export default function SidebarTabs() {
  const [openLeft, setOpenLeft] = useState<number | null>(null)
  const [openRight, setOpenRight] = useState<number | null>(null)
  const [dollar, setDollar] = useState<DollarData>({ blue: null, oficial: null })
  const [weather, setWeather] = useState<WeatherData>({ temp: null, desc: '', city: 'Santiago del Estero' })
  const [converterAmt, setConverterAmt] = useState('1')
  const [converterType, setConverterType] = useState<'blue' | 'oficial'>('blue')
  const [activePoll, setActivePoll] = useState<ActivePollData | null>(null)
  const [pollOpen, setPollOpen] = useState(true)

  useEffect(() => {
    fetch('https://dolarapi.com/v1/dolares/blue')
      .then(r => r.json())
      .then(d => setDollar(prev => ({ ...prev, blue: d.venta })))
      .catch(() => {})
    fetch('https://dolarapi.com/v1/dolares/oficial')
      .then(r => r.json())
      .then(d => setDollar(prev => ({ ...prev, oficial: d.venta })))
      .catch(() => {})
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
    fetch(API + '/polls?status=active&pageSize=1')
      .then(r => r.json())
      .then(d => {
        const p = d && d.polls && d.polls[0]
        if (p) {
          setActivePoll({ slug: p.slug || p._id, title: p.title })
          setPollOpen(true)
        } else {
          setActivePoll(null)
        }
      })
      .catch(() => setActivePoll(null))
  }, [])

  const toggleLeft = (i: number) => {
    setOpenLeft(prev => prev === i ? null : i)
    setOpenRight(null)
  }
  const toggleRight = (i: number) => {
    setOpenRight(prev => prev === i ? null : i)
    setOpenLeft(null)
  }
  const togglePoll = () => {
    setPollOpen(prev => !prev)
  }

  const convertedAmt = () => {
    const rate = converterType === 'blue' ? dollar.blue : dollar.oficial
    if (!rate || !converterAmt) return '...'
    const usd = parseFloat(converterAmt) || 0
    return ('$' + (usd * rate).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }))
  }

  return (
    <>
      {/* LEFT SIDEBAR TABS */}

      {/* Tab 1: Dollar */}
      <div className="fixed transition-all duration-500 ease-out top-24 left-0 z-30">
        <div className="relative">
          {openLeft === 0 && (
            <div className="absolute top-0 left-0 z-10">
              <div className="rounded-r-3xl border shadow-2xl bg-white/97 dark:bg-gray-900/97 backdrop-blur-md border-emerald-500/90 border-l-0 border-y border-r w-[220px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenLeft(null)} className="absolute top-2 right-2 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3 pr-6">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full shrink-0">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"/>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Cotización Dólar</span>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Dólar Blue</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {dollar.blue ? ('$' + dollar.blue.toLocaleString('es-AR')) : '...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Dólar Oficial</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {dollar.oficial ? ('$' + dollar.oficial.toLocaleString('es-AR')) : '...'}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ArrowRightLeft className="h-3 w-3 text-gray-400"/>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Conversor</span>
                    </div>
                    <div className="flex gap-1 mb-1.5">
                      <button onClick={() => setConverterType('blue')} className={'flex-1 text-[9px] font-black py-0.5 rounded-sm transition-all ' + (converterType === 'blue' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-gray-600')}>BLUE</button>
                      <button onClick={() => setConverterType('oficial')} className={'flex-1 text-[9px] font-black py-0.5 rounded-sm transition-all ' + (converterType === 'oficial' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-gray-600')}>OFICIAL</button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 font-medium">USD</span>
                      <input type="number" value={converterAmt} onChange={e => setConverterAmt(e.target.value)} className="flex-1 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 text-xs text-right bg-white dark:bg-gray-800 dark:text-white w-16"/>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-[9px] text-gray-400 uppercase">Resultado (ARS)</span>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{convertedAmt()}</div>
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
        <div className="relative">
          {openLeft === 1 && (
            <div className="absolute top-0 left-0 z-10">
              <div className="rounded-r-3xl border shadow-2xl bg-white/97 dark:bg-gray-900/97 backdrop-blur-md border-fuchsia-500/60 border-l-0 border-y border-r w-[240px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenLeft(null)} className="absolute top-2 right-2 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3 pr-6">
                    <div className="p-1.5 bg-fuchsia-100 dark:bg-fuchsia-900/40 rounded-full shrink-0">
                      <Search className="h-3.5 w-3.5 text-fuchsia-600 dark:text-fuchsia-400"/>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Buscar noticias</span>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); const el = (e.target as HTMLFormElement).querySelector('input'); if (el?.value.trim()) window.location.href = '/buscar?q=' + encodeURIComponent(el.value.trim()) }}>
                    <input autoFocus placeholder="Buscar..." className="w-full border border-fuchsia-200 dark:border-fuchsia-800 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400"/>
                    <button type="submit" className="mt-2 w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white text-[11px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                      <Search className="h-3 w-3"/> Buscar
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

      {/* Tab 3: Trophy */}
      <div className="fixed transition-all duration-500 ease-out top-56 left-0 z-30">
        <div className="relative">
          {openLeft === 2 && (
            <div className="absolute top-0 left-0 z-10">
              <div className="rounded-r-3xl border shadow-2xl bg-white/97 dark:bg-gray-900/97 backdrop-blur-md border-sky-500/60 border-l-0 border-y border-r w-[220px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenLeft(null)} className="absolute top-2 right-2 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3 pr-6">
                    <div className="p-1.5 bg-sky-100 dark:bg-sky-900/40 rounded-full shrink-0">
                      <Trophy className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400"/>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Lo más leído</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Las noticias más leídas del día.</p>
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

      {/* Tab 4: Calendar */}
      <div className="fixed transition-all duration-500 ease-out top-72 left-0 z-30">
        <div className="relative">
          {openLeft === 3 && (
            <div className="absolute top-0 left-0 z-10">
              <div className="rounded-r-3xl border shadow-2xl bg-white/97 dark:bg-gray-900/97 backdrop-blur-md border-orange-400/80 border-l-0 border-y border-r w-[260px]">
                <div className="px-4 pt-3 pb-2 border-b border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 rounded-tr-3xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-full shrink-0">
                      <Calendar className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400"/>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Agenda del día</span>
                  </div>
                  <button onClick={() => setOpenLeft(null)} className="h-7 w-7 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/40 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                </div>
                <div className="p-4 text-center">
                  <div className="text-4xl font-black text-orange-500">{new Date().getDate()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mt-0.5">{new Date().toLocaleDateString('es-AR', {month:'long', year:'numeric'})}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">{new Date().toLocaleDateString('es-AR', {weekday:'long'})}</div>
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
        <div className="relative flex flex-col items-end">
          {openRight === 0 && (
            <div className="absolute top-0 right-0 z-10">
              <div className="rounded-l-3xl border shadow-2xl bg-white/97 dark:bg-gray-900/97 backdrop-blur-md border-red-500/60 border-r-0 border-y border-l w-[220px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenRight(null)} className="absolute top-2 left-2 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3 pl-8">
                    <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-full shrink-0">
                      <Flame className="h-3.5 w-3.5 text-red-600 dark:text-red-400"/>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Tendencias</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-8">Las noticias más populares ahora.</p>
                  <a href="/" className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium pl-8">
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

      {/* Tab 6: Saved */}
      <div className="fixed transition-all duration-500 ease-out top-40 right-0 z-30">
        <div className="relative flex flex-col items-end">
          {openRight === 1 && (
            <div className="absolute top-0 right-0 z-10">
              <div className="rounded-l-3xl border shadow-2xl bg-white/97 dark:bg-gray-900/97 backdrop-blur-md border-violet-500/60 border-r-0 border-y border-l w-[230px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenRight(null)} className="absolute top-2 left-2 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3 pl-8">
                    <div className="p-1.5 bg-violet-100 dark:bg-violet-900/40 rounded-full shrink-0">
                      <Star className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400"/>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Guardados</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2 pl-8">Iniciá sesión para guardar artículos.</p>
                  <a href="/dashboard" className="mt-3 flex items-center justify-center gap-1 text-xs text-violet-500 hover:text-violet-600 font-medium">
                    <ExternalLink className="h-3 w-3"/> Iniciar sesión
                  </a>
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
        <div className="relative flex flex-col items-end">
          {openRight === 2 && (
            <div className="absolute top-0 right-0 z-10">
              <div className="rounded-l-3xl border shadow-2xl bg-white/97 dark:bg-gray-900/97 backdrop-blur-md border-amber-400/90 border-r-0 border-y border-l w-[240px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenRight(null)} className="absolute top-2 left-2 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                  <div className="flex items-center gap-2 mb-2 pl-8">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full shrink-0">
                      <CloudSun className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"/>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Clima</span>
                  </div>
                  <div className="text-center py-2">
                    <div className="text-4xl font-black text-amber-500">
                      {weather.temp !== null ? weather.temp + '°C' : '...'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{weather.desc || 'Cargando...'}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{weather.city}</div>
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

      {/* Tab 8: Tickets / Events */}
      <div className="fixed transition-all duration-500 ease-out top-72 right-0 z-30">
        <div className="relative flex flex-col items-end">
          {openRight === 3 && (
            <div className="absolute top-0 right-0 z-10">
              <div className="rounded-l-3xl border shadow-2xl bg-white/97 dark:bg-gray-900/97 backdrop-blur-md border-lime-500/60 border-r-0 border-y border-l w-[220px]">
                <div className="p-4 relative">
                  <button onClick={() => setOpenRight(null)} className="absolute top-2 left-2 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                  <div className="flex items-center gap-2 mb-3 pl-8">
                    <div className="p-1.5 bg-lime-100 dark:bg-lime-900/40 rounded-full shrink-0">
                      <Ticket className="h-3.5 w-3.5 text-lime-600 dark:text-lime-400"/>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Eventos</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-8">Próximos eventos y entradas.</p>
                  <a href="/categoria/deportes" className="mt-2 flex items-center gap-1 text-xs text-lime-600 hover:text-lime-700 font-medium pl-8">
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

      {/* Tab 9: Encuesta activa */}
      {activePoll && (
        <div className="fixed transition-all duration-500 ease-out top-96 right-0 z-30">
          <div className="relative flex flex-col items-end">
            {pollOpen && (
              <div className="absolute top-0 right-0 z-10">
                <div className="rounded-l-3xl border shadow-2xl bg-white/97 dark:bg-gray-900/97 backdrop-blur-md border-rose-500/60 border-r-0 border-y border-l w-[300px]">
                  <div className="p-4 relative">
                    <button onClick={() => setPollOpen(false)} className="absolute top-2 left-2 h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 z-10">
                      <X className="h-3.5 w-3.5"/>
                    </button>
                    <div className="pl-8">
                      <PollWidget pollId={activePoll.slug} className="!border-0 !shadow-none !p-0" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="absolute top-0 right-0 z-10">
              <div className="relative">
                <span className="absolute inset-0 opacity-30 rounded-l-full bg-rose-400 pointer-events-none"></span>
                <button onClick={togglePoll} className="relative h-12 w-12 shadow-xl border-2 border-white transition-all hover:scale-110 rounded-r-none rounded-l-full border-r-0 bg-rose-600 text-white hover:bg-rose-700 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BOTTOM BUTTONS */}
      <div className="fixed bottom-6 left-6 h-16 w-16 z-40 group">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 opacity-75 group-hover:opacity-100 transition-opacity blur-sm"></div>
        <a href="/dashboard" className="relative w-full h-full rounded-full bg-indigo-900 dark:bg-indigo-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-2 border-white/20">
          <Send className="h-7 w-7 text-white"/>
        </a>
      </div>

      <div className="fixed bottom-6 right-6 h-16 w-16 z-40 group">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 opacity-75 group-hover:opacity-100 transition-opacity blur-sm"></div>
        <button className="relative w-full h-full rounded-full bg-indigo-900 dark:bg-indigo-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-2 border-white/20">
          <Bot className="h-7 w-7 text-white"/>
        </button>
      </div>
    </>
  )
}
