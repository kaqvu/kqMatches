import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const validUsername = process.env.ADMIN_USERNAME
    const validPassword = process.env.ADMIN_PASSWORD

    if (!validUsername || !validPassword) {
      return NextResponse.json({ success: false, message: 'Admin credentials not configured' }, { status: 401 })
    }

    if (username === validUsername && password === validPassword) {
      const response = NextResponse.json({ success: true })
      
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
      })

      return response
    }

    return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 })
  }
}
