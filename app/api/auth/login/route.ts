import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { rateLimit } from '@/lib/rate-limit'

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

    // Basic in-memory rate limit; swap to Redis/Edge for production
    const identifier = request.ip || email
    const limit = await rateLimit(identifier, {
      windowMs: 60 * 1000,
      maxRequests: 20,
    })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait and try again.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': limit.remaining.toString(),
            'X-RateLimit-Reset': limit.resetTime.toString(),
          },
        }
      )
    }

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


