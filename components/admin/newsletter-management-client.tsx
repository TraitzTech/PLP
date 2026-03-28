'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from '@/components/translation-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, Users, TrendingUp, Download, Loader2, Edit2, Trash2, MoreVertical, CheckCircle, XCircle, Calendar, Activity } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NewsletterSubscriber {
  id: number
  email: string
  name?: string
  is_active: boolean
  subscribed_at: string
  unsubscribed_at?: string
}

interface SubscriberStats {
  total: number
  active: number
  inactive: number
  this_month: number
  last_month: number
}

export function NewsletterManagementClient() {
  const t = useTranslations()
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [stats, setStats] = useState<SubscriberStats | null>(null)
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [editingSubscriber, setEditingSubscriber] = useState<NewsletterSubscriber | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingSubscriber, setDeletingSubscriber] = useState<NewsletterSubscriber | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([])
  const [bulkActionOpen, setBulkActionOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete' | ''>('')

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  useEffect(() => {
    fetchStats()
    fetchSubscribers()
  }, [searchQuery, statusFilter, currentPage])

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch(`${API_BASE_URL}/admin/newsletter/statistics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.status === 'success') {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const fetchSubscribers = async () => {
    try {
      setIsLoadingSubscribers(true)
      let url = `${API_BASE_URL}/admin/newsletter-subscribers?page=${currentPage}`
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`
      if (statusFilter !== 'all') url += `&status=${statusFilter}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.status === 'success') {
        setSubscribers(data.data.data)
        setTotalPages(data.data.last_page)
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
      toast.error('Failed to load subscribers')
    } finally {
      setIsLoadingSubscribers(false)
    }
  }

  const handleUpdateSubscriber = async () => {
    if (!editingSubscriber) return

    try {
      setIsProcessing(true)
      const response = await fetch(`${API_BASE_URL}/admin/newsletter-subscribers/${editingSubscriber.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingSubscriber.name,
          is_active: editingSubscriber.is_active,
        }),
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast.success('Subscriber updated successfully')
        setEditDialogOpen(false)
        fetchSubscribers()
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to update subscriber')
      }
    } catch (error) {
      console.error('Failed to update subscriber:', error)
      toast.error('Failed to update subscriber')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteSubscriber = async () => {
    if (!deletingSubscriber) return

    try {
      setIsProcessing(true)
      const response = await fetch(`${API_BASE_URL}/admin/newsletter-subscribers/${deletingSubscriber.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast.success('Subscriber deleted successfully')
        setDeleteConfirmOpen(false)
        setDeletingSubscriber(null)
        fetchSubscribers()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to delete subscriber:', error)
      toast.error('Failed to delete subscriber')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSubscribers.length === 0) return

    try {
      setIsProcessing(true)
      const response = await fetch(`${API_BASE_URL}/admin/newsletter/bulk-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriber_ids: selectedSubscribers,
          action: bulkAction,
        }),
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast.success(`${data.affected} subscribers updated successfully`)
        setBulkActionOpen(false)
        setSelectedSubscribers([])
        setBulkAction('')
        fetchSubscribers()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
      toast.error('Failed to perform bulk action')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    try {
      let url = `${API_BASE_URL}/admin/newsletter/export`
      if (statusFilter !== 'all') url += `?status=${statusFilter}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(downloadUrl)
      toast.success('Export completed successfully')
    } catch (error) {
      console.error('Failed to export:', error)
      toast.error('Failed to export subscribers')
    }
  }

  const toggleSubscriber = (id: number) => {
    setSelectedSubscribers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleAllSubscribers = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([])
    } else {
      setSelectedSubscribers(subscribers.map((s) => s.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Newsletter Management</h2>
          <p className="text-gray-600 mt-1">Manage your newsletter subscribers and send campaigns</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-green-700 mt-1">{((stats.active / (stats.total || 1)) * 100).toFixed(0)}% active</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <p className="text-xs text-red-700 mt-1">Unsubscribed</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.this_month}</div>
              <p className="text-xs text-blue-700 mt-1">New subscriptions</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Last Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.last_month}</div>
              <p className="text-xs text-purple-700 mt-1">Previous month</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters and Search */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('active')
              setCurrentPage(1)
            }}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('inactive')
              setCurrentPage(1)
            }}
          >
            Inactive
          </Button>
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter('all')
              setCurrentPage(1)
            }}
          >
            All
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubscribers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <div className="text-sm font-medium text-blue-900">
            {selectedSubscribers.length} subscriber{selectedSubscribers.length !== 1 ? 's' : ''} selected
          </div>
          <Button
            size="sm"
            onClick={() => setBulkActionOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Activity className="w-4 h-4" />
            Bulk Action
          </Button>
        </div>
      )}

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perform Bulk Action</DialogTitle>
            <DialogDescription>
              Select the action you want to perform on {selectedSubscribers.length} selected subscriber{selectedSubscribers.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Button
              variant={bulkAction === 'activate' ? 'default' : 'outline'}
              onClick={() => setBulkAction('activate')}
              className="w-full justify-start gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Activate
            </Button>
            <Button
              variant={bulkAction === 'deactivate' ? 'default' : 'outline'}
              onClick={() => setBulkAction('deactivate')}
              className="w-full justify-start gap-2"
            >
              <XCircle className="w-4 h-4" />
              Deactivate
            </Button>
            <Button
              variant={bulkAction === 'delete' ? 'destructive' : 'outline'}
              onClick={() => setBulkAction('delete')}
              className="w-full justify-start gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={!bulkAction || isProcessing}
              className={
                bulkAction === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {bulkAction === 'delete' ? 'Delete' : 'Apply Action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
            <DialogDescription>Update subscriber information</DialogDescription>
          </DialogHeader>

          {editingSubscriber && (
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={editingSubscriber.email} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={editingSubscriber.name || ''}
                  onChange={(e) =>
                    setEditingSubscriber({ ...editingSubscriber, name: e.target.value })
                  }
                  placeholder="Subscriber name"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingSubscriber.is_active}
                  onChange={(e) =>
                    setEditingSubscriber({ ...editingSubscriber, is_active: e.target.checked })
                  }
                />
                <Label htmlFor="isActive">Active (receiving emails)</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubscriber} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. The subscriber {deletingSubscriber?.email} will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubscriber}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subscribers Table */}
      {isLoadingSubscribers ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : subscribers.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No subscribers found</p>
            <p className="text-gray-500 text-sm">Your newsletter subscribers will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 px-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0}
                        onChange={toggleAllSubscribers}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subscribed</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(subscriber.id)}
                          onChange={() => toggleSubscriber(subscriber.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{subscriber.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={subscriber.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {subscriber.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(subscriber.subscribed_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingSubscriber(subscriber)
                                setEditDialogOpen(true)
                              }}
                              className="gap-2 cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingSubscriber(subscriber)
                                setDeleteConfirmOpen(true)
                              }}
                              className="gap-2 cursor-pointer text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
