'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateComplianceScore, getComplianceBadge } from '@/lib/compliance/score'
import { ComplianceItem } from '@/lib/types/database'
import { Trophy, TrendingUp, AlertTriangle } from 'lucide-react'

interface ComplianceScoreProps {
  items: ComplianceItem[]
}

export function ComplianceScore({ items }: ComplianceScoreProps) {
  const scoreData = calculateComplianceScore(items)
  const badge = getComplianceBadge(scoreData.percentage)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Compliance Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2" style={{ color: `var(--color-${badge.color})` }}>
              {scoreData.percentage}%
            </div>
            <Badge variant="default" className="text-sm">
              {badge.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Items</p>
              <p className="text-2xl font-bold">{scoreData.total}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active</p>
              <p className="text-2xl font-bold text-success">
                {scoreData.breakdown.active + scoreData.breakdown.upcoming}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Recently Renewed</p>
              <p className="text-2xl font-bold text-primary">{scoreData.breakdown.renewed}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overdue</p>
              <p className="text-2xl font-bold text-danger">{scoreData.breakdown.overdue}</p>
            </div>
          </div>

          {scoreData.breakdown.overdue > 0 && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-danger">Action Required</p>
                <p className="text-sm text-muted-foreground">
                  You have {scoreData.breakdown.overdue} overdue compliance item{scoreData.breakdown.overdue > 1 ? 's' : ''}. 
                  Renew them to improve your score.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

