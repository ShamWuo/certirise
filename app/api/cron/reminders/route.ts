import { NextRequest, NextResponse } from 'next/server'
import { checkAndSendReminders } from '@/lib/reminders/scheduler'

export async function GET(request: NextRequest) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await checkAndSendReminders()
    return NextResponse.json({ success: true, message: 'Reminders processed' })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}


