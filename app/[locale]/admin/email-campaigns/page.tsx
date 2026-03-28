'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { BulkEmailCampaignClient } from '@/components/admin/bulk-email-campaign-client'

export default function BulkEmailCampaignPage() {
  return (
    <DashboardLayout userType="admin">
      <BulkEmailCampaignClient />
    </DashboardLayout>
  )
}
