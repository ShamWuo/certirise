import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body.email as string
    const password = body.password as string

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createRouteClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // Return success with redirect URL
    return NextResponse.json(
      { success: true, redirect: '/dashboard' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred during login' },
      { status: 500 }
    )
  }
}


