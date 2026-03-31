'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from '@/components/translation-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Send, Loader2, Plus, Settings, Eye as EyeIcon, Eye as EyeOffIcon, Save, Mail, Users, MailCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Audience {
  id: string
  label: string
  count: number
  description: string
}

interface Campaign {
  id: number
  name: string
  subject: string
  body_html: string
  audience_type: string
  status: string
  total_recipients: number
  sent_count: number
  failed_count: number
  has_action_button: boolean
  action_button_text?: string
  action_button_url?: string
  created_at: string
  sent_at?: string
}

export function BulkEmailCampaignClient() {
  const t = useTranslations()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [isLoadingAudiences, setIsLoadingAudiences] = useState(true)
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    body_html: '',
    audience_type: '',
    has_action_button: false,
    action_button_text: '',
    action_button_url: '',
    action_button_style: 'primary',
    include_logo: true,
  })
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [editCampaignData, setEditCampaignData] = useState({
    name: '',
    subject: '',
    body_html: '',
    has_action_button: false,
    action_button_text: '',
    action_button_url: '',
    action_button_style: 'primary',
    include_logo: true,
  })
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [confirmSendOpen, setConfirmSendOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  useEffect(() => {
    fetchAudiences()
    fetchCampaigns()
  }, [])

  const fetchAudiences = async () => {
    try {
      setIsLoadingAudiences(true)
      const response = await fetch(`${API_BASE_URL}/admin/email-campaigns/audience-options`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.status === 'success') {
        setAudiences(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch audiences:', error)
      toast.error('Failed to load audience options')
    } finally {
      setIsLoadingAudiences(false)
    }
  }

  const fetchCampaigns = async () => {
    try {
      setIsLoadingCampaigns(true)
      const response = await fetch(`${API_BASE_URL}/admin/email-campaigns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.status === 'success') {
        setCampaigns(data.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
      toast.error('Failed to load campaigns')
    } finally {
      setIsLoadingCampaigns(false)
    }
  }

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.body_html || !newCampaign.audience_type) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch(`${API_BASE_URL}/admin/email-campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCampaign),
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast.success('Campaign created successfully')
        setCreateDialogOpen(false)
        setNewCampaign({
          name: '',
          subject: '',
          body_html: '',
          audience_type: '',
          has_action_button: false,
          action_button_text: '',
          action_button_url: '',
          action_button_style: 'primary',
          include_logo: true,
        })
        fetchCampaigns()
      } else {
        toast.error(data.message || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Failed to create campaign:', error)
      toast.error('Failed to create campaign')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setEditCampaignData({
      name: campaign.name,
      subject: campaign.subject,
      body_html: campaign.body_html,
      has_action_button: campaign.has_action_button,
      action_button_text: campaign.action_button_text || '',
      action_button_url: campaign.action_button_url || '',
      action_button_style: campaign.action_button_style || 'primary',
      include_logo: campaign.include_logo || true,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return

    if (!editCampaignData.name || !editCampaignData.subject || !editCampaignData.body_html) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsUpdating(true)
      const response = await fetch(`${API_BASE_URL}/admin/email-campaigns/${editingCampaign.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editCampaignData),
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast.success('Campaign updated successfully')
        setEditDialogOpen(false)
        setEditingCampaign(null)
        setEditCampaignData({
          name: '',
          subject: '',
          body_html: '',
          has_action_button: false,
          action_button_text: '',
          action_button_url: '',
          action_button_style: 'primary',
          include_logo: true,
        })
        fetchCampaigns()
      } else {
        toast.error(data.message || 'Failed to update campaign')
      }
    } catch (error) {
      console.error('Failed to update campaign:', error)
      toast.error('Failed to update campaign')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePreview = async (campaign: Campaign) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/email-campaigns/${campaign.id}/preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_data: {
            name: 'Sample User',
            email: 'sample@example.com',
          },
        }),
      })
      const data = await response.json()
      if (data.status === 'success') {
        setPreviewHtml(data.preview_html)
        setPreviewOpen(true)
      }
    } catch (error) {
      console.error('Failed to generate preview:', error)
      toast.error('Failed to generate preview')
    }
  }

  const handlePrepareCampaign = async (campaign: Campaign) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/email-campaigns/${campaign.id}/prepare`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast.success(`Campaign prepared for ${data.data.total_recipients} recipients`)
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Failed to prepare campaign:', error)
      toast.error('Failed to prepare campaign')
    }
  }

  const handleSendCampaign = async () => {
    if (!selectedCampaign) return

    try {
      setIsSending(true)
      const response = await fetch(`${API_BASE_URL}/admin/email-campaigns/${selectedCampaign.id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast.success(data.message || 'Campaign sent successfully')
        setConfirmSendOpen(false)
        setSelectedCampaign(null)
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Failed to send campaign:', error)
      toast.error('Failed to send campaign')
    } finally {
      setIsSending(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>
      case 'sending':
        return <Badge className="bg-yellow-500">Sending...</Badge>
      case 'sent':
        return <Badge className="bg-green-500">Sent</Badge>
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Bulk Email Campaigns</h2>
          <p className="text-gray-600 mt-1">Create and send emails to selected audiences</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Email Campaign</DialogTitle>
            <DialogDescription>
              Set up a new email campaign to send to your selected audience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Campaign Name</Label>
              <Input
                placeholder="e.g., Winter Newsletter 2024"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email Subject *</Label>
              <Input
                placeholder="e.g., Exclusive Winter Offers for You"
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
              />
            </div>

            <div>
              <Label>Target Audience *</Label>
              <Select value={newCampaign.audience_type} onValueChange={(value) => setNewCampaign({ ...newCampaign, audience_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingAudiences ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    audiences.map((audience) => (
                      <SelectItem key={audience.id} value={audience.id}>
                        {audience.label} ({audience.count})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Email Body (HTML) *</Label>
              <Textarea
                placeholder="Your email content here..."
                value={newCampaign.body_html}
                onChange={(e) => setNewCampaign({ ...newCampaign, body_html: e.target.value })}
                className="min-h-[200px]"
              />
              <p className="text-sm text-gray-5 00 mt-2">You can use HTML to format your content</p>
            </div>

            {/* Action Button */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasActionButton"
                  checked={newCampaign.has_action_button}
                  onChange={(e) => setNewCampaign({ ...newCampaign, has_action_button: e.target.checked })}
                />
                <Label htmlFor="hasActionButton">Include Action Button</Label>
              </div>

              {newCampaign.has_action_button && (
                <>
                  <Input
                    placeholder="Button text (e.g., 'Learn More')"
                    value={newCampaign.action_button_text}
                    onChange={(e) => setNewCampaign({ ...newCampaign, action_button_text: e.target.value })}
                  />
                  <Input
                    placeholder="Button URL (e.g., 'https://example.com')"
                    value={newCampaign.action_button_url}
                    onChange={(e) => setNewCampaign({ ...newCampaign, action_button_url: e.target.value })}
                  />
                  <Select value={newCampaign.action_button_style} onValueChange={(value) => setNewCampaign({ ...newCampaign, action_button_style: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary (Purple)</SelectItem>
                      <SelectItem value="secondary">Secondary (Gray)</SelectItem>
                      <SelectItem value="success">Success (Green)</SelectItem>
                      <SelectItem value="danger">Danger (Red)</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeLogo"
                checked={newCampaign.include_logo}
                onChange={(e) => setNewCampaign({ ...newCampaign, include_logo: e.target.checked })}
              />
              <Label htmlFor="includeLogo">Include Company Logo in Email</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={isCreating} className="gap-2">
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Campaign</DialogTitle>
            <DialogDescription>
              Update your email campaign details. Campaign will remain in draft status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Campaign Name</Label>
              <Input
                placeholder="e.g., Winter Newsletter 2024"
                value={editCampaignData.name}
                onChange={(e) => setEditCampaignData({ ...editCampaignData, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email Subject *</Label>
              <Input
                placeholder="e.g., Exclusive Winter Offers for You"
                value={editCampaignData.subject}
                onChange={(e) => setEditCampaignData({ ...editCampaignData, subject: e.target.value })}
              />
            </div>

            <div>
              <Label>Email Body (HTML) *</Label>
              <Textarea
                placeholder="Your email content here..."
                value={editCampaignData.body_html}
                onChange={(e) => setEditCampaignData({ ...editCampaignData, body_html: e.target.value })}
                className="min-h-[200px]"
              />
              <p className="text-sm text-gray-500 mt-2">You can use HTML to format your content</p>
            </div>

            {/* Action Button */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editHasActionButton"
                  checked={editCampaignData.has_action_button}
                  onChange={(e) => setEditCampaignData({ ...editCampaignData, has_action_button: e.target.checked })}
                />
                <Label htmlFor="editHasActionButton">Include Action Button</Label>
              </div>

              {editCampaignData.has_action_button && (
                <>
                  <Input
                    placeholder="Button text (e.g., 'Learn More')"
                    value={editCampaignData.action_button_text}
                    onChange={(e) => setEditCampaignData({ ...editCampaignData, action_button_text: e.target.value })}
                  />
                  <Input
                    placeholder="Button URL (e.g., 'https://example.com')"
                    value={editCampaignData.action_button_url}
                    onChange={(e) => setEditCampaignData({ ...editCampaignData, action_button_url: e.target.value })}
                  />
                  <Select value={editCampaignData.action_button_style} onValueChange={(value) => setEditCampaignData({ ...editCampaignData, action_button_style: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary (Purple)</SelectItem>
                      <SelectItem value="secondary">Secondary (Gray)</SelectItem>
                      <SelectItem value="success">Success (Green)</SelectItem>
                      <SelectItem value="danger">Danger (Red)</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIncludeLogo"
                checked={editCampaignData.include_logo}
                onChange={(e) => setEditCampaignData({ ...editCampaignData, include_logo: e.target.checked })}
              />
              <Label htmlFor="editIncludeLogo">Include Company Logo in Email</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCampaign} disabled={isUpdating} className="gap-2">
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden bg-white" style={{ minHeight: '600px' }}>
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              style={{ minHeight: '600px' }}
              title="Email Preview"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Send Dialog */}
      <AlertDialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCampaign && (
                <span className="block space-y-2">
                  <span className="block">You're about to send this campaign to <strong>{selectedCampaign.total_recipients} recipients</strong>.</span>
                  <span className="block">This action cannot be undone. Make sure everything is correct!</span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendCampaign}
              disabled={isSending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Campaigns List */}
      {isLoadingCampaigns ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No campaigns yet</p>
            <p className="text-gray-500 text-sm">Create your first email campaign to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription className="mt-1">{campaign.subject}</CardDescription>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Recipients</p>
                    <p className="text-2xl font-bold text-gray-900">{campaign.total_recipients}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Sent</p>
                    <p className="text-2xl font-bold text-blue-600">{campaign.sent_count}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{campaign.failed_count}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Audience</p>
                    <p className="text-lg font-bold text-purple-600 capitalize">{campaign.audience_type.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(campaign)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>

                  {campaign.status === 'draft' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCampaign(campaign)}
                        className="gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrepareCampaign(campaign)}
                        className="gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Prepare
                      </Button>
                    </>
                  )}

                  {campaign.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCampaign(campaign)
                        setConfirmSendOpen(true)
                      }}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4" />
                      Send Now
                    </Button>
                  )}

                  {campaign.status === 'sent' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Sent {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : ''}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
