"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'

interface ComplianceItem {
  id: string
  name: string
  item_type: string | null
  status: string | null
  expiration_date: string | null
  license_number: string | null
  document_url: string | null
  issuing_authority: string | null
  renewal_frequency: string | null
}

interface EmployeeData {
  id: string
  name: string
  email: string | null
  phone: string | null
}

export default function EmployeePortalPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const initialToken = searchParams.get('token') || ''
  const [token, setToken] = useState(initialToken)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employee, setEmployee] = useState<EmployeeData | null>(null)
  const [items, setItems] = useState<ComplianceItem[]>([])

  const employeeId = useMemo(() => (Array.isArray(params?.id) ? params.id[0] : params?.id), [params])

  const fetchData = async (providedToken: string) => {
    if (!employeeId) return
    if (!providedToken) {
      setError('Portal token required')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/portal/employee/${employeeId}?token=${encodeURIComponent(providedToken)}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Unable to load portal data')
        setEmployee(null)
        setItems([])
        return
      }

      setEmployee(data.employee)
      setItems(data.items)
    } catch (err: any) {
      setError(err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialToken) {
      fetchData(initialToken)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken, employeeId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData(token.trim())
  }

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Employee Portal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Enter portal token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Button type="submit" disabled={loading} className="sm:w-36">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading
                  </>
                ) : (
                  'View Portal'
                )}
              </Button>
            </form>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {employee && (
          <Card>
            <CardHeader>
              <CardTitle>{employee.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {employee.email && <div>Email: {employee.email}</div>}
              {employee.phone && <div>Phone: {employee.phone}</div>}
            </CardContent>
          </Card>
        )}

        {employee && (
          <Card>
            <CardHeader>
              <CardTitle>Compliance Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items found for this employee.</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded border p-4 bg-white shadow-sm"
                    >
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        <div>Status: {item.status || 'n/a'}</div>
                        <div>Type: {item.item_type || 'n/a'}</div>
                        <div>Expiration: {item.expiration_date || 'n/a'}</div>
                        {item.license_number && <div>License #: {item.license_number}</div>}
                        {item.issuing_authority && <div>Authority: {item.issuing_authority}</div>}
                        {item.renewal_frequency && <div>Frequency: {item.renewal_frequency}</div>}
                        {item.document_url && (
                          <div>
                            Document: <a className="text-primary" href={item.document_url} target="_blank" rel="noreferrer">View</a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
