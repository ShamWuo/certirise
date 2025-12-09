import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { env } from '@/lib/env'

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

    const supabase = createClient()
    const supabaseAdmin = createSupabaseAdmin(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Immediately confirm and store metadata so users can log in right away
    if (data.user) {
      const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
        data.user.id,
        {
          email_confirm: true,
          user_metadata: { name },
        }
      )

      if (adminError) {
        console.error('Signup admin update error:', adminError)
        return NextResponse.json(
          { error: 'Account created but confirmation failed. Please try signing in.' },
          { status: 500 }
        )
      }
    }

    // Sign the user in to establish session cookies
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Signup auto-login error:', signInError)
      return NextResponse.json(
        { error: signInError.message },
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


