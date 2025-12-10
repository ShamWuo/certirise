import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = (body.name as string | undefined)?.trim()
    const email = body.email as string
    const password = body.password as string

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    const supabase = createRouteClient()

    // Basic in-memory rate limit; swap to Redis/Edge for production
    const identifier = request.ip || email
    const limit = await rateLimit(identifier, {
      windowMs: 60 * 1000,
      maxRequests: 10,
    })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please wait and try again.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': limit.remaining.toString(),
            'X-RateLimit-Reset': limit.resetTime.toString(),
          },
        }
      )
    }
    const supabaseAdmin = createSupabaseAdmin(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (adminError) {
      const isDuplicate =
        adminError.status === 422 ||
        (typeof adminError.code === 'string' && adminError.code.includes('already'))

      return NextResponse.json(
        {
          error: isDuplicate ? 'An account with this email already exists' : adminError.message,
        },
        { status: isDuplicate ? 409 : adminError.status || 400 }
      )
    }

    if (!data.user) {
      throw new Error('Failed to create user')
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Signup auto-login error:', signInError)
      return NextResponse.json(
        { error: 'Account created, but automatic login failed. Please sign in manually.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, redirect: '/onboarding' }, { status: 200 })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred during signup' },
      { status: 500 }
    )
  }
}


