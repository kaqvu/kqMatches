import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch('https://streamed.pk/api/matches/football', {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch matches')
    }

    const data = await response.json()
    
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
