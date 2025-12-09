'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { daysUntil, formatDate, getStatusEmoji } from '@/lib/utils'
import { ComplianceItem } from '@/lib/types/database'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft, Calendar, FileText, Building2 } from 'lucide-react'

interface ComplianceItemDetailsProps {
  item: ComplianceItem & { employees?: { name: string } | null }
}

export function ComplianceItemDetails({ item }: ComplianceItemDetailsProps) {
  const days = daysUntil(item.expiration_date)
  const emoji = getStatusEmoji(days)
  const expirationDate = formatDate(item.expiration_date)

  return (
    <div className="space-y-6">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-3xl">
              <span>{emoji}</span>
              <span>{item.name}</span>
            </CardTitle>
            <Link href={`/dashboard/compliance-items/${item.id}/renew`}>
              <Button>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Renewed
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Expiration Date
                </div>
                <p className="text-xl font-semibold">{expirationDate}</p>
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <FileText className="h-4 w-4" />
                    License Number
                  </div>
                  <p className="font-mono text-lg">{item.license_number}</p>
                </div>
              )}

              {item.issuing_authority && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Building2 className="h-4 w-4" />
                    Issuing Authority
                  </div>
                  <p>{item.issuing_authority}</p>
                </div>
              )}

              {item.employees?.name && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Employee
                  </div>
                  <p>{item.employees.name}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Item Type
                </div>
                <p className="capitalize">{item.item_type}</p>
              </div>

              {item.renewal_frequency && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Renewal Frequency
                  </div>
                  <p>{item.renewal_frequency}</p>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Status
                </div>
                <p className="capitalize">{item.status}</p>
              </div>

              {item.notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Notes
                  </div>
                  <p>{item.notes}</p>
                </div>
              )}
            </div>
          </div>

          {item.document_url && (
            <div className="border-t pt-6">
              <div className="text-sm text-muted-foreground mb-2">
                Document
              </div>
              <a
                href={item.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Document
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


