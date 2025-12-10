import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { env } from '@/lib/env'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token =
    request.nextUrl.searchParams.get('token') ||
    request.headers.get('x-portal-token') ||
    ''

  if (!token) {
    return NextResponse.json({ error: 'Portal token required' }, { status: 400 })
  }

  const supabaseAdmin = createSupabaseAdmin(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Fetch the employee and validate the portal token
  const { data: employee, error: employeeError } = await supabaseAdmin
    .from('employees')
    .select('id, name, email, phone, portal_access_token, portal_enabled, business_id')
    .eq('id', params.id)
    .single()

  if (employeeError) {
    return NextResponse.json({ error: employeeError.message }, { status: 500 })
  }

  if (!employee || !employee.portal_enabled || employee.portal_access_token !== token) {
    return NextResponse.json({ error: 'Invalid or disabled portal access' }, { status: 401 })
  }

  // Fetch compliance items tied to this employee
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('compliance_items')
    .select('id, name, item_type, status, expiration_date, license_number, document_url, issuing_authority, renewal_frequency')
    .eq('employee_id', employee.id)
    .order('expiration_date', { ascending: true })

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  return NextResponse.json({
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
    },
    items: items || [],
  })
}
