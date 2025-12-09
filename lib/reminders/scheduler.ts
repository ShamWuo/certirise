import { createClient } from '@supabase/supabase-js'
import { sendReminderEmail } from './email'
import { sendReminderSMS } from './sms'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ReminderSchedule {
  daysBefore: number[]
  emailDays: number[]
  smsDays: number[]
}

const REMINDER_SCHEDULE: ReminderSchedule = {
  daysBefore: [90, 60, 30, 14, 7, 0],
  emailDays: [90, 60, 30, 14, 7, 0],
  smsDays: [60, 30, 14, 7, 0], // SMS only for closer deadlines
}

export async function checkAndSendReminders() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active compliance items
    const { data: items, error: itemsError } = await supabase
      .from('compliance_items')
      .select(`
        *,
        businesses!inner (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('status', 'active')

    if (itemsError) {
      console.error('Error fetching compliance items:', itemsError)
      return
    }

    if (!items) return

    for (const item of items) {
      const expirationDate = new Date(item.expiration_date)
      expirationDate.setHours(0, 0, 0, 0)
      
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Check if we should send a reminder for this day
      if (!REMINDER_SCHEDULE.daysBefore.includes(daysUntilExpiration)) {
        continue
      }

      // Check if we've already sent a reminder for this day
      const { data: existingReminder } = await supabase
        .from('reminders')
        .select('id')
        .eq('compliance_item_id', item.id)
        .eq('days_before_expiration', daysUntilExpiration)
        .gte('sent_at', today.toISOString())
        .maybeSingle()

      if (existingReminder) {
        continue // Already sent today
      }

      const business = (item as any).businesses

      // Send email reminder
      if (REMINDER_SCHEDULE.emailDays.includes(daysUntilExpiration) && business.email) {
        try {
          await sendReminderEmail({
            to: business.email,
            businessName: business.name,
            itemName: item.name,
            expirationDate: item.expiration_date,
            daysRemaining: daysUntilExpiration,
            licenseNumber: item.license_number,
            renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/compliance-items/${item.id}/renew`,
          })

          // Log reminder
          await supabase.from('reminders').insert({
            compliance_item_id: item.id,
            type: 'email',
            days_before_expiration: daysUntilExpiration,
          })
        } catch (error) {
          console.error(`Failed to send email for item ${item.id}:`, error)
        }
      }

      // Send SMS reminder
      if (REMINDER_SCHEDULE.smsDays.includes(daysUntilExpiration) && business.phone) {
        try {
          await sendReminderSMS({
            to: business.phone,
            itemName: item.name,
            expirationDate: item.expiration_date,
            daysRemaining: daysUntilExpiration,
            renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/compliance-items/${item.id}/renew`,
          })

          // Log reminder
          await supabase.from('reminders').insert({
            compliance_item_id: item.id,
            type: 'sms',
            days_before_expiration: daysUntilExpiration,
          })
        } catch (error) {
          console.error(`Failed to send SMS for item ${item.id}:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Error in reminder scheduler:', error)
    throw error
  }
}

