import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_ID_STARTER || 'price_starter',
  pro: process.env.STRIPE_PRICE_ID_PRO || 'price_pro',
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 30,
    priceId: PRICE_IDS.starter,
    features: [
      'Unlimited compliance items',
      'Unlimited employees',
      'Email + SMS reminders',
      'Document storage',
      'Basic support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 50,
    priceId: PRICE_IDS.pro,
    features: [
      'Everything in Starter',
      'Multi-location dashboard',
      'AI regulation monitoring',
      'Priority support',
      'Advanced analytics',
    ],
  },
}

