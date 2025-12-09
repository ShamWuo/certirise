import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, LogOut, LayoutDashboard, MapPin, Users, CreditCard } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">certirise</span>
            </Link>
            <form action="/api/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/locations">
              <Button variant="ghost" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Locations
              </Button>
            </Link>
            <Link href="/dashboard/employees">
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Employees
              </Button>
            </Link>
            <Link href="/dashboard/billing">
              <Button variant="ghost" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="sm">
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}


