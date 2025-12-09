import { seedRegulations } from '../lib/supabase/seed-regulations'

seedRegulations()
  .then(() => {
    console.log('Regulations seeded successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to seed regulations:', error)
    process.exit(1)
  })


