'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload } from 'lucide-react'
import { ComplianceItem } from '@/lib/types/database'

interface RenewComplianceItemFormProps {
  item: ComplianceItem & { employees?: { name: string } | null }
}

export function RenewComplianceItemForm({ item }: RenewComplianceItemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)

  const [formData, setFormData] = useState({
    newExpirationDate: '',
    licenseNumber: item.license_number || '',
    notes: '',
  })

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
        // Pre-fill form with extracted data
        setFormData({
          ...formData,
          newExpirationDate: data.data.expirationDate || formData.newExpirationDate,
          licenseNumber: data.data.licenseNumber || formData.licenseNumber,
        })
      } else {
        throw new Error(data.error || 'Failed to extract data')
      }
    } catch (error: any) {
      console.error(error)
      alert('Failed to extract data from image. Please try again or enter manually.')
    } finally {
      setExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/compliance-items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiration_date: formData.newExpirationDate,
          license_number: formData.licenseNumber,
          status: 'active',
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update compliance item')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      alert('Failed to renew compliance item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Renew {item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Current Information:</p>
          <p><strong>Expiration Date:</strong> {new Date(item.expiration_date).toLocaleDateString()}</p>
          {item.license_number && (
            <p><strong>License Number:</strong> {item.license_number}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="renewal-document-upload" className="cursor-pointer">
              <span className="text-primary hover:underline">
                Upload renewed license/document (AI will extract new expiration date)
              </span>
              <input
                id="renewal-document-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={extracting}
              />
            </Label>
            <p className="text-sm text-muted-foreground mt-2">
              {extracting ? 'Extracting data...' : 'Optional: Upload to auto-fill form'}
            </p>
          </div>

          {extractedData && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-semibold mb-2">AI Extracted Information</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Please verify the extracted data is correct:
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>License Number:</strong> {extractedData.licenseNumber || 'Not found'}</p>
                <p><strong>New Expiration Date:</strong> {extractedData.expirationDate || 'Not found'}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newExpirationDate">New Expiration Date *</Label>
            <Input
              id="newExpirationDate"
              type="date"
              value={formData.newExpirationDate}
              onChange={(e) => setFormData({ ...formData, newExpirationDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marking as Renewed...
                </>
              ) : (
                'Mark as Renewed'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


