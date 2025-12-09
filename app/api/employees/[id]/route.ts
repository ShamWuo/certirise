import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Verify ownership
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const updateData: any = { ...body }
    
    // Generate token if portal is being enabled
    if (body.portal_enabled) {
      const { data: employee } = await supabase
        .from('employees')
        .select('portal_access_token')
        .eq('id', params.id)
        .eq('business_id', business.id)
        .single()

      if (!employee?.portal_access_token) {
        updateData.portal_access_token = randomBytes(32).toString('hex')
      }
    } else {
      updateData.portal_access_token = null
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('business_id', business.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ employee })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', params.id)
      .eq('business_id', business.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

