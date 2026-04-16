"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"

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

export default function AdminPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  const [matches, setMatches] = useState<Match[]>([])
  
  const [matchesExpanded, setMatchesExpanded] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        setIsLoggedIn(data.authenticated)
        
        if (data.authenticated) {
          fetchMatches()
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setMounted(false)
    const timer = setTimeout(() => {
      setMounted(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [isLoggedIn])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/admin/matches')
      const data = await response.json()
      if (data.matches) {
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    }
  }

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showNotification])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setMounted(false)
        setTimeout(() => {
          setIsLoggedIn(true)
          setShowNotification(false)
          fetchMatches()
        }, 100)
      } else {
        setNotificationMessage(data.message || 'Invalid username or password')
        setShowNotification(true)
        setUsername("")
        setPassword("")
      }
    } catch (error) {
      console.error('Login error:', error)
      setNotificationMessage('Server connection error')
      setShowNotification(true)
    }
  }

  const handleLogout = async () => {
    try {
      setMounted(false)
      await fetch('/api/auth/logout', { method: 'POST' })
      setTimeout(() => {
        setIsLoggedIn(false)
      }, 100)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 opacity-100">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <>
        <div className="min-h-screen pt-24 md:pt-32 relative overflow-hidden">
          <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-secondary/20 pointer-events-none" />
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] opacity-[0.07] blur-[100px] pointer-events-none animate-pulse"
            style={{ background: "var(--primary)", animationDuration: "4s" }}
          />
          
          <section className="py-16 px-4 md:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div 
                className={`mb-12 md:mb-16 transition-all duration-500 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4 mb-3 md:mb-4">
                    <p className="text-primary text-xs md:text-sm font-medium tracking-[0.2em] uppercase">
                      PANEL
                    </p>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-lg bg-secondary/80 backdrop-blur-md border border-border/50 text-sm font-medium text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                    >
                      Logout
                    </button>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground tracking-tight mb-4 md:mb-6">
                    Admin
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Manage kqMatches content
                  </p>
                </div>
              </div>
            
              <div 
                className={`transition-all duration-500 delay-75 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gradient-to-br from-secondary/40 via-secondary/30 to-secondary/20 border border-border/40 p-4 md:p-6 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        onClick={() => setMatchesExpanded(!matchesExpanded)}
                        className="flex items-center gap-3 touch-action-manipulation w-full sm:w-auto"
                      >
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">Matches</h2>
                        <div className={`transition-transform duration-300 ${matchesExpanded ? 'rotate-180' : 'rotate-0'}`}>
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </button>
                    </div>
                  
                    <div 
                      className={`grid transition-all duration-500 ease-out ${
                        matchesExpanded 
                          ? 'grid-rows-[1fr] opacity-100 mt-6' 
                          : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-3">
                          {matches.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No matches available</p>
                          ) : (
                            matches.map((match) => (
                              <div key={match.id} className="p-4 rounded-lg bg-background/60 backdrop-blur-sm border border-border/40 hover:bg-background/80 transition-all duration-200 hover:border-border/60">
                                <div className="flex-1">
                                  <p className="text-foreground font-medium mb-1">{match.name}</p>
                                  <p className="text-sm text-muted-foreground mb-2">/{match.slug}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {match.sources.length} source groups
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
            showNotification ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <div className="px-6 py-4 rounded-lg bg-secondary/90 backdrop-blur-md border border-border/50 shadow-lg">
            <p className="text-muted-foreground text-sm">
              {notificationMessage}
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Login
            </h1>
            <p className="text-muted-foreground">
              kqMatches Admin Panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div 
              className={`rounded-2xl bg-secondary/20 border border-border/30 p-6 md:p-8 transition-all duration-500 delay-75 ease-out ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-200 hover:bg-primary/90 active:scale-95 touch-action-manipulation"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          showNotification ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="px-6 py-4 rounded-lg bg-secondary/90 backdrop-blur-md border border-border/50 shadow-lg">
          <p className="text-muted-foreground text-sm">
            {notificationMessage}
          </p>
        </div>
      </div>
    </>
  )
}
