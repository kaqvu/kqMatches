"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"

export function FloatingHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])
  
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path === "/matches" && (pathname === "/matches" || pathname.startsWith('/match/'))) return true
    if (path === "/panel" && pathname === "/admin") return true
    return false
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pt-4 md:pt-6 px-4 pb-4">
        <nav className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-secondary/60 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5 will-change-transform transition-all duration-300 hover:shadow-xl hover:shadow-black/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-primary/25 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <Link href="/" className="flex items-center gap-3 group touch-action-manipulation">
              <div className="w-8 h-8 md:w-10 md:h-10 relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                <Image 
                  src="/icon.svg" 
                  alt="kqMatches" 
                  width={40} 
                  height={40}
                  className="w-full h-full transition-all duration-300 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300 rounded-lg" />
              </div>
              <span className="text-base md:text-lg font-bold text-foreground tracking-tight transition-colors duration-200 group-hover:text-primary">
                kqMatches
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              <Link
                href="/matches"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 touch-action-manipulation ${
                  isActive("/matches")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 active:scale-95"
                }`}
              >
                Matches
              </Link>
              
              <Link
                href="/"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 touch-action-manipulation ${
                  isActive("/")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 active:scale-95"
                }`}
              >
                kq
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 touch-action-manipulation ${
                  isActive("/panel")
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 active:scale-95"
                }`}
              >
                Panel
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-foreground hover:bg-secondary/50 active:scale-95 transition-all duration-200 touch-action-manipulation"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'bg-background/80 backdrop-blur-sm' : 'bg-background/0 backdrop-blur-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        <div 
          className={`absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl transition-all duration-300 ease-out ${
            mobileMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
          }`}
        >
          <div className="p-4 space-y-2">
            <Link
              href="/matches"
              onClick={handleLinkClick}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 active:scale-95 touch-action-manipulation ${
                isActive("/matches")
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-secondary/50"
              }`}
            >
              Matches
            </Link>
            
            <Link
              href="/"
              onClick={handleLinkClick}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 active:scale-95 touch-action-manipulation ${
                isActive("/")
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-secondary/50"
              }`}
            >
              kq
            </Link>

            <div className="pt-2 mt-2 border-t border-border/50">
              <Link
                href="/admin"
                onClick={handleLinkClick}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 active:scale-95 touch-action-manipulation ${
                  isActive("/panel")
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-foreground hover:bg-secondary/50"
                }`}
              >
                Panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
