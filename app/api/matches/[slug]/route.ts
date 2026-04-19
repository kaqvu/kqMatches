import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const response = await fetch('https://streamed.pk/api/matches/football', {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch matches')
    }

    const data = await response.json()
    const matchData = data.find((m: any) => m.id === slug)

    if (!matchData) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    const sourcePromises = matchData.sources.map(async (source: any) => {
      try {
        const streamResponse = await fetch(
          `https://streamed.pk/api/stream/${source.source}/${source.id}`,
          { cache: 'no-store' }
        )
        
        if (!streamResponse.ok) {
          return null
        }

        const streams = await streamResponse.json()
        
        return {
          name: source.source,
          urls: streams.map((stream: any) => stream.embedUrl)
        }
      } catch (error) {
        console.error(`Error fetching streams for ${source.source}:`, error)
        return null
      }
    })

    const sourcesData = await Promise.all(sourcePromises)
    const validSources = sourcesData.filter(s => s !== null && s.urls.length > 0)

    let imageUrl = matchData.poster ? `https://streamed.pk${matchData.poster}` : undefined
    
    if (!imageUrl && matchData.teams?.home?.badge && matchData.teams?.away?.badge) {
      imageUrl = `https://streamed.pk/api/images/poster/${matchData.teams.home.badge}/${matchData.teams.away.badge}.webp`
    }

    const match = {
      id: matchData.id,
      name: matchData.title,
      slug: matchData.id,
      imageUrl,
      date: matchData.date,
      popular: matchData.popular,
      teams: matchData.teams,
      sources: validSources
    }

    return NextResponse.json({ match })
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 })
  }
}
