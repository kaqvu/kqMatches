"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function MatchRedirect() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const response = await fetch(`/api/matches/${slug}`)
        if (response.ok) {
          const data = await response.json()
          if (data.match && data.match.sources.length > 0) {
            const firstSource = data.match.sources[0].name.toLowerCase()
            router.replace(`/match/${slug}/${firstSource}/1`)
            return
          }
        }
      } catch (error) {
        console.error('Error:', error)
      }
      router.replace('/matches')
    }

    fetchAndRedirect()
  }, [slug, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-muted-foreground">Przekierowanie...</div>
    </div>
  )
}
