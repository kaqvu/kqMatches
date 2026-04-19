import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter')
    
    let apiUrl = 'https://streamed.pk/api/matches/football'
    
    if (filter === 'live-popular') {
      apiUrl = 'https://streamed.pk/api/matches/live/popular'
    } else if (filter === 'live') {
      apiUrl = 'https://streamed.pk/api/matches/live'
    } else if (filter === 'popular') {
      apiUrl = 'https://streamed.pk/api/matches/football/popular'
    }
    
    const response = await fetch(apiUrl, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch matches')
    }

    let data = await response.json()
    
    if (filter === 'live' || filter === 'live-popular') {
      data = data.filter((match: any) => match.category === 'football')
    }
    
    const matches = data.map((match: any) => {
      let imageUrl = match.poster ? `https://streamed.pk${match.poster}` : undefined
      
      if (!imageUrl && match.teams?.home?.badge && match.teams?.away?.badge) {
        imageUrl = `https://streamed.pk/api/images/poster/${match.teams.home.badge}/${match.teams.away.badge}.webp`
      }
      
      return {
        id: match.id,
        name: match.title,
        slug: match.id,
        imageUrl,
        date: match.date,
        popular: match.popular,
        teams: match.teams,
        sources: match.sources.map((s: any) => ({
          name: s.source,
          id: s.id
        }))
      }
    })

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}
