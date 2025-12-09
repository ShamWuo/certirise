import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BillingDashboard } from '@/components/billing/billing-dashboard'
import { PLANS } from '@/lib/stripe/config'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!business) {
    redirect('/onboarding')
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
      <BillingDashboard
        business={business}
        plans={PLANS}
        success={searchParams.success === 'true'}
        canceled={searchParams.canceled === 'true'}
      />
    </div>
  )
}

