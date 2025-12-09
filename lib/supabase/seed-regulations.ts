import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// California regulations
const californiaRegulations = [
  {
    state: 'CA',
    license_type: 'Cosmetology License',
    renewal_frequency: '2 years',
    renewal_window: '90 days before expiration',
    renewal_process_url: 'https://www.barbercosmo.ca.gov/licensees/renewal/',
    continuing_education_required: true,
    continuing_education_hours: 8,
    fees: '$50',
    grace_period: 'None - late renewal requires retest',
    notes: 'COVID extensions expired Dec 2023',
  },
  {
    state: 'CA',
    license_type: 'Barber License',
    renewal_frequency: '2 years',
    renewal_window: '90 days before expiration',
    renewal_process_url: 'https://www.barbercosmo.ca.gov/licensees/renewal/',
    continuing_education_required: true,
    continuing_education_hours: 8,
    fees: '$50',
    grace_period: 'None - late renewal requires retest',
    notes: '',
  },
  {
    state: 'CA',
    license_type: 'Esthetician License',
    renewal_frequency: '2 years',
    renewal_window: '90 days before expiration',
    renewal_process_url: 'https://www.barbercosmo.ca.gov/licensees/renewal/',
    continuing_education_required: true,
    continuing_education_hours: 8,
    fees: '$50',
    grace_period: 'None - late renewal requires retest',
    notes: '',
  },
  {
    state: 'CA',
    license_type: 'Nail Technician License',
    renewal_frequency: '2 years',
    renewal_window: '90 days before expiration',
    renewal_process_url: 'https://www.barbercosmo.ca.gov/licensees/renewal/',
    continuing_education_required: true,
    continuing_education_hours: 8,
    fees: '$50',
    grace_period: 'None - late renewal requires retest',
    notes: '',
  },
  {
    state: 'CA',
    license_type: 'Massage Therapy License',
    renewal_frequency: '2 years',
    renewal_window: '90 days before expiration',
    renewal_process_url: 'https://www.camtc.org/renewal/',
    continuing_education_required: true,
    continuing_education_hours: 24,
    fees: '$120',
    grace_period: '30 days',
    notes: '',
  },
]

// Texas regulations
const texasRegulations = [
  {
    state: 'TX',
    license_type: 'Cosmetology License',
    renewal_frequency: '2 years',
    renewal_window: '30 days before expiration',
    renewal_process_url: 'https://www.tdlr.texas.gov/cosmet/cosmet.htm',
    continuing_education_required: true,
    continuing_education_hours: 4,
    fees: '$37',
    grace_period: '30 days',
    notes: '',
  },
  {
    state: 'TX',
    license_type: 'Barber License',
    renewal_frequency: '2 years',
    renewal_window: '30 days before expiration',
    renewal_process_url: 'https://www.tdlr.texas.gov/barbers/barbers.htm',
    continuing_education_required: true,
    continuing_education_hours: 4,
    fees: '$37',
    grace_period: '30 days',
    notes: '',
  },
  {
    state: 'TX',
    license_type: 'Esthetician License',
    renewal_frequency: '2 years',
    renewal_window: '30 days before expiration',
    renewal_process_url: 'https://www.tdlr.texas.gov/cosmet/cosmet.htm',
    continuing_education_required: true,
    continuing_education_hours: 4,
    fees: '$37',
    grace_period: '30 days',
    notes: '',
  },
  {
    state: 'TX',
    license_type: 'Nail Technician License',
    renewal_frequency: '2 years',
    renewal_window: '30 days before expiration',
    renewal_process_url: 'https://www.tdlr.texas.gov/cosmet/cosmet.htm',
    continuing_education_required: true,
    continuing_education_hours: 4,
    fees: '$37',
    grace_period: '30 days',
    notes: '',
  },
  {
    state: 'TX',
    license_type: 'Massage Therapy License',
    renewal_frequency: '2 years',
    renewal_window: '30 days before expiration',
    renewal_process_url: 'https://www.tdlr.texas.gov/massage/massage.htm',
    continuing_education_required: true,
    continuing_education_hours: 12,
    fees: '$77',
    grace_period: '30 days',
    notes: '',
  },
]

export async function seedRegulations() {
  const allRegulations = [...californiaRegulations, ...texasRegulations]

  const { data, error } = await supabase
    .from('regulations')
    .upsert(allRegulations, {
      onConflict: 'state,license_type',
      ignoreDuplicates: false,
    })

  if (error) {
    console.error('Error seeding regulations:', error)
    throw error
  }

  console.log(`Seeded ${allRegulations.length} regulations`)
  return data
}

// Run this script to seed the database
if (require.main === module) {
  seedRegulations()
    .then(() => {
      console.log('Regulations seeded successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Failed to seed regulations:', error)
      process.exit(1)
    })
}


