'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { daysUntil, formatDate, getStatusEmoji } from '@/lib/utils'
import { ComplianceItem } from '@/lib/types/database'
import Link from 'next/link'
import { Eye, CheckCircle2 } from 'lucide-react'

interface ComplianceItemsListProps {
  items: (ComplianceItem & { employees?: { name: string } | null })[]
}

export function ComplianceItemsList({ items }: ComplianceItemsListProps) {
  const now = new Date()
  const next90Days = new Date()
  next90Days.setDate(now.getDate() + 90)

  const upcomingItems = items
    .filter(item => {
      const expiration = new Date(item.expiration_date)
      const days = daysUntil(expiration)
      return days <= 90 && days >= 0 && item.status === 'active'
    })
    .sort((a, b) => {
      const dateA = new Date(a.expiration_date)
      const dateB = new Date(b.expiration_date)
      return dateA.getTime() - dateB.getTime()
    })

  if (upcomingItems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground mb-4">
              No items expiring in the next 90 days.
            </p>
            <Link href="/dashboard/compliance-items/new">
              <Button>Add Compliance Item</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {upcomingItems.map(item => {
        const days = daysUntil(item.expiration_date)
        const emoji = getStatusEmoji(days)
        const expirationDate = formatDate(item.expiration_date)
        const employeeName = item.employees?.name

        return (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <span>{emoji}</span>
                    <span>{item.name}</span>
                    {employeeName && (
                      <span className="text-sm font-normal text-muted-foreground">
                        — {employeeName}
                      </span>
                    )}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Expires:</p>
                  <p className="font-medium">{expirationDate}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {days === 0
                      ? 'Expires today'
                      : days < 0
                      ? `${Math.abs(days)} days overdue`
                      : `${days} days remaining`}
                  </p>
                </div>

                {item.license_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">License #:</p>
                    <p className="font-mono text-sm">{item.license_number}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/dashboard/compliance-items/${item.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/dashboard/compliance-items/${item.id}/renew`}>
                    <Button size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Renewed
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}


