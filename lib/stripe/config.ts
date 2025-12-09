import Stripe from 'stripe'

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
    typescript: true,
  })
}

// Lazy initialization - only create when accessed
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const stripeInstance = getStripe()
    const value = (stripeInstance as any)[prop]
    if (typeof value === 'function') {
      return value.bind(stripeInstance)
    }
    return value
  },
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

