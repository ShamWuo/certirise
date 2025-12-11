'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

interface OnboardingFormProps {
  userId: string
}

type BusinessType = 'salon' | 'barbershop' | 'spa' | 'tattoo_shop'
type FocusArea = 'licenses' | 'safety' | 'insurance' | 'equipment'
type ReminderChannel = 'email' | 'sms'
type ReminderCadence = 'weekly' | 'biweekly' | 'monthly'

const BUSINESS_TYPES: { label: string; value: BusinessType }[] = [
  { label: 'Salon', value: 'salon' },
  { label: 'Barbershop', value: 'barbershop' },
  { label: 'Spa', value: 'spa' },
  { label: 'Tattoo Shop', value: 'tattoo_shop' },
]

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

const FOCUS_AREA_OPTIONS: Record<FocusArea, { label: string; description: string }> = {
  licenses: {
    label: 'State & Professional Licenses',
    description: 'Track renewal windows and CEU requirements.',
  },
  safety: {
    label: 'Health & Safety Inspections',
    description: 'Stay ahead of OSHA and local inspections.',
  },
  insurance: {
    label: 'Insurance Policies',
    description: 'Never miss general liability or worker comp renewals.',
  },
  equipment: {
    label: 'Equipment & Calibration',
    description: 'Schedule sterilizer and device maintenance.',
  },
}

const REMINDER_CHANNELS: Record<ReminderChannel, { label: string; description: string }> = {
  email: {
    label: 'Email reminders',
    description: 'Unlimited email alerts for you and your team.',
  },
  sms: {
    label: 'SMS reminders',
    description: 'Text alerts for urgent renewals (requires SMS add-on).',
  },
}

