import { ComplianceItem } from '@/lib/types/database'
import { daysUntil } from '@/lib/utils'

export interface ComplianceScoreBreakdown {
  total: number
  score: number
  percentage: number
  breakdown: {
    active: number
    upcoming: number
    overdue: number
    renewed: number
  }
}

export function calculateComplianceScore(items: ComplianceItem[]): ComplianceScoreBreakdown {
  if (items.length === 0) {
    return {
      total: 0,
      score: 100,
      percentage: 100,
      breakdown: {
        active: 0,
        upcoming: 0,
        overdue: 0,
        renewed: 0,
      },
    }
  }

  const now = new Date()
  const activeItems = items.filter(item => item.status === 'active')
  
  let score = 0
  const breakdown = {
    active: 0,
    upcoming: 0,
    overdue: 0,
    renewed: 0,
  }

  activeItems.forEach(item => {
    const expiration = new Date(item.expiration_date)
    const days = daysUntil(expiration)

    if (days < 0) {
      // Overdue: -10 points per item
      score -= 10
      breakdown.overdue++
    } else if (days <= 30) {
      // Expiring soon: 5 points
      score += 5
      breakdown.upcoming++
    } else if (days <= 90) {
      // Good: 10 points
      score += 10
      breakdown.active++
    } else {
      // Perfect: 15 points
      score += 15
      breakdown.active++
    }
  })

  // Add bonus for recently renewed items
  const recentlyRenewed = items.filter(item => {
    if (!item.last_renewal_date) return false
    const renewalDate = new Date(item.last_renewal_date)
    const daysSinceRenewal = Math.floor(
      (now.getTime() - renewalDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceRenewal <= 90
  })
  breakdown.renewed = recentlyRenewed.length
  score += recentlyRenewed.length * 5

  // Calculate percentage (max score is items.length * 15)
  const maxScore = items.length * 15
  const percentage = Math.max(0, Math.min(100, (score / maxScore) * 100))

  // Normalize score to 0-100
  const normalizedScore = Math.max(0, Math.min(100, score + 50))

  return {
    total: items.length,
    score: normalizedScore,
    percentage: Math.round(percentage),
    breakdown,
  }
}

export function getComplianceBadge(percentage: number): { label: string; color: string } {
  if (percentage >= 95) {
    return { label: 'Perfect Compliance', color: 'success' }
  } else if (percentage >= 85) {
    return { label: 'Excellent', color: 'primary' }
  } else if (percentage >= 75) {
    return { label: 'Good', color: 'success' }
  } else if (percentage >= 60) {
    return { label: 'Fair', color: 'warning' }
  } else {
    return { label: 'Needs Attention', color: 'danger' }
  }
}

