import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_IDS } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, planType = 'starter' } = await request.json()
    const selectedPriceId = priceId || PRICE_IDS[planType as keyof typeof PRICE_IDS]

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, email')
      .eq('user_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Create or get Stripe customer
    let customerId = business.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: business.email || user.email || undefined,
        metadata: {
          business_id: business.id,
          user_id: user.id,
        },
      })
      customerId = customer.id

      // Update business with Stripe customer ID
      await supabase
        .from('businesses')
        .update({ stripe_customer_id: customerId })
        .eq('id', business.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/dashboard/billing?success=true`,
      cancel_url: `${request.headers.get('origin')}/dashboard/billing?canceled=true`,
      metadata: {
        business_id: business.id,
        user_id: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

