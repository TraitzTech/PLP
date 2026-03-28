'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { NewsletterManagementClient } from '@/components/admin/newsletter-management-client'

export default function NewsletterManagementPage() {
  return (
    <DashboardLayout userType="admin">
      <NewsletterManagementClient />
    </DashboardLayout>
  )
}
