"use client"

import { useEffect, useState } from "react"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-[0.07] blur-[100px] pointer-events-none animate-pulse"
        style={{ background: "var(--primary)", animationDuration: "4s" }}
      />
      <div className="relative z-10 text-center px-4">
        <h1
          className={`text-[clamp(4rem,15vw,10rem)] font-bold tracking-[-0.04em] leading-none mb-6 transition-all duration-700 ease-out will-change-transform ${
            mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
          }`}
          style={{
            textShadow: mounted ? "0 0 80px oklch(0.75 0.15 195 / 0.3)" : "none",
            transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
        >
          kq
        </h1>
        <p 
          className={`text-muted-foreground text-lg md:text-xl max-w-md mx-auto transition-all duration-700 ease-out text-balance will-change-transform ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "150ms" }}
        >
          Streamy meczów piłki nożnej
        </p>
      </div>
    </section>
  )
}
