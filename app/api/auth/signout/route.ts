import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'

export async function POST(request: NextRequest) {
  const supabase = createRouteClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', request.url))
}


