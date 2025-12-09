import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LocationsManager } from '@/components/locations/locations-manager'

export default async function LocationsPage() {
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

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground mt-1">
            Manage multiple business locations
          </p>
        </div>
      </div>
      <LocationsManager businessId={business.id} initialLocations={locations || []} />
    </div>
  )
}

