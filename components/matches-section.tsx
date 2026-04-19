"use client"

import { useEffect, useState, useRef } from "react"
import { Hash, AlertCircle, Search } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

interface Match {
  id: string
  name: string
  slug: string
  sources: {
    name: string
    id: string
  }[]
  imageUrl?: string
  date?: number
  popular?: boolean
}

function MatchSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-secondary/20 animate-pulse">
      <div className="w-full aspect-video bg-secondary/50" />
    </div>
  )
}

export function MatchesSection() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [filterPopular, setFilterPopular] = useState(true)
  const [filterLive, setFilterLive] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const isInitialMount = useRef(true)

  const groupMatchesByDate = (matches: Match[]) => {
    const grouped: { [key: string]: Match[] } = {}
    
    matches.forEach(match => {
      if (match.date) {
        const date = new Date(match.date)
        const dateKey = date.toISOString().split('T')[0]
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(match)
      }
    })
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const matchDate = new Date(date)
    matchDate.setHours(0, 0, 0, 0)
    
    const isToday = matchDate.getTime() === today.getTime()
    
    const dayOfWeek = date.toLocaleDateString('pl-PL', { weekday: 'long' })
    const dayNumber = date.getDate()
    const month = date.toLocaleDateString('pl-PL', { month: 'long' }).toUpperCase()
    
    if (isToday) {
      return {
        label: 'DZISIAJ',
        day: dayNumber.toString(),
        month: month,
        isToday: true
      }
    }
    
    const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
    
    return {
      label: capitalizedDay,
      day: dayNumber.toString(),
      month: month,
      isToday: false
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchMatches()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleItems((prev) => new Set(prev).add(index))
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [filterPopular, filterLive])

  useEffect(() => {
    const query = searchParams.get('search') || ''
    setSearchQuery(query)
    if (isInitialMount.current) {
      isInitialMount.current = false
    }
  }, [searchParams])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    // Aktualizuj URL natychmiast bez router.push
    const newUrl = value ? `${pathname}?search=${encodeURIComponent(value)}` : pathname
    window.history.replaceState({}, '', newUrl)
  }

  const fetchMatches = async () => {
    try {
      let url = '/api/matches'
      
      if (filterLive && filterPopular) {
        url = '/api/matches?filter=live-popular'
      } else if (filterLive) {
        url = '/api/matches?filter=live'
      } else if (filterPopular) {
        url = '/api/matches?filter=popular'
      }
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      if (data.matches) {
        setMatches(data.matches)
        setError(false)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const filteredMatches = matches.filter(match => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return match.name.toLowerCase().includes(query)
  })

  useEffect(() => {
    if (!loading && filteredMatches.length > 0) {
      const elements = document.querySelectorAll('[data-index]')
      elements.forEach((el) => {
        observerRef.current?.observe(el)
      })
    }
  }, [loading, filteredMatches])

  const getTotalSources = (match: Match) => {
    return match.sources.length
  }

  return (
    <section className="min-h-[80vh] py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div 
          className={`mb-12 md:mb-16 transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-primary text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-3 md:mb-4">
            Mecze
          </p>
          <div className="flex flex-col gap-4 mb-4 md:mb-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tight">
                Matches
              </h1>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setFilterPopular(!filterPopular)}
                  className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 touch-action-manipulation ${
                    filterPopular
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  Popular
                </button>
                <button
                  onClick={() => setFilterLive(!filterLive)}
                  className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 touch-action-manipulation ${
                    filterLive
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  Live
                </button>
              </div>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Szukaj meczów..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/30 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
            Oglądaj mecze piłki nożnej na żywo z najlepszych lig świata
          </p>
        </div>

        <div 
          className={`transition-all duration-700 delay-150 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {[...Array(10)].map((_, i) => (
                <MatchSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Błąd ładowania</h3>
              <p className="text-muted-foreground mb-4">Nie udało się załadować meczów</p>
              <button
                onClick={fetchMatches}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all duration-200 touch-action-manipulation"
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : filteredMatches.length === 0 && searchQuery ? (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/50 mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Brak wyników</h3>
              <p className="text-muted-foreground mb-4">Nie znaleziono meczów dla &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => handleSearchChange('')}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all duration-200 touch-action-manipulation"
              >
                Wyczyść wyszukiwanie
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/50 mb-4">
                <Hash className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Brak meczów</h3>
              <p className="text-muted-foreground">Nie ma jeszcze dostępnych meczów</p>
            </div>
          ) : (
            <div className="space-y-12">
              {groupMatchesByDate(filteredMatches).map(([dateKey, dateMatches], groupIndex) => {
                const dateInfo = formatDateLabel(dateKey)
                return (
                  <div key={dateKey}>
                    {groupIndex > 0 && (
                      <div className="mb-12 border-t border-border/30" />
                    )}
                    
                    <div className="relative">
                      <div className="absolute left-0 top-0 -translate-x-full pr-6 hidden lg:block">
                        <div className="text-center w-24">
                          <div className={`text-sm font-bold mb-1 ${dateInfo.isToday ? 'text-red-500' : 'text-foreground'}`}>
                            {dateInfo.label}
                          </div>
                          <div className={`text-3xl font-bold mb-1 ${dateInfo.isToday ? 'text-red-500' : 'text-foreground'}`}>
                            {dateInfo.day}
                          </div>
                          <div className={`text-sm font-bold ${dateInfo.isToday ? 'text-red-500' : 'text-foreground'}`}>
                            {dateInfo.month}
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:hidden mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`text-sm font-bold ${dateInfo.isToday ? 'text-red-500' : 'text-foreground'}`}>
                            {dateInfo.label}
                          </div>
                          <div className={`text-2xl font-bold ${dateInfo.isToday ? 'text-red-500' : 'text-foreground'}`}>
                            {dateInfo.day}
                          </div>
                          <div className={`text-sm font-bold ${dateInfo.isToday ? 'text-red-500' : 'text-foreground'}`}>
                            {dateInfo.month}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                        {dateMatches.map((match, index) => (
                          <Link
                            key={match.id}
                            href={`/match/${match.slug}/${match.sources[0].name.toLowerCase()}/1`}
                            data-index={index}
                            className={`group block transition-all duration-150 ease-out touch-action-manipulation will-change-transform ${
                              visibleItems.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                            style={{ transitionDelay: `${index * 25}ms` }}
                          >
                            <div className="relative w-full aspect-video overflow-hidden bg-secondary/30 rounded-xl transition-shadow duration-300">
                              {match.imageUrl ? (
                                <img 
                                  src={match.imageUrl} 
                                  alt={match.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                                  onError={(e) => {
                                    const target = e.currentTarget
                                    target.style.display = 'none'
                                    const parent = target.parentElement
                                    if (parent) {
                                      parent.classList.add('flex', 'items-center', 'justify-center')
                                      const placeholder = document.createElement('div')
                                      placeholder.className = 'w-full h-full bg-secondary/50 flex items-center justify-center'
                                      placeholder.innerHTML = '<svg class="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
                                      parent.appendChild(placeholder)
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                                  <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              
                              {match.date && (
                                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-secondary/80 backdrop-blur-sm text-xs font-medium text-foreground transition-all duration-200 group-hover:bg-red-500 group-hover:text-white">
                                  {new Date(match.date).toLocaleTimeString('pl-PL', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-2">
                              <h3 className="text-sm md:text-base font-bold text-foreground line-clamp-2 transition-colors duration-200 group-hover:text-primary">
                                {match.name}
                              </h3>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
