"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, ChevronDown } from "lucide-react"

interface Channel {
  id: string
  name: string
  slug: string
  sources: string[]
  imageUrl?: string
}

export default function AdminPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  const [showChannelPopup, setShowChannelPopup] = useState(false)
  const [popupMounted, setPopupMounted] = useState(false)
  const [channels, setChannels] = useState<Channel[]>([])
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
  const [channelName, setChannelName] = useState("")
  const [channelSources, setChannelSources] = useState<string[]>([""])
  const [channelImageUrl, setChannelImageUrl] = useState("")
  
  const [isSaving, setIsSaving] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [deletePopupMounted, setDeletePopupMounted] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null)
  
  const [channelsExpanded, setChannelsExpanded] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        setIsLoggedIn(data.authenticated)
        
        if (data.authenticated) {
          fetchChannels()
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
    setMounted(false)
    const timer = setTimeout(() => {
      setMounted(true)
    }, 150)
    return () => clearTimeout(timer)
  }, [isLoggedIn])

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/admin/channels')
      const data = await response.json()
      if (data.channels) {
        const sortedChannels = data.channels.sort((a: Channel, b: Channel) => 
          a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
        )
        setChannels(sortedChannels)
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const handleAddChannel = () => {
    setEditingChannel(null)
    setChannelName("")
    setChannelSources([""])
    setChannelImageUrl("")
    setShowChannelPopup(true)
    setTimeout(() => {
      setPopupMounted(true)
    }, 50)
  }

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel)
    setChannelName(channel.name)
    setChannelSources(channel.sources)
    setChannelImageUrl(channel.imageUrl || "")
    setShowChannelPopup(true)
    setTimeout(() => {
      setPopupMounted(true)
    }, 50)
  }

  const handleDeleteItem = async (id: string, name: string) => {
    setItemToDelete({ id, name })
    setShowDeletePopup(true)
    setTimeout(() => {
      setDeletePopupMounted(true)
    }, 50)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const response = await fetch('/api/admin/channels', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemToDelete.id }),
      })

      const data = await response.json()

      if (data.success) {
        fetchChannels()
        setNotificationMessage('Channel deleted')
        setShowNotification(true)
      } else {
        setNotificationMessage('Error deleting item')
        setShowNotification(true)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      setNotificationMessage('Server connection error')
      setShowNotification(true)
    } finally {
      setDeletePopupMounted(false)
      setTimeout(() => {
        setShowDeletePopup(false)
        setItemToDelete(null)
      }, 300)
    }
  }

  const cancelDelete = () => {
    setDeletePopupMounted(false)
    setTimeout(() => {
      setShowDeletePopup(false)
      setItemToDelete(null)
    }, 300)
  }

  const handleSaveChannel = async () => {
    const nameRegex = /^[a-zA-Z0-9 ]+$/
    if (!nameRegex.test(channelName)) {
      setNotificationMessage('Name can only contain letters, numbers and spaces')
      setShowNotification(true)
      return
    }

    const validSources = channelSources.filter(s => s.trim() !== "")
    if (validSources.length === 0) {
      setNotificationMessage('Add at least one source')
      setShowNotification(true)
      return
    }

    const urlRegex = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/
    for (const source of validSources) {
      if (!urlRegex.test(source)) {
        setNotificationMessage('Link must start with http:// or https:// and contain domain')
        setShowNotification(true)
        return
      }
    }

    if (channelImageUrl && !urlRegex.test(channelImageUrl)) {
      setNotificationMessage('Logo must be a valid link (http:// or https://)')
      setShowNotification(true)
      return
    }

    setIsSaving(true)
    try {
      const method = editingChannel ? 'PUT' : 'POST'
      const body = editingChannel 
        ? { id: editingChannel.id, name: channelName, sources: validSources, imageUrl: channelImageUrl || undefined }
        : { name: channelName, sources: validSources, imageUrl: channelImageUrl || undefined }

      const response = await fetch('/api/admin/channels', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        fetchChannels()
        setPopupMounted(false)
        setTimeout(() => {
          setShowChannelPopup(false)
        }, 300)
        setNotificationMessage(editingChannel ? 'Channel updated' : 'Channel added')
        setShowNotification(true)
      } else {
        setNotificationMessage('Error saving channel')
        setShowNotification(true)
      }
    } catch (error) {
      console.error('Error saving channel:', error)
      setNotificationMessage('Server connection error')
      setShowNotification(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setPopupMounted(false)
    setTimeout(() => {
      setShowChannelPopup(false)
    }, 300)
  }

  const addSourceField = () => {
    setChannelSources([...channelSources, ""])
  }

  const removeSourceField = (index: number) => {
    setChannelSources(channelSources.filter((_, i) => i !== index))
  }

  const updateSource = (index: number, value: string) => {
    const newSources = [...channelSources]
    newSources[index] = value
    setChannelSources(newSources)
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
          fetchChannels()
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
        <div className="flex flex-col items-center gap-4">
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
                    Manage kqChannels content
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
                        onClick={() => setChannelsExpanded(!channelsExpanded)}
                        className="flex items-center gap-3 touch-action-manipulation w-full sm:w-auto"
                      >
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">Channels</h2>
                        <div className={`transition-transform duration-300 ${channelsExpanded ? 'rotate-180' : 'rotate-0'}`}>
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </button>
                      {channelsExpanded && (
                        <button
                          onClick={handleAddChannel}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all duration-200 hover:bg-primary/90 active:scale-95 hover:shadow-lg hover:shadow-primary/20 touch-action-manipulation w-full sm:w-auto justify-center"
                        >
                          <Plus className="w-4 h-4" />
                          Add Channel
                        </button>
                      )}
                    </div>
                  
                    <div 
                      className={`grid transition-all duration-500 ease-out ${
                        channelsExpanded 
                          ? 'grid-rows-[1fr] opacity-100 mt-6' 
                          : 'grid-rows-[0fr] opacity-0 mt-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-3">
                          {channels.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No channels</p>
                          ) : (
                            channels.map((channel) => (
                              <div key={channel.id} className="p-4 rounded-lg bg-background/60 backdrop-blur-sm border border-border/40 flex items-center justify-between hover:bg-background/80 transition-all duration-200 hover:border-border/60">
                                <div className="flex-1">
                                  <p className="text-foreground font-medium mb-1">{channel.name}</p>
                                  <p className="text-sm text-muted-foreground mb-2">/{channel.slug}</p>
                                  <p className="text-xs text-muted-foreground">{channel.sources.length} sources</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditChannel(channel)}
                                    className="p-2 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(channel.id, channel.name)}
                                    className="p-2 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
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

        {showChannelPopup && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
              popupMounted ? "bg-background/80 backdrop-blur-sm" : "bg-background/0"
            }`}
            onClick={handleCancel}
          >
            <div 
              className={`w-full max-w-md rounded-2xl bg-secondary/95 backdrop-blur-md border border-border/50 p-6 md:p-8 transition-all duration-300 ease-out max-h-[85vh] overflow-y-auto ${
                popupMounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingChannel ? 'Edit Channel' : 'Add Channel'}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Canal Plus Sport 1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Only letters, numbers and spaces</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Channel Logo (optional)
                  </label>
                  <input
                    type="text"
                    value={channelImageUrl}
                    onChange={(e) => setChannelImageUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Image link (jpg, png, svg)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sources
                  </label>
                  {channelSources.map((source, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => updateSource(index, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="https://..."
                      />
                      {channelSources.length > 1 && (
                        <button
                          onClick={() => removeSourceField(index)}
                          className="px-3 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground hover:bg-secondary active:scale-95 transition-all duration-200 touch-action-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSourceField}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 active:scale-95 transition-all duration-200 touch-action-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                    Add Source
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveChannel}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-action-manipulation"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground font-medium transition-all duration-200 hover:bg-secondary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-action-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeletePopup && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
              deletePopupMounted ? "bg-background/80 backdrop-blur-sm" : "bg-background/0"
            }`}
            onClick={cancelDelete}
          >
            <div 
              className={`w-full max-w-md rounded-2xl bg-secondary/95 backdrop-blur-md border border-border/50 p-6 md:p-8 transition-all duration-300 ease-out ${
                deletePopupMounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Delete Channel
              </h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete channel <span className="font-medium text-foreground">{itemToDelete?.name}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 rounded-lg bg-destructive text-white font-medium transition-all duration-200 hover:bg-destructive/90 active:scale-95 touch-action-manipulation"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-3 rounded-lg bg-secondary/80 border border-border/50 text-foreground font-medium transition-all duration-200 hover:bg-secondary active:scale-95 touch-action-manipulation"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              kqChannels
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div 
              className={`transition-all duration-500 delay-75 ease-out ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <div className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-secondary/50 transition-all duration-200"
                    placeholder="Enter your username"
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
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-secondary/50 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] touch-action-manipulation mt-8"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-muted-foreground/60 mt-8">
            Admin Panel
          </p>
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
