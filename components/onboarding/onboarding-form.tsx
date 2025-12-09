'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Loader2 } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

interface OnboardingFormProps {
  userId: string
}

type BusinessType = 'salon' | 'barbershop' | 'spa' | 'tattoo_shop'

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '' as BusinessType | '',
    state: '',
    city: '',
    phone: '',
    email: '',
    numLocations: '1',
    numEmployees: '1',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create business')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      alert('Failed to create business. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setExtracting(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/ai/extract', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setExtractedData(data.data)
        toast({
          title: 'Data Extracted',
          description: 'License information extracted successfully. Please review and confirm.',
          variant: 'success',
        })
      } else {
        throw new Error(data.error || 'Failed to extract data')
      }
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Extraction Failed',
        description: 'Failed to extract data from image. Please try again or enter manually.',
        variant: 'destructive',
      })
    } finally {
      setExtracting(false)
    }
  }

  if (step === 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Business Profile</CardTitle>
          <CardDescription>
            Tell us about your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => setFormData({ ...formData, businessType: value as BusinessType })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salon">Salon</SelectItem>
                  <SelectItem value="barbershop">Barbershop</SelectItem>
                  <SelectItem value="spa">Spa</SelectItem>
                  <SelectItem value="tattoo_shop">Tattoo Shop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full">
              Continue
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
          <CardTitle>Step 2: Upload Licenses (AI-Powered)</CardTitle>
          <CardDescription>
            Upload photos of your licenses and we'll extract the expiration dates automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Label htmlFor="license-upload" className="cursor-pointer">
                <span className="text-primary hover:underline">
                  Click to upload license photo
                </span>
                <input
                  id="license-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={extracting}
                />
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                {extracting ? 'Extracting data...' : 'PNG, JPG, or PDF up to 10MB'}
              </p>
            </div>

            {extractedData && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">Extracted Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>License Type:</strong> {extractedData.licenseType || 'Not found'}</p>
                  <p><strong>License Number:</strong> {extractedData.licenseNumber || 'Not found'}</p>
                  <p><strong>Expiration Date:</strong> {extractedData.expirationDate || 'Not found'}</p>
                  <p><strong>Issuing Authority:</strong> {extractedData.issuingAuthority || 'Not found'}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Please verify these details are correct before proceeding
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || extracting}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Skip & Continue'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}


