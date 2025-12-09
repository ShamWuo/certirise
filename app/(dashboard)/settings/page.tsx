import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
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
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <SettingsForm business={business} />
    </div>
  )
}

