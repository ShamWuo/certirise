import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the business for the authenticated user
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, type, state, city, phone, email')
      .eq('user_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get the compliance item with relationships
    const { data: item, error: itemError } = await supabase
      .from('compliance_items')
      .select(`
        *,
        employees ( name, email, phone ),
        locations ( name, address, city, state, zip_code, phone, email )
      `)
      .eq('id', params.id)
      .eq('business_id', business.id)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Compliance item not found' }, { status: 404 })
    }

    // Attempt to find a matching regulation by state + license name
    let regulation = null as any
    if (business.state) {
      const { data: regData } = await supabase
        .from('regulations')
        .select('*')
        .eq('state', business.state)
        .ilike('license_type', `%${item.name}%`)
        .maybeSingle()

      regulation = regData || null

      // Fallback: match on item_type if name not found
      if (!regulation && item.item_type) {
        const { data: regByType } = await supabase
          .from('regulations')
          .select('*')
          .eq('state', business.state)
          .ilike('license_type', `%${item.item_type}%`)
          .maybeSingle()

        regulation = regByType || null
      }
    }

    return NextResponse.json({
      business,
      item: {
        id: item.id,
        name: item.name,
        item_type: item.item_type,
        license_number: item.license_number,
        expiration_date: item.expiration_date,
        issuing_authority: item.issuing_authority,
        renewal_frequency: item.renewal_frequency,
        last_renewal_date: item.last_renewal_date,
      },
      employee: item.employees,
      location: item.locations,
      regulation,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to build renewal prefill' },
      { status: 500 }
    )
  }
}
