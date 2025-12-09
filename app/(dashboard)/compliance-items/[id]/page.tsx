import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ComplianceItemDetails } from '@/components/compliance/compliance-item-details'

export default async function ComplianceItemDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!business) {
    redirect('/onboarding')
  }

  const { data: item } = await supabase
    .from('compliance_items')
    .select('*, employees(name)')
    .eq('id', params.id)
    .eq('business_id', business.id)
    .single()

  if (!item) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-4xl">
      <ComplianceItemDetails item={item} />
    </div>
  )
}


