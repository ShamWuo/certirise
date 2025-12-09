'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Employee } from '@/lib/types/database'
import { Plus, Users, Edit, Trash2, Loader2, Key, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/lib/hooks/use-toast'

interface EmployeesManagerProps {
  businessId: string
  initialEmployees: Employee[]
}

export function EmployeesManager({ businessId, initialEmployees }: EmployeesManagerProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)
  const [portalToken, setPortalToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

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
      toast({
        title: 'Success',
        description: editingEmployee ? 'Employee updated successfully' : 'Employee added successfully',
        variant: 'success',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to save employee. Please try again.',
        variant: 'destructive',
      })
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

  const handleDeleteClick = (id: string) => {
    setEmployeeToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!employeeToDelete) return

    setLoading(true)
    try {
      const response = await fetch(`/api/employees/${employeeToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete employee')
      }

      setEmployees(employees.filter(e => e.id !== employeeToDelete))
      setDeleteConfirmOpen(false)
      setEmployeeToDelete(null)
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
        variant: 'success',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to delete employee. Please try again.',
        variant: 'destructive',
      })
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
      setPortalToken(token)
      
      // Refresh employees list
      const refreshResponse = await fetch('/api/employees')
      const { employees: updatedEmployees } = await refreshResponse.json()
      setEmployees(updatedEmployees)
      
      toast({
        title: 'Portal token generated',
        description: 'Token copied to clipboard. Share it with the employee.',
        variant: 'success',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to generate portal token. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const copyToken = async () => {
    if (portalToken) {
      await navigator.clipboard.writeText(portalToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: 'Copied!',
        description: 'Portal token copied to clipboard',
        variant: 'success',
      })
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
                      onClick={() => handleDeleteClick(employee.id)}
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

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this employee and all associated compliance items.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {portalToken && (
        <Dialog open={!!portalToken} onOpenChange={() => setPortalToken(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Portal Access Token</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share this token with the employee for portal access. Keep it secure.
              </p>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm font-mono break-all">
                  {portalToken}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToken}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

