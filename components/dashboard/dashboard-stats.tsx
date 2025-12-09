'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { daysUntil, getStatusColor, getStatusEmoji } from '@/lib/utils'
import { ComplianceItem } from '@/lib/types/database'
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react'

interface DashboardStatsProps {
  items: (ComplianceItem & { employees?: { name: string } | null })[]
}

export function DashboardStats({ items }: DashboardStatsProps) {
  const now = new Date()
  const next90Days = new Date()
  next90Days.setDate(now.getDate() + 90)

  const upcomingItems = items.filter(item => {
    const expiration = new Date(item.expiration_date)
    const days = daysUntil(expiration)
    return days <= 90 && days >= 0
  })

  const overdueItems = items.filter(item => {
    const expiration = new Date(item.expiration_date)
    return expiration < now && item.status !== 'renewed'
  })

  const activeItems = items.filter(item => item.status === 'active')

  const nextItem = items.find(item => {
    const expiration = new Date(item.expiration_date)
    return expiration > now && item.status === 'active'
  })

  const nextItemDays = nextItem ? daysUntil(nextItem.expiration_date) : null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Items</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeItems.length}</div>
          <p className="text-xs text-muted-foreground">
            Total compliance items
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingItems.length}</div>
          <p className="text-xs text-muted-foreground">
            Expiring in next 90 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <AlertTriangle className="h-4 w-4 text-danger" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-danger">{overdueItems.length}</div>
          <p className="text-xs text-muted-foreground">
            Require immediate attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Deadline</CardTitle>
          <Clock className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {nextItemDays !== null ? `${nextItemDays} days` : '—'}
          </div>
          <p className="text-xs text-muted-foreground">
            {nextItem ? nextItem.name : 'No upcoming deadlines'}
          </p>
        </CardContent>
      </Card>

      {items.length === 0 && (
        <Card className="md:col-span-4">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
              <p className="text-muted-foreground">
                No upcoming deadlines. Add compliance items to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


