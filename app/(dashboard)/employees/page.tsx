import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EmployeesManager } from '@/components/employees/employees-manager'

export default async function EmployeesPage() {
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

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and their certifications
          </p>
        </div>
      </div>
      <EmployeesManager businessId={business.id} initialEmployees={employees || []} />
    </div>
  )
}

