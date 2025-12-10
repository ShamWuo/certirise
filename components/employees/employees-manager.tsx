'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Employee } from '@/lib/types/database'
import { Plus, Users, Edit, Trash2, Loader2, Key } from 'lucide-react'
import Link from 'next/link'

interface EmployeesManagerProps {
  businessId: string
  initialEmployees: Employee[]
}

export function EmployeesManager({ businessId, initialEmployees }: EmployeesManagerProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    portal_enabled: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingEmployee
        ? `/api/employees/${editingEmployee.id}`
        : '/api/employees'
      const method = editingEmployee ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save employee')
      }

      const { employee } = await response.json()
      
      if (editingEmployee) {
        setEmployees(employees.map(e => e.id === employee.id ? employee : e))
      } else {
        setEmployees([...employees, employee])
      }

      setIsDialogOpen(false)
      setEditingEmployee(null)
      setFormData({
        name: '',
        role: '',
        email: '',
        phone: '',
        portal_enabled: false,
      })
    } catch (error) {
      console.error(error)
      alert('Failed to save employee. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      role: employee.role || '',
      email: employee.email || '',
      phone: employee.phone || '',
      portal_enabled: employee.portal_enabled,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete employee')
      }

      setEmployees(employees.filter(e => e.id !== id))
    } catch (error) {
      console.error(error)
      alert('Failed to delete employee. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generatePortalToken = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/portal-token`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate portal token')
      }

      const { token } = await response.json()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const portalLink = origin
        ? `${origin}/employee/${employeeId}?token=${token}`
        : `Portal link: /employee/${employeeId}?token=${token}`

      alert(`Portal access token: ${token}\n\nShareable link:\n${portalLink}`)
      
      // Refresh employees list
      const refreshResponse = await fetch('/api/employees')
      const { employees: updatedEmployees } = await refreshResponse.json()
      setEmployees(updatedEmployees)
    } catch (error) {
      console.error(error)
      alert('Failed to generate portal token. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingEmployee(null)
              setFormData({
                name: '',
                role: '',
                email: '',
                phone: '',
                portal_enabled: false,
              })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Cosmetologist, Barber"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
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
                    'Save Employee'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees yet</h3>
              <p className="text-muted-foreground mb-4">
                Add team members to track their individual certifications and licenses.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {employees.map((employee) => (
            <Card key={employee.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      {employee.name}
                    </CardTitle>
                    {employee.role && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {employee.role}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {employee.portal_enabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePortalToken(employee.id)}
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Portal Token
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {(employee.phone || employee.email) && (
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {employee.phone && <span>📞 {employee.phone}</span>}
                    {employee.email && <span>✉️ {employee.email}</span>}
                  </div>
                  {employee.portal_enabled && (
                    <div className="mt-2">
                      <Link href={`/employee/${employee.id}`}>
                        <Button variant="link" size="sm">
                          View Employee Portal
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

