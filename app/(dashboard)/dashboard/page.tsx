import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ComplianceItemsList } from '@/components/dashboard/compliance-items-list'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { ComplianceScore } from '@/components/dashboard/compliance-score'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if business exists
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!business) {
    redirect('/onboarding')
  }

  // Get compliance items
  const { data: items } = await supabase
    .from('compliance_items')
    .select('*, employees(name)')
    .eq('business_id', business.id)
    .order('expiration_date', { ascending: true })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {business.name}
          </p>
        </div>
        <Link href="/dashboard/compliance-items/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardStats items={items || []} />
        </div>
        <div>
          <ComplianceScore items={items || []} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Upcoming (Next 90 Days)</h2>
        <ComplianceItemsList items={items || []} />
      </div>
    </div>
  )
}