const REMINDER_CADENCE_OPTIONS: { id: ReminderCadence; label: string; description: string }[] = [
  { id: 'weekly', label: 'Weekly digest', description: 'Best for larger teams' },
  { id: 'biweekly', label: 'Every two weeks', description: 'Balanced overview' },
  { id: 'monthly', label: 'Monthly summary', description: 'For smaller operations' },
]

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '' as BusinessType | '',
    state: '',
    city: '',
    phone: '',
    email: '',
    numLocations: '1',
    numEmployees: '1',
    goals: '',
  })

  const [preferences, setPreferences] = useState({
    focusAreas: ['licenses'] as FocusArea[],
    reminderChannels: ['email'] as ReminderChannel[],
    reminderCadence: 'weekly' as ReminderCadence,
  })

  const selectedFocusAreaDescriptions = useMemo(() => {
    return preferences.focusAreas.map((area) => FOCUS_AREA_OPTIONS[area].label).join(', ')
  }, [preferences.focusAreas])

  const validateStepOne = () => {
    const missingFields: string[] = []

    if (!formData.businessName.trim()) missingFields.push('Business name')
    if (!formData.businessType) missingFields.push('Business type')
    if (!formData.state) missingFields.push('State')
    if (!formData.city.trim()) missingFields.push('City')
    if (!formData.email.trim()) missingFields.push('Email')

    if (missingFields.length > 0) {
      toast({
        title: 'Missing information',
        description: `Please complete: ${missingFields.join(', ')}`,
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const toggleFocusArea = (area: FocusArea) => {
    setPreferences((prev) => {
      const isSelected = prev.focusAreas.includes(area)
      const nextSelection = isSelected
        ? prev.focusAreas.filter((item) => item !== area)
        : [...prev.focusAreas, area]

      // keep at least one focus area selected
      return {
        ...prev,
        focusAreas: nextSelection.length > 0 ? nextSelection : prev.focusAreas,
      }
    })
  }

  const toggleReminderChannel = (channel: ReminderChannel) => {
    setPreferences((prev) => {
      const isSelected = prev.reminderChannels.includes(channel)
      const nextSelection = isSelected
        ? prev.reminderChannels.filter((item) => item !== channel)
        : [...prev.reminderChannels, channel]

      return {
        ...prev,
        reminderChannels: nextSelection.length > 0 ? nextSelection : prev.reminderChannels,
      }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName.trim(),
          businessType: formData.businessType,
          state: formData.state,
          city: formData.city.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim(),
          settings: {
            numLocations: formData.numLocations,
            numEmployees: formData.numEmployees,
            goals: formData.goals.trim(),
            focusAreas: preferences.focusAreas,
            reminderChannels: preferences.reminderChannels,
            reminderCadence: preferences.reminderCadence,
          },
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create business')
      }

      toast({
        title: 'Business created',
        description: 'Great! Next stop: configure billing to unlock AI extraction.',
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Unable to create business',
        description: error.message || 'Please try again or contact support.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Step 1 · Business Profile</CardTitle>
          <CardDescription>Tell us a little about your operation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (validateStepOne()) {
                setStep(2)
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Glow Studio"
              />
            </div>

            <div className="space-y-2">
              <Label>Business Type *</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => setFormData({ ...formData, businessType: value as BusinessType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>State *</Label>
                <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Austin"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@domain.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Locations</Label>
                <Select
                  value={formData.numLocations}
                  onValueChange={(value) => setFormData({ ...formData, numLocations: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 location</SelectItem>
                    <SelectItem value="2-5">2-5 locations</SelectItem>
                    <SelectItem value="6-10">6-10 locations</SelectItem>
                    <SelectItem value="10+">10+ locations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team Size</Label>
                <Select
                  value={formData.numEmployees}
                  onValueChange={(value) => setFormData({ ...formData, numEmployees: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 team members</SelectItem>
                    <SelectItem value="6-20">6-20 team members</SelectItem>
                    <SelectItem value="21-50">21-50 team members</SelectItem>
                    <SelectItem value="50+">50+ team members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">What should we prioritize for you?</Label>
              <textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="e.g., 'Need help keeping multiple state licenses organized.'"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              Continue to preferences
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (step === 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Step 2 · Compliance Preferences</CardTitle>
          <CardDescription>Choose what matters most so we can personalize alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Focus areas (pick at least one)</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {(Object.keys(FOCUS_AREA_OPTIONS) as FocusArea[]).map((area) => {
                const selected = preferences.focusAreas.includes(area)
                const option = FOCUS_AREA_OPTIONS[area]
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocusArea(area)}
                    className={`rounded-lg border px-4 py-3 text-left transition ${
                      selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Reminder channels</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {(Object.keys(REMINDER_CHANNELS) as ReminderChannel[]).map((channel) => {
                const selected = preferences.reminderChannels.includes(channel)
                const option = REMINDER_CHANNELS[channel]
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleReminderChannel(channel)}
                    className={`rounded-lg border px-4 py-3 text-left transition ${
                      selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label>How often should we nudge you?</Label>
            <div className="grid gap-3 md:grid-cols-3">
              {REMINDER_CADENCE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPreferences((prev) => ({ ...prev, reminderCadence: option.id }))}
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    preferences.reminderCadence === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="sm:flex-1">
              Back
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep(3)} className="sm:flex-1">
              Skip for now
            </Button>
            <Button type="button" onClick={() => setStep(3)} className="sm:flex-1">
              Review & finish
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3 · Review</CardTitle>
        <CardDescription>
          Confirm your details. AI-powered document extraction unlocks after you activate billing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Business</p>
          <div className="space-y-1 text-sm">
            <p>{formData.businessName}</p>
            <p className="text-muted-foreground">
              {BUSINESS_TYPES.find((type) => type.value === formData.businessType)?.label} · {formData.city},{' '}
              {formData.state}
            </p>
            <p className="text-muted-foreground">{formData.email}</p>
            {formData.phone && <p className="text-muted-foreground">{formData.phone}</p>}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Your preferences</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Focus:</span> {selectedFocusAreaDescriptions}
            </p>
            <p>
              <span className="font-medium">Reminder channels:</span>{' '}
              {preferences.reminderChannels.map((channel) => REMINDER_CHANNELS[channel].label).join(', ')}
            </p>
            <p>
              <span className="font-medium">Cadence:</span>{' '}
              {REMINDER_CADENCE_OPTIONS.find((option) => option.id === preferences.reminderCadence)?.label}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm">
          <p className="font-medium mb-1">AI extraction unlocks after checkout</p>
          <p className="text-muted-foreground">
            Uploading licenses and automatically extracting expiration dates is reserved for paid plans. Finish setup,
            then head to billing to start your trial when you&apos;re ready.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => setStep(2)} className="sm:flex-1">
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="sm:flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Complete setup'
            )}
          </Button>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="font-medium mb-1">Want to jump straight into billing?</p>
          <p className="text-muted-foreground mb-3">
            You can always upgrade later, but activating billing now lets you invite teammates and unlock AI document
            extraction immediately.
          </p>
          <Button asChild variant="secondary">
            <Link href="/dashboard/billing">Go to Billing</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

