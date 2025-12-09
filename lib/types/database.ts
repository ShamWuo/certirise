export type BusinessType = 'salon' | 'barbershop' | 'spa' | 'tattoo_shop'
export type ComplianceItemType = 'license' | 'inspection' | 'insurance' | 'equipment'
export type ReminderType = 'email' | 'sms'

export interface Business {
  id: string
  user_id: string
  name: string
  type: BusinessType | null
  state: string | null
  city: string | null
  phone: string | null
  email: string | null
  stripe_customer_id: string | null
  subscription_status: string
  compliance_score: number | null
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  business_id: string
  name: string
  role: string | null
  email: string | null
  phone: string | null
  portal_access_token: string | null
  portal_enabled: boolean
  created_at: string
  updated_at: string
}

export interface ComplianceItem {
  id: string
  business_id: string
  location_id: string | null
  employee_id: string | null
  item_type: ComplianceItemType
  name: string
  license_number: string | null
  expiration_date: string
  renewal_frequency: string | null
  issuing_authority: string | null
  status: string
  document_url: string | null
  notes: string | null
  last_renewal_date: string | null
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  compliance_item_id: string
  sent_at: string
  type: ReminderType
  days_before_expiration: number | null
  opened: boolean
  clicked: boolean
  created_at: string
}

export interface Location {
  id: string
  business_id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Regulation {
  id: string
  state: string
  license_type: string
  renewal_frequency: string | null
  renewal_window: string | null
  renewal_process_url: string | null
  continuing_education_required: boolean
  continuing_education_hours: number | null
  fees: string | null
  grace_period: string | null
  notes: string | null
  last_updated: string
}


