import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AddComplianceItemForm } from '@/components/compliance/add-compliance-item-form'

export default async function NewComplianceItemPage() {
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

  // Get employees for dropdown
  const { data: employees } = await supabase
    .from('employees')
    .select('id, name')
    .eq('business_id', business.id)

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Add Compliance Item</h1>
      <AddComplianceItemForm businessId={business.id} employees={employees || []} />
    </div>
  )
}


