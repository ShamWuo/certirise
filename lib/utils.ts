import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getStatusColor(daysUntilExpiration: number): string {
  if (daysUntilExpiration < 0) return 'danger' // overdue
  if (daysUntilExpiration < 30) return 'danger' // critical
  if (daysUntilExpiration < 60) return 'warning' // warning
  if (daysUntilExpiration < 90) return 'success' // good
  return 'muted' // far away
}

export function getStatusEmoji(daysUntilExpiration: number): string {
  if (daysUntilExpiration < 0) return '🔴' // overdue
  if (daysUntilExpiration < 30) return '🔴' // critical
  if (daysUntilExpiration < 60) return '🟡' // warning
  if (daysUntilExpiration < 90) return '🟢' // good
  return '⚪' // far away
}


