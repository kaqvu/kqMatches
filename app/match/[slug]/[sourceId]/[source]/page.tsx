"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"

interface Match {
  id: string
  name: string
  slug: string
  sources: {
    name: string
    urls: string[]
  }[]
  imageUrl?: string
  date?: number
  popular?: boolean
}

function PageSkeleton() {
  return (
    <div className="min-h-screen pt-24 md:pt-32">
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16 animate-pulse">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-4 bg-secondary/50 rounded w-16" />
              <div className="h-6 bg-secondary/50 rounded-full w-24" />
            </div>
            <div className="h-12 md:h-16 bg-secondary/50 rounded w-3/4 mb-4" />
            <div className="h-6 bg-secondary/50 rounded w-1/2" />
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            <div className="w-full lg:w-auto order-2 lg:order-1 animate-pulse">
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="h-6 bg-secondary/50 rounded w-20" />
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="h-4 bg-secondary/50 rounded w-16" />
                    <div className="flex flex-wrap gap-2">
                      <div className="h-9 bg-secondary/30 rounded-lg w-24" />
                      <div className="h-9 bg-secondary/30 rounded-lg w-24" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 bg-secondary/50 rounded w-16" />
                    <div className="flex flex-wrap gap-2">
                      <div className="h-9 bg-secondary/30 rounded-lg w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 order-1 lg:order-2">
              <div className="relative w-full animate-pulse" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute top-0 left-0 w-full h-full rounded-xl md:rounded-2xl bg-secondary/30 border border-border/30 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function MatchPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const sourceId = params.sourceId as string
  const sourceParam = params.source as string
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedSourceGroup, setSelectedSourceGroup] = useState("")
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [sourceNotFound, setSourceNotFound] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchMatch()
  }, [slug])

  useEffect(() => {
    if (match && sourceId && sourceParam) {
      const sourceGroup = match.sources.find((s: any) => s.name.toLowerCase() === sourceId.toLowerCase())
      if (sourceGroup) {
        const sourceIndex = parseInt(sourceParam) - 1
        if (sourceIndex >= 0 && sourceIndex < sourceGroup.urls.length) {
          setSelectedSourceGroup(sourceGroup.name)
          setSelectedSourceIndex(sourceIndex)
          setSourceNotFound(false)
          setIframeLoading(true)
        } else {
          setSourceNotFound(true)
        }
      } else {
        setSourceNotFound(true)
      }
    }
  }, [match, sourceId, sourceParam])

  useEffect(() => {
    if (!match?.date) return

    const updateCountdown = () => {
      const now = Date.now()
      const matchTime = match.date
      const diff = matchTime - now

      if (diff <= 0) {
        setIsLive(true)
        setTimeRemaining('')
      } else {
        setIsLive(false)
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [match?.date])

  const fetchMatch = async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await fetch(`/api/matches/${slug}`)
      if (response.status === 404) {
        notFound()
        return
      }
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      if (data.match) {
        setMatch(data.match)
      }
    } catch (error) {
      console.error('Error fetching match:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSourceChange = (groupName: string, index: number) => {
    if (selectedSourceGroup === groupName && selectedSourceIndex === index) return
    
    setIframeLoading(true)
    setSelectedSourceGroup(groupName)
    setSelectedSourceIndex(index)
    router.push(`/match/${slug}/${groupName.toLowerCase()}/${index + 1}`, { scroll: false })
  }

  if (loading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-28 md:pt-32">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Błąd ładowania</h3>
          <p className="text-muted-foreground mb-4">Nie udało się załadować meczu</p>
          <button
            onClick={fetchMatch}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-95 transition-all duration-200 touch-action-manipulation"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    )
  }

  if (!match) {
    return notFound()
  }

  if (sourceNotFound) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 pt-28 md:pt-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] animate-pulse"
            style={{
              background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative z-10 text-center">
          <h1
            className={`text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-4 transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{
              textShadow: "0 0 60px oklch(0.75 0.15 195 / 0.4)",
            }}
          >
            404
          </h1>
          <p className={`text-muted-foreground text-base md:text-lg lg:text-xl mb-2 transition-all duration-700 delay-150 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Nie ma takiego źródła
          </p>
          <button
            onClick={() => router.push(`/match/${slug}/${match.sources[0].name.toLowerCase()}/1`)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 active:scale-95 transition-all duration-300 ease-out touch-action-manipulation ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            Przejdź do pierwszego źródła
          </button>
        </div>
      </div>
    )
  }

  const currentSourceGroup = match.sources.find(s => s.name === selectedSourceGroup)
  const currentUrl = currentSourceGroup?.urls[selectedSourceIndex]

  return (
    <div className="min-h-screen pt-24 md:pt-32">
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div 
            className={`mb-12 md:mb-16 transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-center gap-4 mb-3 md:mb-4">
              <p className="text-primary text-xs md:text-sm font-medium tracking-[0.2em] uppercase">
                MECZ
              </p>
              {isLive ? (
                <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs md:text-sm font-bold tracking-wider animate-pulse">
                  LIVE
                </span>
              ) : timeRemaining ? (
                <span className="px-3 py-1 rounded-full bg-secondary/80 text-foreground text-xs md:text-sm font-medium">
                  {timeRemaining}
                </span>
              ) : null}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tight mb-4 md:mb-6">
              {match.name}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Transmisja na żywo
            </p>
          </div>

          <div 
            className={`flex flex-col lg:flex-row gap-4 md:gap-6 transition-all duration-700 delay-150 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <div className="w-full lg:w-auto order-2 lg:order-1">
              <div className="flex flex-col gap-3 md:gap-4">
                <h2 className="text-base md:text-lg font-bold text-foreground">Źródła</h2>
                <div className="flex flex-col gap-4">
                  {match.sources.map((sourceGroup) => (
                    <div key={sourceGroup.name} className="flex flex-col gap-2">
                      <div className="text-xs md:text-sm font-bold text-primary tracking-[0.2em] uppercase">
                        {sourceGroup.name}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sourceGroup.urls.map((url, index) => {
                          const isActive = selectedSourceGroup === sourceGroup.name && selectedSourceIndex === index
                          return (
                            <button
                              key={`${sourceGroup.name}-${index}`}
                              onClick={() => handleSourceChange(sourceGroup.name, index)}
                              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-all duration-300 ease-out border touch-action-manipulation will-change-transform whitespace-nowrap ${
                                isActive
                                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                  : 'bg-secondary/50 border-border/50 text-foreground hover:bg-secondary hover:shadow-md active:scale-95'
                              }`}
                            >
                              Źródło {index + 1}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 order-1 lg:order-2">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <div 
                  className={`absolute top-0 left-0 w-full h-full rounded-xl md:rounded-2xl bg-secondary/30 border border-border/30 flex items-center justify-center transition-opacity duration-300 ${
                    iframeLoading ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                <iframe
                  key={`${selectedSourceGroup}-${selectedSourceIndex}`}
                  src={currentUrl}
                  className="absolute top-0 left-0 w-full h-full rounded-xl md:rounded-2xl border border-border/30 bg-background transition-opacity duration-500"
                  style={{ opacity: iframeLoading ? 0 : 1 }}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  onLoad={() => setIframeLoading(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
