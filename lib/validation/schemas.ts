import { z } from 'zod'

// File upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size must be less than 10MB',
    })
    .refine(
      (file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
        return validTypes.includes(file.type)
      },
      {
        message: 'File must be an image (JPEG, PNG) or PDF',
      }
    ),
})

// Business validation
export const businessSchema = z.object({
  businessName: z.string().min(1).max(255),
  businessType: z.enum(['salon', 'barbershop', 'spa', 'tattoo_shop']).optional(),
  state: z.string().max(2).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
})

// Compliance item validation
export const complianceItemSchema = z.object({
  item_type: z.enum(['license', 'inspection', 'insurance', 'equipment']),
  name: z.string().min(1).max(255),
  license_number: z.string().max(100).optional().nullable(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  renewal_frequency: z.string().max(50).optional().nullable(),
  issuing_authority: z.string().max(255).optional().nullable(),
  employee_id: z.string().uuid().optional().nullable(),
  location_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

// Location validation
export const locationSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zip_code: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
})

// Employee validation
export const employeeSchema = z.object({
  name: z.string().min(1).max(255),
  role: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  portal_enabled: z.boolean().optional(),
})

// Stripe checkout validation
export const stripeCheckoutSchema = z.object({
  priceId: z.string().optional(),
  planType: z.enum(['starter', 'pro']).optional(),
})






