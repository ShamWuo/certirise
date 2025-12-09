import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadDocument } from '@/lib/supabase/storage'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const itemId = formData.get('itemId') as string

    if (!file || !itemId) {
      return NextResponse.json(
        { error: 'File and itemId are required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Verify item belongs to business
    const { data: item } = await supabase
      .from('compliance_items')
      .select('id, business_id')
      .eq('id', itemId)
      .eq('business_id', business.id)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Upload document
    const documentUrl = await uploadDocument(file, business.id, itemId)

    // Update compliance item with document URL
    const { error: updateError } = await supabase
      .from('compliance_items')
      .update({ document_url: documentUrl })
      .eq('id', itemId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: documentUrl })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}


