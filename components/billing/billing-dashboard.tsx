'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, CreditCard } from 'lucide-react'
import { Business } from '@/lib/types/database'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/hooks/use-toast'

interface BillingDashboardProps {
  business: Business
  plans: any
  success?: boolean
  canceled?: boolean
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function BillingDashboard({
  business,
  plans,
  success,
  canceled,
}: BillingDashboardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (planType: 'starter' | 'pro') => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })

      const { sessionId, url } = await response.json()

      if (url) {
        window.location.href = url
      } else if (sessionId) {
        const stripe = await stripePromise
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId })
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentPlan = business.subscription_status === 'active' ? 'starter' : null

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-success">
          <p className="font-semibold">Payment successful!</p>
          <p className="text-sm">Your subscription is now active.</p>
        </div>
      )}

      {canceled && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-warning">
          <p className="font-semibold">Payment canceled</p>
          <p className="text-sm">Your subscription was not updated.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{plans[currentPlan].name} Plan</p>
                <p className="text-muted-foreground">
                  ${plans[currentPlan].price}/month per location
                </p>
                <Badge className="mt-2" variant="default">
                  Active
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold capitalize">{business.subscription_status}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold mb-2">No active subscription</p>
              <p className="text-muted-foreground">
                Subscribe to a plan to unlock all features
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(plans).map(([key, plan]: [string, any]) => (
          <Card
            key={key}
            className={currentPlan === key ? 'border-primary' : ''}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription>per location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={currentPlan === key ? 'outline' : 'default'}
                onClick={() => handleSubscribe(key as 'starter' | 'pro')}
                disabled={loading || currentPlan === key}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentPlan === key ? (
                  'Current Plan'
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

