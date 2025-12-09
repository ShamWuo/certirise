import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ReminderEmailData {
  to: string
  businessName: string
  itemName: string
  expirationDate: string
  daysRemaining: number
  licenseNumber?: string | null
  renewalUrl: string
}

export async function sendReminderEmail(data: ReminderEmailData) {
  try {
    const { to, businessName, itemName, expirationDate, daysRemaining, licenseNumber, renewalUrl } = data

    const subject = daysRemaining === 0
      ? `🚨 URGENT: ${itemName} expires TODAY`
      : daysRemaining < 0
      ? `🚨 OVERDUE: ${itemName} expired ${Math.abs(daysRemaining)} days ago`
      : `${itemName} expires in ${daysRemaining} days`

    const urgency = daysRemaining <= 7 ? 'critical' : daysRemaining <= 30 ? 'urgent' : 'standard'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00D9A3 0%, #0F172A 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Certirise</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: ${urgency === 'critical' ? '#EF4444' : urgency === 'urgent' ? '#EAB308' : '#00D9A3'}; margin-top: 0;">
              ${subject}
            </h2>
            
            <p>Hi ${businessName},</p>
            
            <p>Your <strong>${itemName}</strong> is expiring soon:</p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${urgency === 'critical' ? '#EF4444' : urgency === 'urgent' ? '#EAB308' : '#00D9A3'};">
              <p style="margin: 0;"><strong>Expires:</strong> ${new Date(expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 10px 0 0 0;"><strong>Days remaining:</strong> ${daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : daysRemaining === 0 ? 'Today' : `${daysRemaining} days`}</p>
              ${licenseNumber ? `<p style="margin: 10px 0 0 0;"><strong>License #:</strong> ${licenseNumber}</p>` : ''}
            </div>
            
            <p><strong>What to do:</strong></p>
            <ol>
              <li>Contact your provider or licensing board</li>
              <li>Renew your ${itemName.toLowerCase()}</li>
              <li>Mark as renewed in Certirise</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${renewalUrl}" style="background: #00D9A3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Mark as Renewed
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Need help? Reply to this email or visit your dashboard.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Certirise. Never miss a renewal deadline.
            </p>
          </div>
        </body>
      </html>
    `

    const { data: emailData, error } = await resend.emails.send({
      from: 'Certirise <notifications@certirise.com>',
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Email sending error:', error)
      throw error
    }

    return { success: true, id: emailData?.id }
  } catch (error) {
    console.error('Failed to send reminder email:', error)
    throw error
  }
}


