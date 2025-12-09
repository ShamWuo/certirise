'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Loader2 } from 'lucide-react'
import { Employee } from '@/lib/types/database'

interface AddComplianceItemFormProps {
  businessId: string
  employees: Pick<Employee, 'id' | 'name'>[]
}

export function AddComplianceItemForm({ businessId, employees }: AddComplianceItemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)

  const [formData, setFormData] = useState({
    itemType: '',
    name: '',
    licenseNumber: '',
    expirationDate: '',
    renewalFrequency: '',
    issuingAuthority: '',
    employeeId: '',
    notes: '',
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setExtracting(true)
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    try {
      const response = await fetch('/api/ai/extract', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()
      if (data.success) {
        setExtractedData(data.data)
        // Pre-fill form with extracted data
        setFormData((prev) => ({
          ...prev,
          name: data.data.licenseType || prev.name,
          licenseNumber: data.data.licenseNumber || prev.licenseNumber,
          expirationDate: data.data.expirationDate || prev.expirationDate,
          issuingAuthority: data.data.issuingAuthority || prev.issuingAuthority,
        }))
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
      const response = await fetch('/api/compliance-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          business_id: businessId,
          employee_id: formData.employeeId || null,
          status: 'active',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create compliance item')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      alert('Failed to create compliance item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="document-upload" className="cursor-pointer">
              <span className="text-primary hover:underline">
                Upload license/document (AI will extract data)
              </span>
              <input
                id="document-upload"
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
                <p><strong>License Type:</strong> {extractedData.licenseType || 'Not found'}</p>
                <p><strong>License Number:</strong> {extractedData.licenseNumber || 'Not found'}</p>
                <p><strong>Expiration Date:</strong> {extractedData.expirationDate || 'Not found'}</p>
                <p><strong>Issuing Authority:</strong> {extractedData.issuingAuthority || 'Not found'}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="itemType">Item Type *</Label>
            <Select
              value={formData.itemType}
              onValueChange={(value) => setFormData({ ...formData, itemType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="license">License</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="equipment">Equipment Certification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Cosmetology License"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date *</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                required
              />
            </div>
          </div>

          {employees.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee (Optional)</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Business-wide</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="issuingAuthority">Issuing Authority</Label>
            <Input
              id="issuingAuthority"
              value={formData.issuingAuthority}
              onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
              placeholder="e.g., California Board of Barbering and Cosmetology"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewalFrequency">Renewal Frequency</Label>
            <Select
              value={formData.renewalFrequency}
              onValueChange={(value) => setFormData({ ...formData, renewalFrequency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="2 years">Every 2 Years</SelectItem>
                <SelectItem value="3 years">Every 3 Years</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional information..."
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
                  Saving...
                </>
              ) : (
                'Save Compliance Item'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


