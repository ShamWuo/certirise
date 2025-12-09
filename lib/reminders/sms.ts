import twilio from 'twilio'

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  
  if (!accountSid || !authToken) {
    return null
  }
  
  // Validate accountSid format before creating client
  if (!accountSid.startsWith('AC')) {
    return null
  }
  
  return twilio(accountSid, authToken)
}

const phoneNumber = process.env.TWILIO_PHONE_NUMBER

interface ReminderSMSData {
  to: string
  itemName: string
  expirationDate: string
  daysRemaining: number
  renewalUrl: string
}

export async function sendReminderSMS(data: ReminderSMSData) {
  const client = getTwilioClient()
  
  if (!client) {
    console.warn('Twilio not configured. SMS not sent.')
    return { success: false, error: 'SMS not configured' }
  }

  try {
    const { to, itemName, expirationDate, daysRemaining, renewalUrl } = data

    const date = new Date(expirationDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    let message = ''
    if (daysRemaining === 0) {
      message = `🚨 URGENT: ${itemName} expires TODAY (${date}). Renew now: ${renewalUrl}`
    } else if (daysRemaining < 0) {
      message = `🚨 OVERDUE: ${itemName} expired ${Math.abs(daysRemaining)} days ago. Renew: ${renewalUrl}`
    } else if (daysRemaining <= 7) {
      message = `⚠️ ${itemName} expires in ${daysRemaining} days (${date}). Renew: ${renewalUrl}`
    } else {
      message = `Reminder: ${itemName} expires in ${daysRemaining} days (${date}). Renew: ${renewalUrl}`
    }

    const result = await client.messages.create({
      body: message,
      from: phoneNumber || '',
      to: to,
    })

    return { success: true, sid: result.sid }
  } catch (error: any) {
    console.error('SMS sending error:', error)
    return { success: false, error: error.message }
  }
}


