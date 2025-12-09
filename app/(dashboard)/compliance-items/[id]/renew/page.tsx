import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RenewComplianceItemForm } from '@/components/compliance/renew-compliance-item-form'

export default async function RenewComplianceItemPage({
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
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Renew Compliance Item</h1>
      <RenewComplianceItemForm item={item} />
    </div>
  )
}


